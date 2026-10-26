import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_NAME = "store-logos";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uzzdhxpvinzufwihhmcq.supabase.co";

/**
 * Returns whether elevated Supabase Storage credentials are configured on the server.
 */
export function isSupabaseStorageConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("REPLACE_WITH"));
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a trusted server-side Supabase client for storage operations.
 * Elevated service keys must never be exposed to the browser.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
  cachedClient = createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * Generates the permanent public URL for a file stored in the public store-logos bucket.
 */
export function getPublicLogoUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  const cleanPath = storagePath.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

/**
 * Checks if a URL is managed in our Supabase store-logos bucket.
 */
export function isManagedLogoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes(`/storage/v1/object/public/${BUCKET_NAME}/`) ||
    url.includes(`/${BUCKET_NAME}/`)
  );
}

/**
 * Extracts the storage relative path (e.g. "seller_123/logo-1729851234.png") from a public URL.
 */
export function extractStoragePath(url: string | null | undefined): string | null {
  if (!url || !isManagedLogoUrl(url)) return null;

  const publicPrefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const idx = url.indexOf(publicPrefix);
  if (idx !== -1) {
    return decodeURIComponent(url.slice(idx + publicPrefix.length));
  }

  const bucketPrefix = `/${BUCKET_NAME}/`;
  const bIdx = url.indexOf(bucketPrefix);
  if (bIdx !== -1) {
    return decodeURIComponent(url.slice(bIdx + bucketPrefix.length));
  }

  return null;
}
