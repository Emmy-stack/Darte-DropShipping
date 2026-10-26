import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getUserProfile, ensureDB, persistDB } from "@/lib/db/profileStore";
import {
  StoreProfileData,
  StoreProfileInput,
  ProfileCompleteness,
  normalizeSlug,
  validateSlug,
  calculateProfileCompleteness,
} from "@/types/store";

export * from "@/types/store";

/**
 * Checks whether a given slug is available for a seller.
 */
export async function isSlugAvailable(
  rawSlug: string,
  currentSellerId?: string
): Promise<{ available: boolean; normalizedSlug: string; reason?: string }> {
  const normalizedSlug = normalizeSlug(rawSlug);
  const validation = validateSlug(normalizedSlug);

  if (!validation.valid) {
    return {
      available: false,
      normalizedSlug,
      reason: validation.error,
    };
  }

  if (isDatabaseConfigured()) {
    try {
      const existing = await prisma.storeProfile.findUnique({
        where: { slug: normalizedSlug },
        select: { sellerId: true },
      });

      if (existing) {
        if (currentSellerId && existing.sellerId === currentSellerId) {
          return { available: true, normalizedSlug };
        }
        return {
          available: false,
          normalizedSlug,
          reason: "This store slug is already claimed by another seller.",
        };
      }
    } catch (err) {
      console.warn("Database slug availability check warning:", err);
    }
  }

  return { available: true, normalizedSlug };
}

/**
 * Retrieves the store profile for the authenticated seller.
 * If the seller has onboarding data in data/darte_db.json but no PostgreSQL StoreProfile yet,
 * automatically initializes a StoreProfile from the onboarding information.
 */
export async function getSellerStoreProfile(
  sellerId: string
): Promise<{ profile: StoreProfileData | null; completeness: ProfileCompleteness }> {
  if (!sellerId) {
    return { profile: null, completeness: calculateProfileCompleteness(null) };
  }

  if (isDatabaseConfigured()) {
    try {
      const dbProfile = await prisma.storeProfile.findUnique({
        where: { sellerId },
      });

      if (dbProfile) {
        const mapped: StoreProfileData = {
          id: dbProfile.id,
          sellerId: dbProfile.sellerId,
          name: dbProfile.name,
          slug: dbProfile.slug,
          description: dbProfile.description,
          logoUrl: dbProfile.logoUrl,
          category: dbProfile.category,
          contactEmail: dbProfile.contactEmail,
          contactPhone: dbProfile.contactPhone,
          country: dbProfile.country,
          state: dbProfile.state,
          city: dbProfile.city,
          shippingPolicy: dbProfile.shippingPolicy,
          returnPolicy: dbProfile.returnPolicy,
          orderProcessingInfo: dbProfile.orderProcessingInfo,
          customerSupportInstructions: dbProfile.customerSupportInstructions,
          isPublished: dbProfile.isPublished ?? true,
          createdAt: dbProfile.createdAt.toISOString(),
          updatedAt: dbProfile.updatedAt.toISOString(),
        };

        return {
          profile: mapped,
          completeness: calculateProfileCompleteness(mapped),
        };
      }
    } catch (err) {
      console.warn("Database error in getSellerStoreProfile, inspecting fallback:", err);
    }
  }

  // Check onboarding data in profileStore to auto-seed
  try {
    const userProfile = await getUserProfile(sellerId);
    const db = await ensureDB();
    if (userProfile && db.stores[userProfile.id]) {
      const store = db.stores[userProfile.id];
      const selProfile = db.sellerProfiles[userProfile.id];

      const initialData = {
        name: store.name || "My Store",
        slug: store.slug || normalizeSlug(store.name) || `store-${sellerId.slice(-6)}`,
        description: store.description || selProfile?.storeDescription || null,
        category: store.category || selProfile?.storeCategory || null,
        country: selProfile?.country?.replace(/[^\w\s]/g, "").trim() || "Nigeria",
        state: selProfile?.state || null,
        city: selProfile?.city || null,
        contactPhone: selProfile?.phone || null,
      };

      if (isDatabaseConfigured()) {
        try {
          const created = await prisma.storeProfile.create({
            data: {
              sellerId,
              name: initialData.name,
              slug: initialData.slug,
              description: initialData.description,
              category: initialData.category,
              country: initialData.country || "Nigeria",
              state: initialData.state,
              city: initialData.city,
              contactPhone: initialData.contactPhone,
            },
          });

          const mapped: StoreProfileData = {
            id: created.id,
            sellerId: created.sellerId,
            name: created.name,
            slug: created.slug,
            description: created.description,
            logoUrl: created.logoUrl,
            category: created.category,
            contactEmail: created.contactEmail,
            contactPhone: created.contactPhone,
            country: created.country,
            state: created.state,
            city: created.city,
            shippingPolicy: created.shippingPolicy,
            returnPolicy: created.returnPolicy,
            orderProcessingInfo: created.orderProcessingInfo,
            customerSupportInstructions: created.customerSupportInstructions,
            isPublished: created.isPublished ?? true,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
          };

          return {
            profile: mapped,
            completeness: calculateProfileCompleteness(mapped),
          };
        } catch (dbErr) {
          console.warn("Could not auto-seed StoreProfile into PostgreSQL:", dbErr);
        }
      }

      // Memory/JSON fallback representation
      const fallbackProfile: StoreProfileData = {
        id: `sp_${sellerId}`,
        sellerId,
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || null,
        logoUrl: null,
        category: initialData.category || null,
        contactEmail: null,
        contactPhone: initialData.contactPhone || null,
        country: initialData.country || "Nigeria",
        state: initialData.state || null,
        city: initialData.city || null,
        shippingPolicy: null,
        returnPolicy: null,
        orderProcessingInfo: null,
        customerSupportInstructions: null,
        isPublished: true,
        createdAt: store.createdAt || new Date().toISOString(),
        updatedAt: store.updatedAt || new Date().toISOString(),
      };

      return {
        profile: fallbackProfile,
        completeness: calculateProfileCompleteness(fallbackProfile),
      };
    }
  } catch (err) {
    console.warn("Error resolving fallback store profile:", err);
  }

  return { profile: null, completeness: calculateProfileCompleteness(null) };
}

/**
 * Creates or updates the authenticated seller's store profile in PostgreSQL.
 * Enforces ownership, valid fields, and slug uniqueness constraints.
 */
export async function saveSellerStoreProfile(
  sellerId: string,
  input: StoreProfileInput
): Promise<{ success: boolean; profile: StoreProfileData; completeness: ProfileCompleteness }> {
  if (!sellerId) {
    throw new Error("Unauthorized: Seller ID is required.");
  }

  // 1. Resolve existing profile to support safe partial updates without losing omitted fields
  let existingProfile: StoreProfileData | null = null;
  if (isDatabaseConfigured()) {
    try {
      const existing = await prisma.storeProfile.findUnique({
        where: { sellerId },
      });
      if (existing) {
        existingProfile = {
          id: existing.id,
          sellerId: existing.sellerId,
          name: existing.name,
          slug: existing.slug,
          description: existing.description,
          logoUrl: existing.logoUrl,
          category: existing.category,
          contactEmail: existing.contactEmail,
          contactPhone: existing.contactPhone,
          country: existing.country,
          state: existing.state,
          city: existing.city,
          shippingPolicy: existing.shippingPolicy,
          returnPolicy: existing.returnPolicy,
          orderProcessingInfo: existing.orderProcessingInfo,
          customerSupportInstructions: existing.customerSupportInstructions,
          isPublished: existing.isPublished ?? true,
          createdAt: existing.createdAt.toISOString(),
          updatedAt: existing.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn("Database lookup warning in saveSellerStoreProfile:", err);
    }
  }

  // 2. Validate and resolve target name
  let targetName: string;
  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error("Store name must be at least 2 characters.");
    }
    if (trimmedName.length > 100) {
      throw new Error("Store name cannot exceed 100 characters.");
    }
    targetName = trimmedName;
  } else if (existingProfile?.name) {
    targetName = existingProfile.name;
  } else {
    throw new Error("Store name must be at least 2 characters.");
  }

  // 3. Validate and resolve target slug
  let targetSlug: string;
  if (input.slug !== undefined) {
    const normalizedSlug = normalizeSlug(input.slug || targetName);
    const slugValidation = validateSlug(normalizedSlug);
    if (!slugValidation.valid) {
      throw new Error(slugValidation.error || "Invalid store slug.");
    }
    targetSlug = normalizedSlug;
  } else if (existingProfile?.slug) {
    targetSlug = existingProfile.slug;
  } else {
    const normalizedSlug = normalizeSlug(targetName);
    const slugValidation = validateSlug(normalizedSlug);
    if (!slugValidation.valid) {
      throw new Error(slugValidation.error || "Invalid store slug.");
    }
    targetSlug = normalizedSlug;
  }

  // 4. Validate email format if explicitly provided
  if (input.contactEmail !== undefined && input.contactEmail !== null) {
    const trimmedEmail = input.contactEmail.trim();
    if (trimmedEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error("Please enter a valid email address.");
      }
    }
  }

  // 5. Enforce slug uniqueness against other sellers only when slug changed or is new
  const slugNeedsValidation = !existingProfile || existingProfile.slug !== targetSlug;
  if (slugNeedsValidation && isDatabaseConfigured()) {
    const slugOwner = await prisma.storeProfile.findUnique({
      where: { slug: targetSlug },
      select: { sellerId: true },
    });

    if (slugOwner && slugOwner.sellerId !== sellerId) {
      throw new Error(
        `The store slug '${targetSlug}' is already taken. Please choose another unique URL identifier.`
      );
    }
  }

  // 6. Build merged data: preserve existing fields whenever omitted (undefined) in input
  const cleanData = {
    name: targetName,
    slug: targetSlug,
    description:
      input.description !== undefined
        ? input.description?.trim() || null
        : existingProfile?.description ?? null,
    logoUrl:
      input.logoUrl !== undefined
        ? input.logoUrl?.trim() || null
        : existingProfile?.logoUrl ?? null,
    category:
      input.category !== undefined
        ? input.category?.trim() || null
        : existingProfile?.category ?? null,
    contactEmail:
      input.contactEmail !== undefined
        ? input.contactEmail?.trim() || null
        : existingProfile?.contactEmail ?? null,
    contactPhone:
      input.contactPhone !== undefined
        ? input.contactPhone?.trim() || null
        : existingProfile?.contactPhone ?? null,
    country:
      input.country !== undefined
        ? input.country?.trim() || "Nigeria"
        : existingProfile?.country ?? "Nigeria",
    state:
      input.state !== undefined
        ? input.state?.trim() || null
        : existingProfile?.state ?? null,
    city:
      input.city !== undefined
        ? input.city?.trim() || null
        : existingProfile?.city ?? null,
    shippingPolicy:
      input.shippingPolicy !== undefined
        ? input.shippingPolicy?.trim() || null
        : existingProfile?.shippingPolicy ?? null,
    returnPolicy:
      input.returnPolicy !== undefined
        ? input.returnPolicy?.trim() || null
        : existingProfile?.returnPolicy ?? null,
    orderProcessingInfo:
      input.orderProcessingInfo !== undefined
        ? input.orderProcessingInfo?.trim() || null
        : existingProfile?.orderProcessingInfo ?? null,
    customerSupportInstructions:
      input.customerSupportInstructions !== undefined
        ? input.customerSupportInstructions?.trim() || null
        : existingProfile?.customerSupportInstructions ?? null,
    isPublished:
      input.isPublished !== undefined
        ? Boolean(input.isPublished)
        : existingProfile?.isPublished ?? true,
  };

  let savedProfile: StoreProfileData;

  if (isDatabaseConfigured()) {
    try {
      const record = await prisma.storeProfile.upsert({
        where: { sellerId },
        update: cleanData,
        create: {
          sellerId,
          ...cleanData,
        },
      });

      savedProfile = {
        id: record.id,
        sellerId: record.sellerId,
        name: record.name,
        slug: record.slug,
        description: record.description,
        logoUrl: record.logoUrl,
        category: record.category,
        contactEmail: record.contactEmail,
        contactPhone: record.contactPhone,
        country: record.country,
        state: record.state,
        city: record.city,
        shippingPolicy: record.shippingPolicy,
        returnPolicy: record.returnPolicy,
        orderProcessingInfo: record.orderProcessingInfo,
        customerSupportInstructions: record.customerSupportInstructions,
        isPublished: record.isPublished ?? true,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch (err: unknown) {
      // Catch Prisma P2002 unique constraint violation in race conditions
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        throw new Error(
          `The store slug '${targetSlug}' was just claimed by another seller. Please choose a different slug.`
        );
      }
      throw err;
    }
  } else {
    // JSON fallback
    savedProfile = {
      id: existingProfile?.id || `sp_${sellerId}`,
      sellerId,
      ...cleanData,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Synchronize name and slug to profileStore JSON database for global consistency
  try {
    const userProfile = await getUserProfile(sellerId);
    if (userProfile) {
      const db = await ensureDB();
      const existingStore = db.stores[userProfile.id];
      if (existingStore) {
        existingStore.name = cleanData.name;
        existingStore.slug = cleanData.slug;
        if (cleanData.description) existingStore.description = cleanData.description;
        if (cleanData.category) existingStore.category = cleanData.category;
        existingStore.updatedAt = new Date().toISOString();
      }
      const existingSeller = db.sellerProfiles[userProfile.id];
      if (existingSeller) {
        existingSeller.storeName = cleanData.name;
        if (cleanData.description) existingSeller.storeDescription = cleanData.description;
        if (cleanData.category) existingSeller.storeCategory = cleanData.category;
        if (cleanData.contactPhone) existingSeller.phone = cleanData.contactPhone;
        if (cleanData.state) existingSeller.state = cleanData.state;
        if (cleanData.city) existingSeller.city = cleanData.city;
        existingSeller.updatedAt = new Date().toISOString();
      }
      await persistDB();
    }
  } catch (syncErr) {
    console.warn("Optional profileStore sync notice:", syncErr);
  }

  const completeness = calculateProfileCompleteness(savedProfile);
  return { success: true, profile: savedProfile, completeness };
}
