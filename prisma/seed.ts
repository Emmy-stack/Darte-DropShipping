import { PrismaClient, Prisma } from "@prisma/client";
import { MOCK_PRODUCTS } from "../src/data/products";

const prisma = new PrismaClient();

export async function seedProducts() {
  console.log(`Starting idempotent seed of ${MOCK_PRODUCTS.length} catalogue products...`);

  let upsertedCount = 0;

  for (const product of MOCK_PRODUCTS) {
    const variantsJson = product.variants as unknown as Prisma.InputJsonValue;
    const shippingInfoJson = product.shippingInfo as unknown as Prisma.InputJsonValue;
    const specificationsJson = product.specifications as unknown as Prisma.InputJsonValue;

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.id,
        category: product.category,
        shortDescription: product.shortDescription,
        description: product.description,
        images: product.images,
        supplierName: product.supplier.name,
        supplierRating: product.supplier.rating,
        supplierReviewCount: product.supplier.reviewCount,
        supplierVerified: product.supplier.verified,
        supplierFulfillmentDays: product.supplier.fulfillmentDays,
        supplierLocation: product.supplier.location,
        supplierMinOrderQty: product.supplier.minOrderQty,
        supplierDispatchRate: product.supplier.dispatchRate,
        supplierCost: Math.round(product.supplierCost),
        suggestedSellingPrice: Math.round(product.suggestedSellingPrice),
        stock: product.stock,
        inStock: product.inStock,
        tags: product.tags,
        badges: product.badges || [],
        variants: variantsJson,
        shippingInfo: shippingInfoJson,
        specifications: specificationsJson,
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.id,
        category: product.category,
        shortDescription: product.shortDescription,
        description: product.description,
        images: product.images,
        supplierName: product.supplier.name,
        supplierRating: product.supplier.rating,
        supplierReviewCount: product.supplier.reviewCount,
        supplierVerified: product.supplier.verified,
        supplierFulfillmentDays: product.supplier.fulfillmentDays,
        supplierLocation: product.supplier.location,
        supplierMinOrderQty: product.supplier.minOrderQty,
        supplierDispatchRate: product.supplier.dispatchRate,
        supplierCost: Math.round(product.supplierCost),
        suggestedSellingPrice: Math.round(product.suggestedSellingPrice),
        stock: product.stock,
        inStock: product.inStock,
        tags: product.tags,
        badges: product.badges || [],
        variants: variantsJson,
        shippingInfo: shippingInfoJson,
        specifications: specificationsJson,
      },
    });
    upsertedCount++;
  }

  console.log(`Successfully seeded/updated ${upsertedCount} catalogue products.`);
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error("Error during database seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
