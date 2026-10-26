import { Product as PrismaProduct } from "@prisma/client";
import {
  Product,
  ProductCategory,
  ProductVariant,
  ProductSpecification,
  ProductShippingInfo,
} from "./product";

/**
 * Transforms a Prisma Product record from PostgreSQL into the Darté UI Product representation.
 */
export function mapPrismaProductToProduct(dbProduct: PrismaProduct): Product {
  let variants: ProductVariant[] = [];
  try {
    if (typeof dbProduct.variants === "string") {
      variants = JSON.parse(dbProduct.variants) as ProductVariant[];
    } else if (Array.isArray(dbProduct.variants)) {
      variants = dbProduct.variants as unknown as ProductVariant[];
    }
  } catch {
    variants = [];
  }

  let specifications: ProductSpecification[] = [];
  try {
    if (typeof dbProduct.specifications === "string") {
      specifications = JSON.parse(dbProduct.specifications) as ProductSpecification[];
    } else if (Array.isArray(dbProduct.specifications)) {
      specifications = dbProduct.specifications as unknown as ProductSpecification[];
    }
  } catch {
    specifications = [];
  }

  let shippingInfo: ProductShippingInfo = {
    dispatchTime: "24-48 hours",
    estimatedDelivery: "2-4 business days nationwide",
    courier: "GIG Logistics / DHL Express",
    freeShipping: false,
  };
  try {
    if (typeof dbProduct.shippingInfo === "string") {
      shippingInfo = JSON.parse(dbProduct.shippingInfo) as ProductShippingInfo;
    } else if (dbProduct.shippingInfo && typeof dbProduct.shippingInfo === "object") {
      shippingInfo = dbProduct.shippingInfo as unknown as ProductShippingInfo;
    }
  } catch {
    // Keep default fallback
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category as ProductCategory,
    description: dbProduct.description,
    shortDescription: dbProduct.shortDescription,
    images: dbProduct.images,
    supplier: {
      name: dbProduct.supplierName,
      rating: dbProduct.supplierRating,
      reviewCount: dbProduct.supplierReviewCount,
      verified: dbProduct.supplierVerified,
      fulfillmentDays: dbProduct.supplierFulfillmentDays,
      location: dbProduct.supplierLocation,
      minOrderQty: dbProduct.supplierMinOrderQty,
      dispatchRate: dbProduct.supplierDispatchRate,
    },
    supplierRating: dbProduct.supplierRating,
    supplierCost: dbProduct.supplierCost,
    suggestedSellingPrice: dbProduct.suggestedSellingPrice,
    stock: dbProduct.stock,
    inStock: dbProduct.inStock,
    tags: dbProduct.tags,
    badges: dbProduct.badges,
    variants,
    shippingInfo,
    specifications,
  };
}
