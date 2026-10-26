import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  SupplierProfileData,
  SupplierRegistrationInput,
  SupplierProfileUpdateInput,
  SupplierProductInput,
  SupplierProductItem,
  SupplierOrderItem,
  SupplierDashboardMetrics,
  SupplierVerificationStatus,
  SupplierProductStatus,
  SupplierFulfillmentStatus,
} from "@/types/supplier";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates email format.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Retrieves the supplier profile associated with a Clerk User ID.
 */
export async function getSupplierByClerkId(
  clerkUserId: string
): Promise<SupplierProfileData | null> {
  if (!clerkUserId || !isDatabaseConfigured() || !prisma.supplierProfile) return null;

  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { clerkUserId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) return null;

    const activeCount = await prisma.product.count({
      where: {
        supplierId: supplier.id,
        status: SupplierProductStatus.ACTIVE,
      },
    });

    return {
      id: supplier.id,
      clerkUserId: supplier.clerkUserId,
      companyName: supplier.companyName,
      slug: supplier.slug,
      description: supplier.description,
      logoUrl: supplier.logoUrl,
      businessEmail: supplier.businessEmail,
      phone: supplier.phone,
      country: supplier.country,
      state: supplier.state,
      city: supplier.city,
      address: supplier.address,
      website: supplier.website,
      categoriesSupplied: supplier.categoriesSupplied,
      verificationStatus: supplier.verificationStatus,
      adminNotes: supplier.adminNotes,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
      productCount: supplier._count.products,
      activeProductCount: activeCount,
    };
  } catch (err) {
    console.error("Error fetching supplier by Clerk ID:", err);
    return null;
  }
}

/**
 * Retrieves a supplier profile by its primary database ID.
 */
export async function getSupplierById(
  supplierId: string
): Promise<SupplierProfileData | null> {
  if (!supplierId || !isDatabaseConfigured() || !prisma.supplierProfile) return null;

  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) return null;

    return {
      id: supplier.id,
      clerkUserId: supplier.clerkUserId,
      companyName: supplier.companyName,
      slug: supplier.slug,
      description: supplier.description,
      logoUrl: supplier.logoUrl,
      businessEmail: supplier.businessEmail,
      phone: supplier.phone,
      country: supplier.country,
      state: supplier.state,
      city: supplier.city,
      address: supplier.address,
      website: supplier.website,
      categoriesSupplied: supplier.categoriesSupplied,
      verificationStatus: supplier.verificationStatus,
      adminNotes: supplier.adminNotes,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
      productCount: supplier._count.products,
    };
  } catch (err) {
    console.error("Error fetching supplier by ID:", err);
    return null;
  }
}

/**
 * Registers a new supplier account.
 * Enforces server-side validation, unique slug, and sets verificationStatus to PENDING.
 * Prevents client-side privilege escalation.
 */
export async function registerSupplier(
  clerkUserId: string,
  input: SupplierRegistrationInput
): Promise<{ success: boolean; supplier?: SupplierProfileData; error?: string }> {
  if (!clerkUserId) {
    return { success: false, error: "Unauthorized: Sign in required." };
  }

  // 1. Validation
  const trimmedName = input.companyName?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: "Company name must be at least 2 characters." };
  }

  const trimmedEmail = input.businessEmail?.trim();
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return { success: false, error: "Please enter a valid business email address." };
  }

  const trimmedPhone = input.phone?.trim();
  if (!trimmedPhone || trimmedPhone.length < 7) {
    return { success: false, error: "Please enter a valid phone number." };
  }

  const trimmedState = input.state?.trim();
  const trimmedCity = input.city?.trim();
  if (!trimmedState || !trimmedCity) {
    return { success: false, error: "Business state and city are required." };
  }

  if (!isDatabaseConfigured() || !prisma.supplierProfile) {
    return { success: false, error: "Database connection not available." };
  }

  try {
    // 2. Prevent duplicate supplier registrations for the same user
    const existing = await prisma.supplierProfile.findUnique({
      where: { clerkUserId },
    });
    if (existing) {
      return {
        success: false,
        error: "A supplier profile already exists for your account.",
      };
    }

    // 3. Generate unique slug
    const baseSlug = slugify(trimmedName) || "supplier";
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const slugExists = await prisma.supplierProfile.findUnique({
        where: { slug: finalSlug },
      });
      if (!slugExists) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 4. Create SupplierProfile with PENDING status (strictly non-self-approving)
    const record = await prisma.supplierProfile.create({
      data: {
        clerkUserId,
        companyName: trimmedName,
        slug: finalSlug,
        description: input.description?.trim() || null,
        logoUrl: input.logoUrl?.trim() || null,
        businessEmail: trimmedEmail,
        phone: trimmedPhone,
        country: input.country?.trim() || "Nigeria",
        state: trimmedState,
        city: trimmedCity,
        address: input.address?.trim() || null,
        website: input.website?.trim() || null,
        categoriesSupplied: input.categoriesSupplied || [],
        verificationStatus: SupplierVerificationStatus.PENDING,
      },
    });

    return {
      success: true,
      supplier: {
        id: record.id,
        clerkUserId: record.clerkUserId,
        companyName: record.companyName,
        slug: record.slug,
        description: record.description,
        logoUrl: record.logoUrl,
        businessEmail: record.businessEmail,
        phone: record.phone,
        country: record.country,
        state: record.state,
        city: record.city,
        address: record.address,
        website: record.website,
        categoriesSupplied: record.categoriesSupplied,
        verificationStatus: record.verificationStatus,
        adminNotes: record.adminNotes,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        productCount: 0,
        activeProductCount: 0,
      },
    };
  } catch (err: unknown) {
    console.error("Error creating supplier profile:", err);
    return {
      success: false,
      error: "Failed to register supplier profile. Please try again.",
    };
  }
}

/**
 * Updates permitted supplier company details.
 * Prevents suppliers from modifying their own verificationStatus or adminNotes.
 */
export async function updateSupplierProfile(
  clerkUserId: string,
  input: SupplierProfileUpdateInput
): Promise<{ success: boolean; supplier?: SupplierProfileData; error?: string }> {
  if (!clerkUserId || !isDatabaseConfigured() || !prisma.supplierProfile) {
    return { success: false, error: "Unauthorized" };
  }

  const existing = await prisma.supplierProfile.findUnique({
    where: { clerkUserId },
  });
  if (!existing) {
    return { success: false, error: "Supplier profile not found." };
  }

  const updateData: Record<string, unknown> = {};

  if (input.companyName !== undefined) {
    const trimmed = input.companyName.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: "Company name must be at least 2 characters." };
    }
    updateData.companyName = trimmed;
  }

  if (input.businessEmail !== undefined) {
    const trimmed = input.businessEmail.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      return { success: false, error: "Please enter a valid business email." };
    }
    updateData.businessEmail = trimmed;
  }

  if (input.phone !== undefined) {
    const trimmed = input.phone.trim();
    if (!trimmed || trimmed.length < 7) {
      return { success: false, error: "Please enter a valid phone number." };
    }
    updateData.phone = trimmed;
  }

  if (input.state !== undefined) updateData.state = input.state.trim();
  if (input.city !== undefined) updateData.city = input.city.trim();
  if (input.address !== undefined) updateData.address = input.address?.trim() || null;
  if (input.description !== undefined) updateData.description = input.description?.trim() || null;
  if (input.website !== undefined) updateData.website = input.website?.trim() || null;
  if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl?.trim() || null;
  if (input.categoriesSupplied !== undefined) updateData.categoriesSupplied = input.categoriesSupplied;

  try {
    const updated = await prisma.supplierProfile.update({
      where: { clerkUserId },
      data: updateData,
    });

    return {
      success: true,
      supplier: {
        id: updated.id,
        clerkUserId: updated.clerkUserId,
        companyName: updated.companyName,
        slug: updated.slug,
        description: updated.description,
        logoUrl: updated.logoUrl,
        businessEmail: updated.businessEmail,
        phone: updated.phone,
        country: updated.country,
        state: updated.state,
        city: updated.city,
        address: updated.address,
        website: updated.website,
        categoriesSupplied: updated.categoriesSupplied,
        verificationStatus: updated.verificationStatus,
        adminNotes: updated.adminNotes,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Error updating supplier profile:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

/**
 * Administrative action to approve, reject, or suspend a supplier account.
 * Requires admin authorization.
 */
export async function adminUpdateSupplierStatus(
  supplierId: string,
  status: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supplierId || !isDatabaseConfigured() || !prisma.supplierProfile) {
    return { success: false, error: "Database connection not available." };
  }

  const allowedStatuses = Object.values(SupplierVerificationStatus);
  if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    return { success: false, error: "Invalid supplier verification status." };
  }

  try {
    await prisma.supplierProfile.update({
      where: { id: supplierId },
      data: {
        verificationStatus: status,
        adminNotes: adminNotes || null,
      },
    });

    // If approved, update products owned by supplier to supplierVerified = true
    if (status === SupplierVerificationStatus.APPROVED) {
      await prisma.product.updateMany({
        where: { supplierId },
        data: { supplierVerified: true },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Error in adminUpdateSupplierStatus:", err);
    return { success: false, error: "Failed to update verification status." };
  }
}

/**
 * Calculates operational metrics for the supplier dashboard.
 * Does NOT display misleading settled earnings or fake payouts.
 */
export async function getSupplierDashboardMetrics(
  supplierId: string
): Promise<SupplierDashboardMetrics> {
  const defaultMetrics: SupplierDashboardMetrics = {
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    pendingFulfillments: 0,
    inProgressFulfillments: 0,
    completedFulfillments: 0,
    totalWholesaleInFulfillment: 0,
  };

  if (!supplierId || !isDatabaseConfigured()) return defaultMetrics;

  try {
    const products = await prisma.product.findMany({
      where: { supplierId },
      select: {
        id: true,
        status: true,
        stock: true,
      },
    });

    const totalProducts = products.length;
    const activeProducts = products.filter(
      (p) => p.status === SupplierProductStatus.ACTIVE
    ).length;
    const draftProducts = products.filter(
      (p) => p.status === SupplierProductStatus.DRAFT
    ).length;
    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock <= 5
    ).length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0).length;

    // Fulfilment items belonging to this supplier where order payment is SUCCESS
    const items = await prisma.orderItem.findMany({
      where: {
        supplierId,
        order: {
          paymentStatus: "SUCCESS",
        },
      },
      select: {
        fulfillmentStatus: true,
        quantity: true,
        supplierCostSnapshot: true,
      },
    });

    let pendingFulfillments = 0;
    let inProgressFulfillments = 0;
    let completedFulfillments = 0;
    let totalWholesaleInFulfillment = 0;

    for (const item of items) {
      if (item.fulfillmentStatus === SupplierFulfillmentStatus.PENDING) {
        pendingFulfillments++;
        totalWholesaleInFulfillment +=
          (item.supplierCostSnapshot || 0) * item.quantity;
      } else if (item.fulfillmentStatus === SupplierFulfillmentStatus.PROCESSING) {
        inProgressFulfillments++;
        totalWholesaleInFulfillment +=
          (item.supplierCostSnapshot || 0) * item.quantity;
      } else if (
        item.fulfillmentStatus === SupplierFulfillmentStatus.SHIPPED ||
        item.fulfillmentStatus === SupplierFulfillmentStatus.DELIVERED
      ) {
        completedFulfillments++;
      }
    }

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingFulfillments,
      inProgressFulfillments,
      completedFulfillments,
      totalWholesaleInFulfillment,
    };
  } catch (err) {
    console.error("Error computing supplier dashboard metrics:", err);
    return defaultMetrics;
  }
}

/**
 * Retrieves products owned by the authenticated supplier.
 */
export async function getSupplierProducts(
  supplierId: string,
  options?: { status?: string; search?: string }
): Promise<SupplierProductItem[]> {
  if (!supplierId || !isDatabaseConfigured()) return [];

  try {
    const whereClause: Record<string, unknown> = { supplierId };

    if (options?.status && options.status !== "ALL") {
      whereClause.status = options.status;
    }

    if (options?.search) {
      whereClause.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { category: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            storeProducts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      shortDescription: p.shortDescription,
      description: p.description,
      images: p.images,
      supplierCost: p.supplierCost,
      suggestedSellingPrice: p.suggestedSellingPrice,
      stock: p.stock,
      inStock: p.inStock,
      status: p.status,
      supplierFulfillmentDays: p.supplierFulfillmentDays,
      supplierLocation: p.supplierLocation,
      supplierDispatchRate: p.supplierDispatchRate,
      supplierMinOrderQty: p.supplierMinOrderQty,
      connectedSellersCount: p._count.storeProducts,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("Error retrieving supplier products:", err);
    return [];
  }
}

/**
 * Retrieves a single product owned by the supplier.
 * Returns null if the product does not exist or belongs to another supplier.
 */
export async function getSupplierProductById(
  supplierId: string,
  productId: string
): Promise<SupplierProductItem | null> {
  if (!supplierId || !productId || !isDatabaseConfigured()) return null;

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        supplierId,
      },
      include: {
        _count: {
          select: {
            storeProducts: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      shortDescription: product.shortDescription,
      description: product.description,
      images: product.images,
      supplierCost: product.supplierCost,
      suggestedSellingPrice: product.suggestedSellingPrice,
      stock: product.stock,
      inStock: product.inStock,
      status: product.status,
      supplierFulfillmentDays: product.supplierFulfillmentDays,
      supplierLocation: product.supplierLocation,
      supplierDispatchRate: product.supplierDispatchRate,
      supplierMinOrderQty: product.supplierMinOrderQty,
      connectedSellersCount: product._count.storeProducts,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  } catch (err) {
    console.error("Error retrieving supplier product by ID:", err);
    return null;
  }
}

/**
 * Creates a new product for an authenticated supplier.
 * Enforces supplier approval check (pending suppliers can only save as DRAFT).
 */
export async function createSupplierProduct(
  supplierId: string,
  input: SupplierProductInput
): Promise<{ success: boolean; product?: SupplierProductItem; error?: string }> {
  if (!supplierId || !isDatabaseConfigured() || !prisma.supplierProfile) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Fetch supplier profile to verify status
  const supplier = await prisma.supplierProfile.findUnique({
    where: { id: supplierId },
  });
  if (!supplier) {
    return { success: false, error: "Supplier profile not found." };
  }

  // 2. Input validation
  const trimmedName = input.name?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: "Product name must be at least 2 characters." };
  }

  if (!input.category?.trim()) {
    return { success: false, error: "Category is required." };
  }

  const supplierCost = Math.round(Number(input.supplierCost));
  if (!Number.isInteger(supplierCost) || supplierCost <= 0) {
    return { success: false, error: "Wholesale price must be a positive integer in Naira." };
  }

  const stock = Math.round(Number(input.stock ?? 0));
  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, error: "Available stock must be a non-negative integer." };
  }

  let suggestedSellingPrice = Math.round(
    Number(input.suggestedSellingPrice ?? Math.round(supplierCost * 1.35))
  );
  if (suggestedSellingPrice < supplierCost) {
    suggestedSellingPrice = supplierCost;
  }

  // 3. Verification enforcement: Pending/rejected suppliers cannot publish ACTIVE products
  let initialStatus: string = input.status || SupplierProductStatus.ACTIVE;
  if (supplier.verificationStatus !== SupplierVerificationStatus.APPROVED) {
    if (initialStatus === SupplierProductStatus.ACTIVE) {
      initialStatus = SupplierProductStatus.DRAFT;
    }
  }

  // 4. Generate unique product ID and slug
  const baseSlug = slugify(trimmedName) || "product";
  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const productId = `prod_sup_${Date.now()}_${uniqueSuffix}`;
  const slug = `${baseSlug}-${uniqueSuffix}`;

  try {
    const created = await prisma.product.create({
      data: {
        id: productId,
        name: trimmedName,
        slug,
        category: input.category.trim(),
        shortDescription: input.shortDescription?.trim() || `${trimmedName} from ${supplier.companyName}`,
        description: input.description?.trim() || `${trimmedName} wholesale supply.`,
        images: input.images && input.images.length > 0 ? input.images : ["/placeholder-product.png"],
        supplierName: supplier.companyName,
        supplierRating: 4.8,
        supplierReviewCount: 1,
        supplierVerified: supplier.verificationStatus === SupplierVerificationStatus.APPROVED,
        supplierFulfillmentDays: input.supplierFulfillmentDays?.trim() || "1-3 business days",
        supplierLocation: input.supplierLocation?.trim() || `${supplier.city}, ${supplier.state}`,
        supplierMinOrderQty: input.supplierMinOrderQty && input.supplierMinOrderQty > 0 ? input.supplierMinOrderQty : 1,
        supplierDispatchRate: input.supplierDispatchRate?.trim() || "98%",
        supplierCost,
        suggestedSellingPrice,
        stock,
        inStock: stock > 0,
        status: initialStatus,
        supplierId: supplier.id,
        tags: [input.category.trim(), "Wholesale"],
        badges: initialStatus === SupplierProductStatus.DRAFT ? ["Draft"] : [],
        shippingInfo: {
          weight: "0.5kg",
          dispatchTime: input.supplierFulfillmentDays?.trim() || "1-3 days",
        },
      },
      include: {
        _count: {
          select: {
            storeProducts: true,
          },
        },
      },
    });

    return {
      success: true,
      product: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        category: created.category,
        shortDescription: created.shortDescription,
        description: created.description,
        images: created.images,
        supplierCost: created.supplierCost,
        suggestedSellingPrice: created.suggestedSellingPrice,
        stock: created.stock,
        inStock: created.inStock,
        status: created.status,
        supplierFulfillmentDays: created.supplierFulfillmentDays,
        supplierLocation: created.supplierLocation,
        supplierDispatchRate: created.supplierDispatchRate,
        supplierMinOrderQty: created.supplierMinOrderQty,
        connectedSellersCount: created._count.storeProducts,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Error creating supplier product:", err);
    return { success: false, error: "Failed to create product listing." };
  }
}

/**
 * Updates a product owned by the supplier.
 * Enforces ownership, valid quantities/prices, and verification rules.
 * Does NOT alter seller retail prices or historical order item price snapshots.
 */
export async function updateSupplierProduct(
  supplierId: string,
  productId: string,
  input: Partial<SupplierProductInput>
): Promise<{ success: boolean; product?: SupplierProductItem; error?: string }> {
  if (!supplierId || !productId || !isDatabaseConfigured()) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Verify product ownership
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId, supplierId },
    include: { supplier: true },
  });

  if (!existingProduct) {
    return { success: false, error: "Product not found or not owned by your company." };
  }

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: "Product name must be at least 2 characters." };
    }
    updateData.name = trimmed;
  }

  if (input.category !== undefined) {
    if (!input.category.trim()) {
      return { success: false, error: "Category cannot be empty." };
    }
    updateData.category = input.category.trim();
  }

  if (input.supplierCost !== undefined) {
    const cost = Math.round(Number(input.supplierCost));
    if (!Number.isInteger(cost) || cost <= 0) {
      return { success: false, error: "Wholesale price must be a positive integer." };
    }
    updateData.supplierCost = cost;
  }

  if (input.stock !== undefined) {
    const stock = Math.round(Number(input.stock));
    if (!Number.isInteger(stock) || stock < 0) {
      return { success: false, error: "Stock must be a non-negative integer." };
    }
    updateData.stock = stock;
    updateData.inStock = stock > 0;
  }

  if (input.suggestedSellingPrice !== undefined) {
    const ssp = Math.round(Number(input.suggestedSellingPrice));
    if (ssp > 0) updateData.suggestedSellingPrice = ssp;
  }

  if (input.status !== undefined) {
    const allowedStatuses = Object.values(SupplierProductStatus);
    if (!allowedStatuses.includes(input.status as (typeof allowedStatuses)[number])) {
      return { success: false, error: "Invalid product status." };
    }
    // Block activating if supplier is not approved
    if (
      input.status === SupplierProductStatus.ACTIVE &&
      existingProduct.supplier?.verificationStatus !== SupplierVerificationStatus.APPROVED
    ) {
      return {
        success: false,
        error: "Your supplier account is pending verification. Products can only be saved as Draft.",
      };
    }
    updateData.status = input.status;
  }

  if (input.shortDescription !== undefined) updateData.shortDescription = input.shortDescription.trim();
  if (input.description !== undefined) updateData.description = input.description.trim();
  if (input.images !== undefined && Array.isArray(input.images)) updateData.images = input.images;
  if (input.supplierFulfillmentDays !== undefined) updateData.supplierFulfillmentDays = input.supplierFulfillmentDays.trim();
  if (input.supplierLocation !== undefined) updateData.supplierLocation = input.supplierLocation.trim();
  if (input.supplierDispatchRate !== undefined) updateData.supplierDispatchRate = input.supplierDispatchRate.trim();
  if (input.supplierMinOrderQty !== undefined && input.supplierMinOrderQty > 0) updateData.supplierMinOrderQty = input.supplierMinOrderQty;

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        _count: {
          select: {
            storeProducts: true,
          },
        },
      },
    });

    return {
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        category: updated.category,
        shortDescription: updated.shortDescription,
        description: updated.description,
        images: updated.images,
        supplierCost: updated.supplierCost,
        suggestedSellingPrice: updated.suggestedSellingPrice,
        stock: updated.stock,
        inStock: updated.inStock,
        status: updated.status,
        supplierFulfillmentDays: updated.supplierFulfillmentDays,
        supplierLocation: updated.supplierLocation,
        supplierDispatchRate: updated.supplierDispatchRate,
        supplierMinOrderQty: updated.supplierMinOrderQty,
        connectedSellersCount: updated._count.storeProducts,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Error updating supplier product:", err);
    return { success: false, error: "Failed to update product." };
  }
}

/**
 * Deactivates or safely removes a product.
 * If the product is referenced in historical orders or seller stores, it is archived (status: INACTIVE)
 * rather than destructively deleted to protect purchase history.
 */
export async function deleteOrDeactivateSupplierProduct(
  supplierId: string,
  productId: string
): Promise<{ success: boolean; action: "archived" | "deleted"; error?: string }> {
  if (!supplierId || !productId || !isDatabaseConfigured()) {
    return { success: false, action: "archived", error: "Unauthorized" };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, supplierId },
    include: {
      _count: {
        select: {
          orderItems: true,
          storeProducts: true,
        },
      },
    },
  });

  if (!product) {
    return { success: false, action: "archived", error: "Product not found or not owned by your company." };
  }

  try {
    if (product._count.orderItems > 0 || product._count.storeProducts > 0) {
      // Historical references exist: deactivate to maintain audit integrity
      await prisma.product.update({
        where: { id: productId },
        data: {
          status: SupplierProductStatus.INACTIVE,
          inStock: false,
        },
      });
      return { success: true, action: "archived" };
    }

    // No historical orders or seller stores: safe delete
    await prisma.product.delete({
      where: { id: productId },
    });
    return { success: true, action: "deleted" };
  } catch (err) {
    console.error("Error deleting/archiving supplier product:", err);
    return { success: false, action: "archived", error: "Failed to remove product." };
  }
}

/**
 * Retrieves order items owned by the authenticated supplier.
 * Strictly enforces tenant isolation: only items where supplierId === supplierId are returned.
 * Zero items or wholesale costs belonging to other suppliers are exposed.
 */
export async function getSupplierOrderItems(
  supplierId: string,
  fulfillmentStatusFilter?: string
): Promise<SupplierOrderItem[]> {
  if (!supplierId || !isDatabaseConfigured()) return [];

  try {
    const whereClause: Record<string, unknown> = {
      supplierId,
    };

    if (fulfillmentStatusFilter && fulfillmentStatusFilter !== "ALL") {
      whereClause.fulfillmentStatus = fulfillmentStatusFilter;
    }

    const items = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
            customerName: true,
            deliveryCity: true,
            deliveryState: true,
            deliveryAddress: true,
            deliveryInstructions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      orderNumber: item.order.orderNumber,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      productSlug: item.productSlug,
      category: item.category,
      quantity: item.quantity,
      wholesaleUnitPrice: item.supplierCostSnapshot || 0,
      wholesaleLineTotal: (item.supplierCostSnapshot || 0) * item.quantity,
      fulfillmentStatus: item.fulfillmentStatus,
      orderStatus: item.order.orderStatus,
      paymentStatus: item.order.paymentStatus,
      createdAt: item.createdAt.toISOString(),
      recipientName: item.order.customerName,
      deliveryCity: item.order.deliveryCity,
      deliveryState: item.order.deliveryState,
      deliveryAddress: item.order.deliveryAddress,
      deliveryInstructions: item.order.deliveryInstructions,
    }));
  } catch (err) {
    console.error("Error retrieving supplier order items:", err);
    return [];
  }
}

/**
 * Updates the fulfillment status of an order item owned by the supplier.
 * Strictly verifies that the order is legitimately PAID before advancing fulfillment.
 */
export async function updateSupplierItemFulfillment(
  supplierId: string,
  orderItemId: string,
  targetStatus: string
): Promise<{ success: boolean; item?: SupplierOrderItem; error?: string }> {
  if (!supplierId || !orderItemId || !isDatabaseConfigured()) {
    return { success: false, error: "Unauthorized" };
  }

  const allowedStatuses = Object.values(SupplierFulfillmentStatus);
  if (!allowedStatuses.includes(targetStatus as (typeof allowedStatuses)[number])) {
    return { success: false, error: "Invalid fulfillment status." };
  }

  // 1. Fetch item and verify supplier ownership
  const item = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      supplierId,
    },
    include: {
      order: true,
    },
  });

  if (!item) {
    return { success: false, error: "Order item not found or not assigned to your company." };
  }

  // 2. Enforce payment check: Unpaid orders CANNOT be marked as fulfilled
  if (item.order.paymentStatus !== "SUCCESS") {
    return {
      success: false,
      error: "Cannot fulfill an unpaid order. Payment must be confirmed first.",
    };
  }

  if (item.order.orderStatus === "CANCELLED" || item.order.orderStatus === "REFUNDED") {
    return {
      success: false,
      error: `Cannot fulfill an order with status "${item.order.orderStatus}".`,
    };
  }

  // 3. State Machine transition checks
  const currentStatus = item.fulfillmentStatus;
  if (currentStatus === targetStatus) {
    // Idempotent duplicate update
    return {
      success: true,
      item: {
        id: item.id,
        orderId: item.orderId,
        orderNumber: item.order.orderNumber,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        productSlug: item.productSlug,
        category: item.category,
        quantity: item.quantity,
        wholesaleUnitPrice: item.supplierCostSnapshot || 0,
        wholesaleLineTotal: (item.supplierCostSnapshot || 0) * item.quantity,
        fulfillmentStatus: item.fulfillmentStatus,
        orderStatus: item.order.orderStatus,
        paymentStatus: item.order.paymentStatus,
        createdAt: item.createdAt.toISOString(),
        recipientName: item.order.customerName,
        deliveryCity: item.order.deliveryCity,
        deliveryState: item.order.deliveryState,
        deliveryAddress: item.order.deliveryAddress,
        deliveryInstructions: item.order.deliveryInstructions,
      },
    };
  }

  const VALID_TRANSITIONS: Record<string, string[]> = {
    [SupplierFulfillmentStatus.PENDING]: [
      SupplierFulfillmentStatus.PROCESSING,
      SupplierFulfillmentStatus.CANCELLED,
    ],
    [SupplierFulfillmentStatus.PROCESSING]: [
      SupplierFulfillmentStatus.SHIPPED,
      SupplierFulfillmentStatus.CANCELLED,
    ],
    [SupplierFulfillmentStatus.SHIPPED]: [
      SupplierFulfillmentStatus.DELIVERED,
      SupplierFulfillmentStatus.CANCELLED,
    ],
    [SupplierFulfillmentStatus.DELIVERED]: [],
    [SupplierFulfillmentStatus.CANCELLED]: [],
  };

  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      success: false,
      error: `Invalid fulfillment transition: cannot change status from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  try {
    // 4. Update OrderItem fulfillment status (supplier does NOT overwrite main customer order status)
    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        fulfillmentStatus: targetStatus,
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
            customerName: true,
            deliveryCity: true,
            deliveryState: true,
            deliveryAddress: true,
            deliveryInstructions: true,
          },
        },
      },
    });

    return {
      success: true,
      item: {
        id: updated.id,
        orderId: updated.orderId,
        orderNumber: updated.order.orderNumber,
        productId: updated.productId,
        productName: updated.productName,
        productImage: updated.productImage,
        productSlug: updated.productSlug,
        category: updated.category,
        quantity: updated.quantity,
        wholesaleUnitPrice: updated.supplierCostSnapshot || 0,
        wholesaleLineTotal: (updated.supplierCostSnapshot || 0) * updated.quantity,
        fulfillmentStatus: updated.fulfillmentStatus,
        orderStatus: updated.order.orderStatus,
        paymentStatus: updated.order.paymentStatus,
        createdAt: updated.createdAt.toISOString(),
        recipientName: updated.order.customerName,
        deliveryCity: updated.order.deliveryCity,
        deliveryState: updated.order.deliveryState,
        deliveryAddress: updated.order.deliveryAddress,
        deliveryInstructions: updated.order.deliveryInstructions,
      },
    };
  } catch (err) {
    console.error("Error updating item fulfillment:", err);
    return { success: false, error: "Failed to update fulfillment status." };
  }
}
