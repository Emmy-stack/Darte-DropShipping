import { SupabaseClient } from "@supabase/supabase-js";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  getSupabaseAdminClient,
  BUCKET_NAME,
  getPublicLogoUrl,
  isManagedLogoUrl,
  extractStoragePath,
} from "@/lib/supabase/server";
import {
  validateLogoFile,
  generateSafeStoragePath,
} from "@/lib/storage/logoValidation";
import { getSellerStoreProfile } from "@/lib/db/storeProfile";

export interface UploadLogoParams {
  sellerId: string;
  fileBuffer: Buffer;
  mimeType: string;
  fileSize: number;
  originalFilename?: string;
  // Optional storage client override for testing/mocking
  customStorageClient?: SupabaseClient;
}

export interface UploadLogoResult {
  success: boolean;
  logoUrl: string;
  storagePath: string;
  previousCleanedUp: boolean;
}

export interface DeleteLogoParams {
  sellerId: string;
  customStorageClient?: SupabaseClient;
}

export interface DeleteLogoResult {
  success: boolean;
  message: string;
  fileRemovedFromStorage: boolean;
}

/**
 * Uploads a store logo to Supabase Storage and updates the StoreProfile record in PostgreSQL.
 */
export async function uploadStoreLogo(params: UploadLogoParams): Promise<UploadLogoResult> {
  const { sellerId, fileBuffer, mimeType, fileSize, customStorageClient } = params;

  if (!sellerId || sellerId.trim().length === 0) {
    throw new Error("Unauthorized: Seller ID is required.");
  }

  // 1. Validate file size, claimed MIME, and binary magic bytes
  const validation = validateLogoFile(fileBuffer, mimeType, fileSize);
  if (!validation.valid || !validation.extension || !validation.detectedMime) {
    throw new Error(validation.error || "Invalid logo file.");
  }

  // 2. Resolve Supabase storage client
  const client = customStorageClient ?? getSupabaseAdminClient();
  if (!client) {
    throw new Error(
      "Supabase Storage credentials are not configured on the server. Please configure SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY."
    );
  }

  // 3. Ensure seller store profile exists
  let existingProfile = null;
  try {
    const res = await getSellerStoreProfile(sellerId);
    existingProfile = res.profile;
  } catch (err) {
    console.warn("Could not retrieve current profile during logo upload:", err);
  }

  const previousLogoUrl = existingProfile?.logoUrl || null;

  // 4. Generate safe seller-scoped storage path
  const storagePath = generateSafeStoragePath(sellerId, validation.extension);

  // 5. Upload file buffer to Supabase Storage bucket
  const { error: uploadError } = await client.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: validation.detectedMime,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 6. Compute permanent public URL
  const publicUrl = getPublicLogoUrl(storagePath);

  // 7. Update PostgreSQL StoreProfile
  if (isDatabaseConfigured()) {
    try {
      await prisma.storeProfile.upsert({
        where: { sellerId },
        update: {
          logoUrl: publicUrl,
        },
        create: {
          sellerId,
          name: existingProfile?.name || "My Store",
          slug: existingProfile?.slug || `store-${sellerId.slice(-6)}`,
          logoUrl: publicUrl,
          country: existingProfile?.country || "Nigeria",
        },
      });
    } catch (dbErr: unknown) {
      // If database update fails, cleanup the newly uploaded file to avoid orphaned storage
      try {
        await client.storage.from(BUCKET_NAME).remove([storagePath]);
      } catch (cleanupErr) {
        console.warn("Failed to cleanup newly uploaded file after DB failure:", cleanupErr);
      }
      throw new Error(
        `Failed to persist logo in database: ${
          dbErr instanceof Error ? dbErr.message : "Database error"
        }`
      );
    }
  }

  // 8. Cleanup old managed logo file if it was previously stored in our bucket
  let previousCleanedUp = false;
  if (previousLogoUrl && isManagedLogoUrl(previousLogoUrl)) {
    const oldPath = extractStoragePath(previousLogoUrl);
    // Ensure the old path belongs to the same seller to prevent cross-tenant deletion
    if (oldPath && oldPath.startsWith(`${sellerId.replace(/[^a-zA-Z0-9_-]/g, "")}/`)) {
      try {
        const { error: removeError } = await client.storage
          .from(BUCKET_NAME)
          .remove([oldPath]);
        if (!removeError) {
          previousCleanedUp = true;
        } else {
          console.warn("Old logo storage cleanup notice:", removeError.message);
        }
      } catch (cleanupErr) {
        console.warn("Failed to remove previous logo from storage:", cleanupErr);
      }
    }
  }

  return {
    success: true,
    logoUrl: publicUrl,
    storagePath,
    previousCleanedUp,
  };
}

/**
 * Removes a seller's store logo from Supabase Storage and clears the logoUrl field in PostgreSQL.
 */
export async function deleteStoreLogo(params: DeleteLogoParams): Promise<DeleteLogoResult> {
  const { sellerId, customStorageClient } = params;

  if (!sellerId || sellerId.trim().length === 0) {
    throw new Error("Unauthorized: Seller ID is required.");
  }

  // 1. Retrieve current store profile
  let existingProfile = null;
  try {
    const res = await getSellerStoreProfile(sellerId);
    existingProfile = res.profile;
  } catch (err) {
    console.warn("Could not retrieve current profile during logo deletion:", err);
  }

  const currentLogoUrl = existingProfile?.logoUrl || null;
  let fileRemovedFromStorage = false;

  // 2. Remove file from Supabase Storage if managed in our bucket
  if (currentLogoUrl && isManagedLogoUrl(currentLogoUrl)) {
    const client = customStorageClient ?? getSupabaseAdminClient();
    if (client) {
      const storagePath = extractStoragePath(currentLogoUrl);
      const cleanSellerId = sellerId.replace(/[^a-zA-Z0-9_-]/g, "");

      // Verify the path strictly belongs to the seller before removing
      if (storagePath && storagePath.startsWith(`${cleanSellerId}/`)) {
        try {
          const { error } = await client.storage.from(BUCKET_NAME).remove([storagePath]);
          if (!error) {
            fileRemovedFromStorage = true;
          } else {
            console.warn("Storage deletion notice:", error.message);
          }
        } catch (storageErr) {
          console.warn("Error removing logo from storage:", storageErr);
        }
      }
    }
  }

  // 3. Clear logoUrl in PostgreSQL
  if (isDatabaseConfigured()) {
    try {
      await prisma.storeProfile.updateMany({
        where: { sellerId },
        data: {
          logoUrl: null,
        },
      });
    } catch (dbErr) {
      throw new Error(
        `Failed to update database profile: ${
          dbErr instanceof Error ? dbErr.message : "Database error"
        }`
      );
    }
  }

  return {
    success: true,
    message: "Store logo removed successfully.",
    fileRemovedFromStorage,
  };
}
