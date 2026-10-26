import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { normalizeSlug } from "@/types/store";
import {
  PublicStoreProfile,
  PublicStoreProduct,
  StorefrontSortOption,
} from "@/types/store";

export interface GetStorefrontProductsOptions {
  search?: string;
  category?: string;
  sort?: StorefrontSortOption;
}

export interface StorefrontCatalogueResult {
  store: PublicStoreProfile;
  products: PublicStoreProduct[];
  totalProducts: number;
  categories: string[];
}

export interface StorefrontProductDetailResult {
  store: PublicStoreProfile;
  product: PublicStoreProduct;
}

/**
 * Checks whether a store profile is eligible for public storefront display.
 * Criteria: Must exist, be published, and have a minimum valid name (>=2 chars) and slug (>=3 chars).
 */
export function isStoreEligible(profile: {
  name?: string | null;
  slug?: string | null;
  isPublished?: boolean | null;
} | null): boolean {
  if (!profile) return false;
  if (profile.isPublished === false) return false;
  if (!profile.name || profile.name.trim().length < 2) return false;
  if (!profile.slug || profile.slug.trim().length < 3) return false;
  return true;
}

/**
 * Retrieves public store profile information by store slug.
 * Excludes private seller IDs, internal tokens, and confidential fields.
 */
export async function getPublicStoreBySlug(
  rawSlug: string
): Promise<{ store: PublicStoreProfile; sellerId: string } | null> {
  if (!rawSlug) return null;
  const normalizedSlug = normalizeSlug(rawSlug);
  if (!normalizedSlug || normalizedSlug.length < 3) return null;

  if (isDatabaseConfigured()) {
    try {
      const dbProfile = await prisma.storeProfile.findUnique({
        where: { slug: normalizedSlug },
      });

      if (!dbProfile || !isStoreEligible(dbProfile)) {
        return null;
      }

      // Count products in seller's store
      const productCount = await prisma.storeProduct.count({
        where: { sellerId: dbProfile.sellerId },
      });

      const store: PublicStoreProfile = {
        id: dbProfile.id,
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
        isPublished: dbProfile.isPublished,
        productCount,
      };

      return { store, sellerId: dbProfile.sellerId };
    } catch (err) {
      console.error("Database error in getPublicStoreBySlug:", err);
      return null;
    }
  }

  return null;
}

/**
 * Retrieves all publicly browsable products for a seller's storefront by slug.
 * Strictly enforces that only public product attributes and the seller's custom
 * selling price are returned. Supplier costs, margins, and supplier data are completely omitted.
 */
export async function getPublicStoreProducts(
  rawSlug: string,
  options: GetStorefrontProductsOptions = {}
): Promise<StorefrontCatalogueResult | null> {
  const storeResolution = await getPublicStoreBySlug(rawSlug);
  if (!storeResolution) return null;

  const { store, sellerId } = storeResolution;

  if (isDatabaseConfigured()) {
    try {
      // Query store products for this seller with minimal, explicit public projection
      const storeProducts = await prisma.storeProduct.findMany({
        where: { sellerId },
        select: {
          id: true,
          productId: true,
          customSellingPrice: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              shortDescription: true,
              description: true,
              images: true,
              inStock: true,
              stock: true,
              tags: true,
              badges: true,
              variants: true,
              shippingInfo: true,
              specifications: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Map to public DTOs
      const allMapped: PublicStoreProduct[] = storeProducts.map((sp) => ({
        id: sp.product.id,
        name: sp.product.name,
        slug: sp.product.slug,
        category: sp.product.category,
        shortDescription: sp.product.shortDescription,
        description: sp.product.description,
        images: sp.product.images,
        price: sp.customSellingPrice, // Retail price in integer Naira
        inStock: sp.product.inStock,
        stock: sp.product.stock,
        tags: sp.product.tags,
        badges: sp.product.badges,
        variants: sp.product.variants,
        shippingInfo: sp.product.shippingInfo,
        specifications: sp.product.specifications,
        addedAt: sp.createdAt.toISOString(),
      }));

      // Extract unique categories available in this store
      const categoriesSet = new Set<string>();
      for (const p of allMapped) {
        if (p.category) categoriesSet.add(p.category);
      }
      const categories = Array.from(categoriesSet).sort();

      // Apply filtering
      let filtered = allMapped;

      // Category filter
      if (options.category && options.category !== "all") {
        const catTarget = options.category.toLowerCase().trim();
        filtered = filtered.filter((p) => p.category.toLowerCase() === catTarget);
      }

      // Search query filter (matches name, description, tags, category)
      if (options.search && options.search.trim().length > 0) {
        const q = options.search.toLowerCase().trim();
        filtered = filtered.filter((p) => {
          return (
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
          );
        });
      }

      // Apply sorting
      if (options.sort === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (options.sort === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (options.sort === "name-asc") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      return {
        store,
        products: filtered,
        totalProducts: allMapped.length,
        categories,
      };
    } catch (err) {
      console.error("Database error in getPublicStoreProducts:", err);
      return null;
    }
  }

  return null;
}

/**
 * Retrieves a single public product detail under a seller's storefront.
 * Strictly verifies product ownership: the product MUST belong to the store identified by slug.
 * Returns null if the store does not exist, the product does not exist, or the product belongs to another store.
 */
export async function getPublicStoreProduct(
  rawSlug: string,
  productIdOrSlug: string
): Promise<StorefrontProductDetailResult | null> {
  if (!productIdOrSlug) return null;

  const storeResolution = await getPublicStoreBySlug(rawSlug);
  if (!storeResolution) return null;

  const { store, sellerId } = storeResolution;

  if (isDatabaseConfigured()) {
    try {
      // Find StoreProduct record matching sellerId and either product ID or product slug
      const storeProduct = await prisma.storeProduct.findFirst({
        where: {
          sellerId,
          OR: [
            { productId: productIdOrSlug },
            { product: { slug: productIdOrSlug } },
          ],
        },
        select: {
          id: true,
          productId: true,
          customSellingPrice: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              shortDescription: true,
              description: true,
              images: true,
              inStock: true,
              stock: true,
              tags: true,
              badges: true,
              variants: true,
              shippingInfo: true,
              specifications: true,
            },
          },
        },
      });

      if (!storeProduct) {
        return null;
      }

      const product: PublicStoreProduct = {
        id: storeProduct.product.id,
        name: storeProduct.product.name,
        slug: storeProduct.product.slug,
        category: storeProduct.product.category,
        shortDescription: storeProduct.product.shortDescription,
        description: storeProduct.product.description,
        images: storeProduct.product.images,
        price: storeProduct.customSellingPrice, // Retail price in integer Naira
        inStock: storeProduct.product.inStock,
        stock: storeProduct.product.stock,
        tags: storeProduct.product.tags,
        badges: storeProduct.product.badges,
        variants: storeProduct.product.variants,
        shippingInfo: storeProduct.product.shippingInfo,
        specifications: storeProduct.product.specifications,
        addedAt: storeProduct.createdAt.toISOString(),
      };

      return {
        store,
        product,
      };
    } catch (err) {
      console.error("Database error in getPublicStoreProduct:", err);
      return null;
    }
  }

  return null;
}
