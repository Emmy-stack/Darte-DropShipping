export interface StoreProfileData {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string;
  state: string | null;
  city: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  orderProcessingInfo: string | null;
  customerSupportInstructions: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProfileInput {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  category?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  shippingPolicy?: string | null;
  returnPolicy?: string | null;
  orderProcessingInfo?: string | null;
  customerSupportInstructions?: string | null;
  isPublished?: boolean;
}

export interface PublicStoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  category: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string;
  state: string | null;
  city: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  orderProcessingInfo: string | null;
  customerSupportInstructions: string | null;
  isPublished: boolean;
  productCount: number;
}

export interface PublicStoreProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number; // Seller's custom retail selling price in Naira
  inStock: boolean;
  stock?: number;
  tags: string[];
  badges: string[];
  variants?: unknown;
  shippingInfo?: unknown;
  specifications?: unknown;
  addedAt?: string;
}

export type StorefrontSortOption = "default" | "price-asc" | "price-desc" | "name-asc";

export type ProfileCompletenessStatus = "not_configured" | "incomplete" | "complete";

export interface ProfileCompleteness {
  status: ProfileCompletenessStatus;
  percentage: number;
  completedFields: string[];
  missingFields: string[];
}

export const RESERVED_SLUGS = new Set([
  "api",
  "dashboard",
  "onboarding",
  "sign-in",
  "sign-up",
  "admin",
  "settings",
  "store",
  "products",
  "supplier",
  "login",
  "logout",
  "app",
  "help",
  "support",
  "terms",
  "privacy",
  "auth",
  "orders",
  "catalog",
  "cart",
  "checkout",
  "account",
  "darte",
  "shop",
  "blog",
  "pricing",
  "contact",
  "about",
  "null",
  "undefined",
]);

/**
 * Normalizes a raw string into a clean, URL-friendly slug.
 */
export function normalizeSlug(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/['’]/g, "") // strip apostrophes so Emmy's -> emmys
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

/**
 * Validates a normalized slug.
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: "Store slug is required." };
  }
  if (slug.length < 3) {
    return { valid: false, error: "Store slug must be at least 3 characters." };
  }
  if (slug.length > 50) {
    return { valid: false, error: "Store slug cannot exceed 50 characters." };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      valid: false,
      error: "Store slug can only contain lowercase letters, numbers, and single hyphens.",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return {
      valid: false,
      error: `'${slug}' is a reserved Darté system identifier. Please choose another slug.`,
    };
  }
  return { valid: true };
}

/**
 * Computes profile completeness based on required and core business fields.
 */
export function calculateProfileCompleteness(
  profile: StoreProfileData | null
): ProfileCompleteness {
  if (!profile || !profile.name || !profile.slug) {
    return {
      status: "not_configured",
      percentage: 0,
      completedFields: [],
      missingFields: [
        "Store Name",
        "Store Slug",
        "Description",
        "Business Category",
        "Contact Email",
        "Phone Number",
        "State",
        "City",
      ],
    };
  }

  const checklist: { label: string; value: unknown }[] = [
    { label: "Store Name", value: profile.name },
    { label: "Store Slug", value: profile.slug },
    { label: "Description", value: profile.description },
    { label: "Business Category", value: profile.category },
    { label: "Contact Email", value: profile.contactEmail },
    { label: "Phone Number", value: profile.contactPhone },
    { label: "State", value: profile.state },
    { label: "City", value: profile.city },
  ];

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  for (const item of checklist) {
    if (typeof item.value === "string" && item.value.trim().length > 0) {
      completedFields.push(item.label);
    } else {
      missingFields.push(item.label);
    }
  }

  const percentage = Math.round((completedFields.length / checklist.length) * 100);

  let status: ProfileCompletenessStatus = "incomplete";
  if (completedFields.length === checklist.length) {
    status = "complete";
  } else if (completedFields.length === 0) {
    status = "not_configured";
  }

  return {
    status,
    percentage,
    completedFields,
    missingFields,
  };
}
