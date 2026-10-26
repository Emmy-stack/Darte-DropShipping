import { prisma } from "../src/lib/prisma";
import {
  getSellerStoreProducts,
  addProductToSellerStore,
  updateSellerStoreProductPrice,
  removeSellerStoreProduct,
} from "../src/lib/db/sellerProducts";
import { seedProducts } from "../prisma/seed";

const TEST_SELLER_A = "user_test_seller_stage_b_alpha";
const TEST_SELLER_B = "user_test_seller_stage_b_beta";
const TEST_PRODUCT_ID = "smart-led-desk-lamp";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log("=================================================================");
  console.log(" Darté Product Discovery — Stage B Backend Integration Test Suite");
  console.log("=================================================================\n");

  try {
    // 0. Clean up any previous test artifacts
    await prisma.storeProduct.deleteMany({
      where: {
        sellerId: { in: [TEST_SELLER_A, TEST_SELLER_B] },
      },
    });

    // 1. Catalogue Retrieval & Seeding
    console.log("TEST GROUP 1: Catalogue Retrieval & Seeding");
    const initialCount = await prisma.product.count();
    assert(initialCount === 16, `Initial catalogue contains 16 products (found: ${initialCount})`);

    // Verify repeated seed execution is idempotent
    await seedProducts();
    const afterSeedCount = await prisma.product.count();
    assert(afterSeedCount === 16, `Repeated seed execution is idempotent (count remained: ${afterSeedCount})`);

    // Single product retrieval
    const product = await prisma.product.findUnique({
      where: { id: TEST_PRODUCT_ID },
    });
    assert(!!product, `Product ${TEST_PRODUCT_ID} retrieved from database`);
    assert(product?.slug === TEST_PRODUCT_ID, `Product slug matches ID for route compatibility`);
    assert(product?.supplierCost === 12500, `Product supplierCost is ₦12,500 integer`);

    // 2. Adding Product to Seller A's Store
    console.log("\nTEST GROUP 2: Adding Product to Seller Store");
    const addResultA = await addProductToSellerStore(
      TEST_SELLER_A,
      TEST_PRODUCT_ID,
      25000
    );
    assert(addResultA.success, "Product added successfully to Seller A store");
    assert(addResultA.isNew, "addResultA.isNew is true for initial addition");
    assert(addResultA.record.customSellingPrice === 25000, "Seller A custom selling price set to ₦25,000");

    // 3. Duplicate-Addition Handling & Uniqueness Constraint
    console.log("\nTEST GROUP 3: Duplicate Addition & Uniqueness Constraint");
    const duplicateAdd = await addProductToSellerStore(
      TEST_SELLER_A,
      TEST_PRODUCT_ID,
      28000
    );
    assert(duplicateAdd.success, "Duplicate addition handled cleanly without unhandled crash");
    assert(!duplicateAdd.isNew, "duplicateAdd.isNew is false on duplicate addition");

    const sellerAProducts = await getSellerStoreProducts(TEST_SELLER_A);
    assert(sellerAProducts.length === 1, `Seller A has exactly 1 product, no duplicates created (count: ${sellerAProducts.length})`);
    assert(sellerAProducts[0].storeSellingPrice === 28000, "Price updated to ₦28,000 upon re-addition");

    // Verify Database-Level Uniqueness Constraint
    let uniqueConstraintCaught = false;
    try {
      // Direct raw prisma create bypassing repository to test database @@unique([sellerId, productId])
      await prisma.storeProduct.create({
        data: {
          sellerId: TEST_SELLER_A,
          productId: TEST_PRODUCT_ID,
          customSellingPrice: 30000,
        },
      });
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        uniqueConstraintCaught = true;
      }
    }
    assert(uniqueConstraintCaught, "Database-level @@unique([sellerId, productId]) constraint enforced by PostgreSQL (P2002)");

    // 4. Multi-Seller Isolation (Seller A vs Seller B)
    console.log("\nTEST GROUP 4: Multi-Tenant Seller Isolation");
    const addResultB = await addProductToSellerStore(
      TEST_SELLER_B,
      TEST_PRODUCT_ID,
      19999
    );
    assert(addResultB.success, "Seller B independently added the same catalogue product");
    assert(addResultB.record.customSellingPrice === 19999, "Seller B has their own independent selling price (₦19,999)");

    const sellerBProducts = await getSellerStoreProducts(TEST_SELLER_B);
    assert(sellerBProducts.length === 1, "Seller B sees only their own store selection");
    assert(sellerBProducts[0].storeSellingPrice === 19999, "Seller B price is isolated from Seller A");

    const sellerARefresh = await getSellerStoreProducts(TEST_SELLER_A);
    assert(sellerARefresh.length === 1 && sellerARefresh[0].storeSellingPrice === 28000, "Seller A store selection remains isolated and unmodified");

    // 5. Price Validation & Profit Calculations
    console.log("\nTEST GROUP 5: Server-side Price Validation & Margins");
    let underCostRejected = false;
    try {
      // Supplier cost for lamp is 12500, trying to set 10000
      await updateSellerStoreProductPrice(TEST_SELLER_A, TEST_PRODUCT_ID, 10000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("cannot be lower than supplier cost")) {
        underCostRejected = true;
      }
    }
    assert(underCostRejected, "Selling price below supplier cost (₦10,000 < ₦12,500) strictly rejected");

    let negativePriceRejected = false;
    try {
      await updateSellerStoreProductPrice(TEST_SELLER_A, TEST_PRODUCT_ID, -5000);
    } catch {
      negativePriceRejected = true;
    }
    assert(negativePriceRejected, "Negative price strictly rejected");

    // Valid price update
    await updateSellerStoreProductPrice(TEST_SELLER_A, TEST_PRODUCT_ID, 30000);
    const updatedSellerA = await getSellerStoreProducts(TEST_SELLER_A);
    const lamp = updatedSellerA[0];
    assert(lamp.storeSellingPrice === 30000, "Selling price updated to ₦30,000");
    assert(lamp.storeProfit === 30000 - 12500, `Profit correctly calculated as ₦${lamp.storeProfit} (₦30,000 - ₦12,500)`);
    assert(lamp.storeMargin === Math.round(((30000 - 12500) / 30000) * 100), `Margin correctly calculated as ${lamp.storeMargin}%`);

    // 6. Cross-Tenant Protection (Seller A cannot update or delete Seller B's product)
    console.log("\nTEST GROUP 6: Cross-Tenant Ownership & Unauthorized Mutation");
    let crossTenantUpdateRejected = false;
    try {
      // Seller A attempts to update a product on Seller B
      await updateSellerStoreProductPrice(TEST_SELLER_A, "aura-active-smartwatch", 45000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("not found in your store")) {
        crossTenantUpdateRejected = true;
      }
    }
    assert(crossTenantUpdateRejected, "Updating unowned product rejected with not found / forbidden error");

    let crossTenantDeleteRejected = false;
    try {
      await removeSellerStoreProduct(TEST_SELLER_A, "aura-active-smartwatch");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("not found in your store")) {
        crossTenantDeleteRejected = true;
      }
    }
    assert(crossTenantDeleteRejected, "Deleting unowned product rejected with not found / forbidden error");

    // 7. Removing Product from Store
    console.log("\nTEST GROUP 7: Removing Product from Store");
    const removeRes = await removeSellerStoreProduct(TEST_SELLER_A, TEST_PRODUCT_ID);
    assert(removeRes.success, "Product removed from Seller A store successfully");

    const sellerAPostRemove = await getSellerStoreProducts(TEST_SELLER_A);
    assert(sellerAPostRemove.length === 0, "Seller A store is now empty after deletion");

    // Seller B's product must still exist!
    const sellerBPostRemove = await getSellerStoreProducts(TEST_SELLER_B);
    assert(sellerBPostRemove.length === 1, "Seller B's store product remains intact after Seller A deletion");

    // Clean up Seller B
    await removeSellerStoreProduct(TEST_SELLER_B, TEST_PRODUCT_ID);
    const sellerBFinal = await getSellerStoreProducts(TEST_SELLER_B);
    assert(sellerBFinal.length === 0, "Seller B store cleaned up");

    // Summary
    console.log("\n=================================================================");
    console.log(` RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
    console.log("=================================================================\n");

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  } finally {
    // Final cleanup
    await prisma.storeProduct.deleteMany({
      where: {
        sellerId: { in: [TEST_SELLER_A, TEST_SELLER_B] },
      },
    });
    await prisma.$disconnect();
  }
}

runTestSuite();
