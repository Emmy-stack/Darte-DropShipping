import fs from "fs/promises";
import path from "path";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getProductById } from "@/data/products";
import { mapPrismaProductToProduct } from "@/lib/types/productMapper";
import { Product } from "@/lib/types/product";
import { calculateProfit, calculateMarginPercentage } from "@/lib/utils/formatCurrency";

export interface StoredProductRecord {
  id: string;
  productId: string;
  sellerId: string;
  customSellingPrice: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface StoredProductDetail extends Product {
  storeRecordId: string;
  addedAt: string;
  storeSellingPrice: number;
  storeProfit: number;
  storeMargin: number;
}

// Fallback JSON storage path when PostgreSQL is not yet configured
const FALLBACK_DIR = path.join(process.cwd(), "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "seller_products.json");

interface FallbackSchema {
  records: StoredProductRecord[];
}

let inMemoryFallback: FallbackSchema | null = null;

async function ensureFallback(): Promise<FallbackSchema> {
  if (inMemoryFallback) return inMemoryFallback;
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });
    const content = await fs.readFile(FALLBACK_FILE, "utf-8");
    inMemoryFallback = JSON.parse(content) as FallbackSchema;
  } catch {
    inMemoryFallback = { records: [] };
  }
  return inMemoryFallback;
}

async function persistFallback(): Promise<void> {
  if (!inMemoryFallback) return;
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });
    const tmp = `${FALLBACK_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tmp, JSON.stringify(inMemoryFallback, null, 2), "utf-8");
    await fs.rename(tmp, FALLBACK_FILE);
  } catch (err) {
    console.warn("Could not persist fallback seller products:", err);
  }
}

/**
 * Retrieves all store products for an authenticated seller.
 */
export async function getSellerStoreProducts(sellerId: string): Promise<StoredProductDetail[]> {
  if (!sellerId) return [];

  if (isDatabaseConfigured()) {
    try {
      const records = await prisma.storeProduct.findMany({
        where: { sellerId },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });

      return records.map((rec) => {
        const product = mapPrismaProductToProduct(rec.product);
        const storeSellingPrice = rec.customSellingPrice;
        const storeProfit = calculateProfit(storeSellingPrice, product.supplierCost);
        const storeMargin = calculateMarginPercentage(storeSellingPrice, product.supplierCost);

        return {
          ...product,
          storeRecordId: rec.id,
          addedAt: rec.createdAt.toISOString(),
          storeSellingPrice,
          storeProfit,
          storeMargin,
        };
      });
    } catch (err) {
      console.warn("Database error in getSellerStoreProducts, falling back to local store:", err);
    }
  }

  // Fallback implementation
  const fallback = await ensureFallback();
  const sellerRecords = fallback.records.filter((r) => r.sellerId === sellerId);

  return sellerRecords
    .map((rec) => {
      const product = getProductById(rec.productId);
      if (!product) return null;
      const storeSellingPrice = rec.customSellingPrice;
      const storeProfit = calculateProfit(storeSellingPrice, product.supplierCost);
      const storeMargin = calculateMarginPercentage(storeSellingPrice, product.supplierCost);

      return {
        ...product,
        storeRecordId: rec.id,
        addedAt: rec.createdAt,
        storeSellingPrice,
        storeProfit,
        storeMargin,
      };
    })
    .filter((p): p is StoredProductDetail => p !== null);
}

/**
 * Adds a product to a seller's store.
 * Enforces price validity (>= supplierCost) and uniqueness constraint.
 */
export async function addProductToSellerStore(
  sellerId: string,
  productId: string,
  customSellingPrice?: number
): Promise<{
  success: boolean;
  isNew: boolean;
  record: StoredProductRecord;
}> {
  if (!sellerId) {
    throw new Error("Seller ID is required");
  }
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // 1. Resolve product to validate supplier cost
  let supplierCost: number;
  let defaultSuggestedPrice: number;

  if (isDatabaseConfigured()) {
    try {
      const dbProd = await prisma.product.findUnique({
        where: { id: productId },
        include: { supplier: true },
      });
      if (!dbProd) {
        throw new Error("Product not found in catalog");
      }
      if (dbProd.status !== "ACTIVE") {
        throw new Error("This product is currently inactive or in draft mode and cannot be added to your store.");
      }
      if (dbProd.supplierId && dbProd.supplier?.verificationStatus !== "APPROVED") {
        throw new Error("This product's supplier account is pending verification and cannot be added to your store yet.");
      }
      supplierCost = dbProd.supplierCost;
      defaultSuggestedPrice = dbProd.suggestedSellingPrice;
    } catch (dbErr: unknown) {
      const errMsg = dbErr instanceof Error ? dbErr.message : "";
      if (
        errMsg === "Product not found in catalog" ||
        errMsg.includes("inactive or in draft mode") ||
        errMsg.includes("pending verification")
      ) {
        throw dbErr;
      }
      const mockProd = getProductById(productId);
      if (!mockProd) throw new Error("Product not found in catalog");
      supplierCost = mockProd.supplierCost;
      defaultSuggestedPrice = mockProd.suggestedSellingPrice;
    }
  } else {
    const mockProd = getProductById(productId);
    if (!mockProd) throw new Error("Product not found in catalog");
    supplierCost = mockProd.supplierCost;
    defaultSuggestedPrice = mockProd.suggestedSellingPrice;
  }

  // 2. Validate price
  const finalPrice = Math.round(customSellingPrice ?? defaultSuggestedPrice);
  if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
    throw new Error("Selling price must be a valid positive number");
  }
  if (finalPrice < supplierCost) {
    throw new Error(
      `Selling price (₦${finalPrice.toLocaleString()}) cannot be lower than supplier cost (₦${supplierCost.toLocaleString()})`
    );
  }

  // 3. PostgreSQL Prisma execution
  if (isDatabaseConfigured()) {
    try {
      // Check existing record
      const existing = await prisma.storeProduct.findUnique({
        where: {
          sellerId_productId: {
            sellerId,
            productId,
          },
        },
      });

      if (existing) {
        // If price differs, update it
        let updated = existing;
        if (customSellingPrice !== undefined && existing.customSellingPrice !== finalPrice) {
          updated = await prisma.storeProduct.update({
            where: { id: existing.id },
            data: { customSellingPrice: finalPrice },
          });
        }
        return {
          success: true,
          isNew: false,
          record: {
            id: updated.id,
            productId: updated.productId,
            sellerId: updated.sellerId,
            customSellingPrice: updated.customSellingPrice,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        };
      }

      // Create new record
      const created = await prisma.storeProduct.create({
        data: {
          sellerId,
          productId,
          customSellingPrice: finalPrice,
        },
      });

      return {
        success: true,
        isNew: true,
        record: {
          id: created.id,
          productId: created.productId,
          sellerId: created.sellerId,
          customSellingPrice: created.customSellingPrice,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      };
    } catch (dbErr: unknown) {
      // Handle P2002 unique constraint violation in case of race condition
      if (
        typeof dbErr === "object" &&
        dbErr !== null &&
        "code" in dbErr &&
        (dbErr as { code: string }).code === "P2002"
      ) {
        const existing = await prisma.storeProduct.findUnique({
          where: { sellerId_productId: { sellerId, productId } },
        });
        if (existing) {
          return {
            success: true,
            isNew: false,
            record: {
              id: existing.id,
              productId: existing.productId,
              sellerId: existing.sellerId,
              customSellingPrice: existing.customSellingPrice,
              createdAt: existing.createdAt.toISOString(),
              updatedAt: existing.updatedAt.toISOString(),
            },
          };
        }
      }
      console.warn("Database error in addProductToSellerStore, falling back to local store:", dbErr);
    }
  }

  // Fallback execution
  const fallback = await ensureFallback();
  const existingIdx = fallback.records.findIndex(
    (r) => r.sellerId === sellerId && r.productId === productId
  );

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    if (customSellingPrice !== undefined) {
      fallback.records[existingIdx].customSellingPrice = finalPrice;
      fallback.records[existingIdx].updatedAt = now;
      await persistFallback();
    }
    return {
      success: true,
      isNew: false,
      record: fallback.records[existingIdx],
    };
  }

  const newRecord: StoredProductRecord = {
    id: `sp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    productId,
    sellerId,
    customSellingPrice: finalPrice,
    createdAt: now,
    updatedAt: now,
  };

  fallback.records.unshift(newRecord);
  await persistFallback();

  return {
    success: true,
    isNew: true,
    record: newRecord,
  };
}

/**
 * Updates a seller's custom selling price for an existing store product.
 * Enforces ownership and price validation (>= supplierCost).
 */
export async function updateSellerStoreProductPrice(
  sellerId: string,
  productId: string,
  newPrice: number
): Promise<{ success: boolean; record: StoredProductRecord }> {
  if (!sellerId) throw new Error("Seller ID is required");
  if (!productId) throw new Error("Product ID is required");

  const validatedPrice = Math.round(newPrice);
  if (!Number.isFinite(validatedPrice) || validatedPrice <= 0) {
    throw new Error("Price must be a valid positive number");
  }

  if (isDatabaseConfigured()) {
    try {
      const existing = await prisma.storeProduct.findUnique({
        where: {
          sellerId_productId: {
            sellerId,
            productId,
          },
        },
        include: { product: true },
      });

      if (!existing) {
        throw new Error("Product not found in your store");
      }

      if (validatedPrice < existing.product.supplierCost) {
        throw new Error(
          `Selling price (₦${validatedPrice.toLocaleString()}) cannot be lower than supplier cost (₦${existing.product.supplierCost.toLocaleString()})`
        );
      }

      const updated = await prisma.storeProduct.update({
        where: { id: existing.id },
        data: { customSellingPrice: validatedPrice },
      });

      return {
        success: true,
        record: {
          id: updated.id,
          productId: updated.productId,
          sellerId: updated.sellerId,
          customSellingPrice: updated.customSellingPrice,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      };
    } catch (dbErr: unknown) {
      const errMsg = dbErr instanceof Error ? dbErr.message : "";
      if (
        errMsg === "Product not found in your store" ||
        errMsg.includes("cannot be lower than supplier cost")
      ) {
        throw dbErr;
      }
      console.warn("Database error in updateSellerStoreProductPrice, using fallback:", dbErr);
    }
  }

  // Fallback execution
  const fallback = await ensureFallback();
  const index = fallback.records.findIndex(
    (r) => r.sellerId === sellerId && r.productId === productId
  );

  if (index === -1) {
    throw new Error("Product not found in your store");
  }

  const mockProd = getProductById(productId);
  if (mockProd && validatedPrice < mockProd.supplierCost) {
    throw new Error(
      `Selling price (₦${validatedPrice.toLocaleString()}) cannot be lower than supplier cost (₦${mockProd.supplierCost.toLocaleString()})`
    );
  }

  fallback.records[index].customSellingPrice = validatedPrice;
  fallback.records[index].updatedAt = new Date().toISOString();
  await persistFallback();

  return {
    success: true,
    record: fallback.records[index],
  };
}

/**
 * Removes a product from a seller's store.
 * Enforces ownership.
 */
export async function removeSellerStoreProduct(
  sellerId: string,
  productId: string
): Promise<{ success: boolean }> {
  if (!sellerId) throw new Error("Seller ID is required");
  if (!productId) throw new Error("Product ID is required");

  if (isDatabaseConfigured()) {
    try {
      const existing = await prisma.storeProduct.findUnique({
        where: {
          sellerId_productId: {
            sellerId,
            productId,
          },
        },
      });

      if (!existing) {
        throw new Error("Product not found in your store");
      }

      await prisma.storeProduct.delete({
        where: { id: existing.id },
      });

      return { success: true };
    } catch (dbErr: unknown) {
      const errMsg = dbErr instanceof Error ? dbErr.message : "";
      if (errMsg === "Product not found in your store") {
        throw dbErr;
      }
      console.warn("Database error in removeSellerStoreProduct, using fallback:", dbErr);
    }
  }

  // Fallback execution
  const fallback = await ensureFallback();
  const initialCount = fallback.records.length;
  fallback.records = fallback.records.filter(
    (r) => !(r.sellerId === sellerId && r.productId === productId)
  );

  if (fallback.records.length === initialCount) {
    throw new Error("Product not found in your store");
  }

  await persistFallback();
  return { success: true };
}
