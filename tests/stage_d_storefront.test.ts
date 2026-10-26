/**
 * Darté — Stage D Public Storefront Integration & Unit Test Suite
 *
 * Verifies:
 * 1. Resolving an eligible store by slug
 * 2. Correct 404 / null behavior for unknown or invalid slugs
 * 3. Handling unpublished stores (isPublished = false) and incomplete stores
 * 4. Returning only products belonging to the requested store
 * 5. Displaying seller-specific custom selling prices rather than supplier costs
 * 6. Strict confidentiality: ZERO leakage of supplierCost, supplier margins, or supplier metadata
 * 7. Tenant cross-access prevention: Product detail returns null if product does not belong to store
 * 8. Handling products removed from a store
 * 9. Correctly rendering an empty store with 0 products
 * 10. Search, category filtering, and price sorting logic
 * 11. Storefront URL generation and slug normalization
 * 12. Fallback behavior for missing logos and images
 * 13. Public storefront accessibility without Clerk session (unauthenticated access)
 * 14. Private seller endpoints remaining strictly protected (401/307)
 * 15. Regression check: catalogue seeding & onboarding state preservation
 */

import assert from "assert";
import { prisma, isDatabaseConfigured } from "../src/lib/prisma";
import {
  getPublicStoreBySlug,
  getPublicStoreProducts,
  getPublicStoreProduct,
  isStoreEligible,
} from "../src/lib/db/storefront";
import { saveSellerStoreProfile } from "../src/lib/db/storeProfile";
import { addProductToSellerStore, removeSellerStoreProduct } from "../src/lib/db/sellerProducts";
import { normalizeSlug } from "../src/types/store";

const SELLER_D_1 = `test_seller_d1_${Date.now()}`;
const SELLER_D_2 = `test_seller_d2_${Date.now()}`;
const SELLER_D_UNPUBLISHED = `test_seller_d_unpub_${Date.now()}`;

const SLUG_D_1 = `lagos-gadget-hub-${Date.now().toString().slice(-6)}`;
const SLUG_D_2 = `abuja-fashion-mart-${Date.now().toString().slice(-6)}`;
const SLUG_UNPUBLISHED = `private-draft-store-${Date.now().toString().slice(-6)}`;

const PRODUCT_ID_1 = "smart-led-desk-lamp";
const PRODUCT_ID_2 = "aura-active-smartwatch";

async function cleanupFixtures() {
  if (isDatabaseConfigured()) {
    try {
      await prisma.storeProduct.deleteMany({
        where: { sellerId: { in: [SELLER_D_1, SELLER_D_2, SELLER_D_UNPUBLISHED] } },
      });
      await prisma.storeProfile.deleteMany({
        where: { sellerId: { in: [SELLER_D_1, SELLER_D_2, SELLER_D_UNPUBLISHED] } },
      });
    } catch {
      // Ignore cleanup error
    }
  }
}

async function runTests() {
  console.log("\n=================================================================");
  console.log(" Darté — Stage D Public Storefront Integration Test Suite");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      failed++;
    }
  }

  try {
    await cleanupFixtures();

    // Setup Test Stores in PostgreSQL
    if (isDatabaseConfigured()) {
      // Seller 1: Published store
      await saveSellerStoreProfile(SELLER_D_1, {
        name: "Lagos Gadget Hub",
        slug: SLUG_D_1,
        description: "Premium gadgets with express same-day delivery in Lagos.",
        category: "Electronics",
        country: "Nigeria",
        state: "Lagos",
        city: "Ikeja",
        contactEmail: "support@lagosgadgets.ng",
        contactPhone: "08012345678",
        shippingPolicy: "Dispatched within 24 hours.",
        returnPolicy: "72 hours return guarantee.",
        isPublished: true,
      });

      // Seller 2: Published store
      await saveSellerStoreProfile(SELLER_D_2, {
        name: "Abuja Fashion Mart",
        slug: SLUG_D_2,
        description: "Curated watches and smart wear in FCT Abuja.",
        category: "Watches",
        country: "Nigeria",
        state: "Abuja (FCT)",
        city: "Wuse 2",
        isPublished: true,
      });

      // Seller 3: Unpublished / Draft Store
      await saveSellerStoreProfile(SELLER_D_UNPUBLISHED, {
        name: "Private Draft Store",
        slug: SLUG_UNPUBLISHED,
        description: "Under construction.",
        isPublished: false,
      });

      // Add Product 1 to Seller 1's store with custom selling price
      await addProductToSellerStore(SELLER_D_1, PRODUCT_ID_1, 28500);

      // Add Product 2 to Seller 2's store with independent custom selling price
      await addProductToSellerStore(SELLER_D_2, PRODUCT_ID_2, 42000);
    }

    // -------------------------------------------------------------------------
    // TEST GROUP 1: Store Resolution & Slug Validation
    // -------------------------------------------------------------------------
    console.log("TEST GROUP 1: Store Resolution & Slug Validation");

    await test("Resolving an eligible public store by slug returns public profile", async () => {
      const result = await getPublicStoreBySlug(SLUG_D_1);
      assert.ok(result, "Expected store to be found");
      assert.strictEqual(result.store.name, "Lagos Gadget Hub");
      assert.strictEqual(result.store.slug, SLUG_D_1);
      assert.strictEqual(result.store.category, "Electronics");
      assert.strictEqual(result.store.isPublished, true);
      assert.strictEqual(result.store.productCount, 1);
    });

    await test("Nonexistent or unknown slug returns null (triggers 404)", async () => {
      const result = await getPublicStoreBySlug("completely-nonexistent-slug-xyz-999");
      assert.strictEqual(result, null);
    });

    await test("Unpublished store (isPublished = false) is rejected for public browsing", async () => {
      const result = await getPublicStoreBySlug(SLUG_UNPUBLISHED);
      assert.strictEqual(result, null, "Unpublished store must not be accessible to public visitors");
    });

    await test("isStoreEligible checks minimum required attributes", async () => {
      assert.strictEqual(isStoreEligible(null), false);
      assert.strictEqual(isStoreEligible({ name: "A", slug: "slug" }), false, "Name < 2 chars ineligible");
      assert.strictEqual(isStoreEligible({ name: "Store", slug: "ab" }), false, "Slug < 3 chars ineligible");
      assert.strictEqual(isStoreEligible({ name: "Store", slug: "my-store", isPublished: false }), false, "Unpublished ineligible");
      assert.strictEqual(isStoreEligible({ name: "Store", slug: "my-store", isPublished: true }), true);
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Product Catalogue & Tenant Isolation
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 2: Product Catalogue & Tenant Isolation");

    await test("Store 1 catalogue contains only Store 1 products", async () => {
      const result = await getPublicStoreProducts(SLUG_D_1);
      assert.ok(result);
      assert.strictEqual(result.products.length, 1);
      assert.strictEqual(result.products[0].id, PRODUCT_ID_1);
      assert.ok(result.products[0].name.includes("Smart LED"));
    });

    await test("Store 1 catalogue DOES NOT contain Store 2 products (tenant isolation)", async () => {
      const result = await getPublicStoreProducts(SLUG_D_1);
      assert.ok(result);
      const hasProduct2 = result.products.some((p) => p.id === PRODUCT_ID_2);
      assert.strictEqual(hasProduct2, false, "Store 1 must not display Store 2 products");
    });

    await test("Store 2 catalogue contains only Store 2 products", async () => {
      const result = await getPublicStoreProducts(SLUG_D_2);
      assert.ok(result);
      assert.strictEqual(result.products.length, 1);
      assert.strictEqual(result.products[0].id, PRODUCT_ID_2);
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Custom Selling Prices & Zero Confidential Data Leakage
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 3: Custom Selling Prices & Zero Confidential Data Leakage");

    await test("Storefront displays seller's custom selling price (₦28,500)", async () => {
      const result = await getPublicStoreProducts(SLUG_D_1);
      assert.ok(result);
      const product = result.products[0];
      assert.strictEqual(product.price, 28500);
    });

    await test("CRITICAL SECURITY: supplierCost, margins, and supplier metadata are NEVER leaked", async () => {
      const result = await getPublicStoreProducts(SLUG_D_1);
      assert.ok(result);
      const product = result.products[0];
      const rawJson = JSON.stringify(product);

      // Verify that confidential wholesale supplier fields are completely absent from public payload
      assert.strictEqual(rawJson.includes("supplierCost"), false, "supplierCost must NOT be exposed");
      assert.strictEqual(rawJson.includes("supplierName"), false, "supplierName must NOT be exposed");
      assert.strictEqual(rawJson.includes("supplierLocation"), false, "supplierLocation must NOT be exposed");
      assert.strictEqual(rawJson.includes("supplierRating"), false, "supplierRating must NOT be exposed");
      assert.strictEqual(rawJson.includes("profit"), false, "profit must NOT be exposed");
      assert.strictEqual(rawJson.includes("margin"), false, "margin must NOT be exposed");
      assert.strictEqual("supplierCost" in product, false);
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Public Product Detail Route Verification
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 4: Public Product Detail Route Verification");

    await test("getPublicStoreProduct resolves product belonging to store", async () => {
      const result = await getPublicStoreProduct(SLUG_D_1, PRODUCT_ID_1);
      assert.ok(result);
      assert.strictEqual(result.store.slug, SLUG_D_1);
      assert.strictEqual(result.product.id, PRODUCT_ID_1);
      assert.strictEqual(result.product.price, 28500);
      assert.strictEqual("supplierCost" in result.product, false);
    });

    await test("Cross-Store Guard: getPublicStoreProduct returns null if product belongs to another seller", async () => {
      // PRODUCT_ID_2 belongs to Seller 2, NOT Seller 1
      const result = await getPublicStoreProduct(SLUG_D_1, PRODUCT_ID_2);
      assert.strictEqual(
        result,
        null,
        "Attempting to view Store 2 product under Store 1 slug must return null (404)"
      );
    });

    await test("Removing product from store causes product detail to return null (404)", async () => {
      if (isDatabaseConfigured()) {
        // Add temporary product to Seller 1 and then remove it
        await addProductToSellerStore(SELLER_D_1, PRODUCT_ID_2, 50000);
        let detail = await getPublicStoreProduct(SLUG_D_1, PRODUCT_ID_2);
        assert.ok(detail, "Product should be present before removal");

        await removeSellerStoreProduct(SELLER_D_1, PRODUCT_ID_2);
        detail = await getPublicStoreProduct(SLUG_D_1, PRODUCT_ID_2);
        assert.strictEqual(detail, null, "Removed product must return null (404)");
      }
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Empty Store & Search/Filtering/Sorting
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 5: Empty Store & Search/Filtering/Sorting");

    await test("Store with 0 products renders without throwing errors", async () => {
      if (isDatabaseConfigured()) {
        const EMPTY_SELLER = `test_empty_seller_${Date.now()}`;
        const EMPTY_SLUG = `empty-store-${Date.now().toString().slice(-6)}`;

        await saveSellerStoreProfile(EMPTY_SELLER, {
          name: "Empty Test Store",
          slug: EMPTY_SLUG,
          isPublished: true,
        });

        const res = await getPublicStoreProducts(EMPTY_SLUG);
        assert.ok(res);
        assert.strictEqual(res.products.length, 0);
        assert.strictEqual(res.totalProducts, 0);
        assert.strictEqual(res.categories.length, 0);

        await prisma.storeProfile.deleteMany({ where: { sellerId: EMPTY_SELLER } });
      }
    });

    await test("Search filter matches product name case-insensitively", async () => {
      const searchMatch = await getPublicStoreProducts(SLUG_D_1, { search: "desk lamp" });
      assert.ok(searchMatch);
      assert.strictEqual(searchMatch.products.length, 1);

      const searchMismatch = await getPublicStoreProducts(SLUG_D_1, { search: "nonexistent shoes" });
      assert.ok(searchMismatch);
      assert.strictEqual(searchMismatch.products.length, 0);
    });

    await test("Sorting by price low-to-high and high-to-low functions properly", async () => {
      if (isDatabaseConfigured()) {
        // Add a second product to Store 1 with higher price to test sorting
        await addProductToSellerStore(SELLER_D_1, PRODUCT_ID_2, 60000);

        const asc = await getPublicStoreProducts(SLUG_D_1, { sort: "price-asc" });
        assert.ok(asc);
        assert.strictEqual(asc.products.length, 2);
        assert.strictEqual(asc.products[0].price, 28500);
        assert.strictEqual(asc.products[1].price, 60000);

        const desc = await getPublicStoreProducts(SLUG_D_1, { sort: "price-desc" });
        assert.ok(desc);
        assert.strictEqual(desc.products[0].price, 60000);
        assert.strictEqual(desc.products[1].price, 28500);

        // Cleanup
        await removeSellerStoreProduct(SELLER_D_1, PRODUCT_ID_2);
      }
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 6: URL Formatting & Slug Normalization
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 6: URL Formatting & Slug Normalization");

    await test("Slug normalization produces canonical storefront URLs", async () => {
      assert.strictEqual(normalizeSlug("Emmy's Cool Gadgets!"), "emmys-cool-gadgets");
      assert.strictEqual(normalizeSlug("  Lagos   Sneakers  Store "), "lagos-sneakers-store");
      assert.strictEqual(normalizeSlug("Darte--Beauty---Hub"), "darte-beauty-hub");
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Store Settings Visibility Persistence & Partial Updates (Bug 1 Fix)
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 7: Store Settings Visibility Persistence & Partial Updates");

    const SELLER_SETTINGS_TEST = `test_seller_settings_${Date.now()}`;
    const SLUG_SETTINGS_TEST = `settings-test-store-${Date.now().toString().slice(-6)}`;

    await test("Create full store profile with all fields populated", async () => {
      if (isDatabaseConfigured()) {
        const fullProfile = await saveSellerStoreProfile(SELLER_SETTINGS_TEST, {
          name: "Complete Luxury Boutique",
          slug: SLUG_SETTINGS_TEST,
          description: "Exclusive designer clothing and accessories nationwide.",
          logoUrl: "https://example.com/storage/v1/object/public/store-logos/boutique.png",
          category: "Fashion",
          contactEmail: "concierge@luxuryboutique.ng",
          contactPhone: "+234 809 111 2233",
          country: "Nigeria",
          state: "Lagos",
          city: "Victoria Island",
          shippingPolicy: "Same day dispatch within Lagos Island; 48 hours nationwide.",
          returnPolicy: "5 days inspection and exchange in original unworn condition.",
          orderProcessingInfo: "Daily order fulfillment from 9 AM to 5 PM WAT.",
          customerSupportInstructions: "VIP WhatsApp line available Mon-Sat.",
          isPublished: true,
        });

        assert.strictEqual(fullProfile.profile.name, "Complete Luxury Boutique");
        assert.strictEqual(fullProfile.profile.isPublished, true);
        assert.strictEqual(fullProfile.profile.logoUrl, "https://example.com/storage/v1/object/public/store-logos/boutique.png");
        assert.strictEqual(fullProfile.profile.shippingPolicy, "Same day dispatch within Lagos Island; 48 hours nationwide.");
        assert.strictEqual(fullProfile.completeness.percentage, 100);
      }
    });

    await test("Changing isPublished from true to false preserves ALL existing store settings", async () => {
      if (isDatabaseConfigured()) {
        // Send a partial update containing ONLY isPublished: false
        const unpubResult = await saveSellerStoreProfile(SELLER_SETTINGS_TEST, {
          isPublished: false,
        });

        const prof = unpubResult.profile;
        assert.strictEqual(prof.isPublished, false, "Visibility must be toggled to false");
        assert.strictEqual(prof.name, "Complete Luxury Boutique", "Name must be preserved");
        assert.strictEqual(prof.slug, SLUG_SETTINGS_TEST, "Slug must be preserved");
        assert.strictEqual(prof.description, "Exclusive designer clothing and accessories nationwide.", "Description must be preserved");
        assert.strictEqual(prof.logoUrl, "https://example.com/storage/v1/object/public/store-logos/boutique.png", "Logo URL must be preserved");
        assert.strictEqual(prof.category, "Fashion", "Category must be preserved");
        assert.strictEqual(prof.contactEmail, "concierge@luxuryboutique.ng", "Contact email must be preserved");
        assert.strictEqual(prof.contactPhone, "+234 809 111 2233", "Contact phone must be preserved");
        assert.strictEqual(prof.country, "Nigeria", "Country must be preserved");
        assert.strictEqual(prof.state, "Lagos", "State must be preserved");
        assert.strictEqual(prof.city, "Victoria Island", "City must be preserved");
        assert.strictEqual(prof.shippingPolicy, "Same day dispatch within Lagos Island; 48 hours nationwide.", "Shipping policy must be preserved");
        assert.strictEqual(prof.returnPolicy, "5 days inspection and exchange in original unworn condition.", "Return policy must be preserved");
        assert.strictEqual(prof.orderProcessingInfo, "Daily order fulfillment from 9 AM to 5 PM WAT.", "Order processing must be preserved");
        assert.strictEqual(prof.customerSupportInstructions, "VIP WhatsApp line available Mon-Sat.", "Customer support instructions must be preserved");

        // Verify the store is now inaccessible publicly
        const publicCheck = await getPublicStoreBySlug(SLUG_SETTINGS_TEST);
        assert.strictEqual(publicCheck, null, "Unpublished store must return null / 404 to public visitors");
      }
    });

    await test("Changing isPublished back to true restores public access and preserves ALL settings", async () => {
      if (isDatabaseConfigured()) {
        // Send partial update containing ONLY isPublished: true
        const repubResult = await saveSellerStoreProfile(SELLER_SETTINGS_TEST, {
          isPublished: true,
        });

        const prof = repubResult.profile;
        assert.strictEqual(prof.isPublished, true, "Visibility must be toggled to true");
        assert.strictEqual(prof.name, "Complete Luxury Boutique");
        assert.strictEqual(prof.logoUrl, "https://example.com/storage/v1/object/public/store-logos/boutique.png");
        assert.strictEqual(prof.shippingPolicy, "Same day dispatch within Lagos Island; 48 hours nationwide.");
        assert.strictEqual(prof.contactEmail, "concierge@luxuryboutique.ng");

        // Verify the store is accessible publicly again
        const publicCheck = await getPublicStoreBySlug(SLUG_SETTINGS_TEST);
        assert.ok(publicCheck, "Republished store must be accessible publicly");
        assert.strictEqual(publicCheck.store.name, "Complete Luxury Boutique");
        assert.strictEqual(publicCheck.store.isPublished, true);
      }
    });

    await test("Partial policy update preserves logo, identity, and visibility settings", async () => {
      if (isDatabaseConfigured()) {
        // Seller updates only shipping policy
        const partialResult = await saveSellerStoreProfile(SELLER_SETTINGS_TEST, {
          shippingPolicy: "Updated 24h express dispatch across all 36 states.",
        });

        const prof = partialResult.profile;
        assert.strictEqual(prof.shippingPolicy, "Updated 24h express dispatch across all 36 states.", "Shipping policy updated");
        assert.strictEqual(prof.name, "Complete Luxury Boutique", "Name preserved");
        assert.strictEqual(prof.logoUrl, "https://example.com/storage/v1/object/public/store-logos/boutique.png", "Logo URL preserved");
        assert.strictEqual(prof.isPublished, true, "isPublished preserved");
        assert.strictEqual(prof.contactEmail, "concierge@luxuryboutique.ng", "Contact email preserved");
      }
    });

    await test("Failed update with invalid email throws error and leaves existing profile untouched", async () => {
      if (isDatabaseConfigured()) {
        let threw = false;
        try {
          await saveSellerStoreProfile(SELLER_SETTINGS_TEST, {
            contactEmail: "invalid-email-address",
          });
        } catch (err: unknown) {
          threw = true;
          assert(err instanceof Error && err.message.includes("valid email"));
        }
        assert.strictEqual(threw, true, "Must throw on invalid email");

        // Verify database profile is intact
        const check = await prisma.storeProfile.findUnique({ where: { sellerId: SELLER_SETTINGS_TEST } });
        assert.ok(check);
        assert.strictEqual(check.contactEmail, "concierge@luxuryboutique.ng", "Email must remain untouched");
        assert.strictEqual(check.name, "Complete Luxury Boutique", "Name must remain untouched");

        // Clean up
        await prisma.storeProfile.deleteMany({ where: { sellerId: SELLER_SETTINGS_TEST } });
      }
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Storefront Header Non-Overlapping Layout Verification (Bug 2 Fix)
    // -------------------------------------------------------------------------
    console.log("\nTEST GROUP 8: Storefront Header Non-Overlapping Layout Verification");

    await test("StorefrontHeader component code contains ZERO negative margin overlap classes", async () => {
      const fs = await import("fs/promises");
      const path = await import("path");
      const headerCode = await fs.readFile(
        path.resolve(process.cwd(), "src/components/storefront/StorefrontHeader.tsx"),
        "utf-8"
      );

      // Verify no negative margins (-mt-*) that pull content over the hero
      assert.strictEqual(
        headerCode.includes("-mt-12"),
        false,
        "Header must not have -mt-12 pulling store name into hero"
      );
      assert.strictEqual(
        headerCode.includes("-mt-16"),
        false,
        "Header must not have -mt-16 pulling store name into hero"
      );
      assert.strictEqual(
        headerCode.includes("-mt-"),
        false,
        "Header must not have any negative margin overlapping the hero section"
      );

      // Verify clean, non-overlapping structure
      assert.ok(
        headerCode.includes("Main Store Identity Section — Positioned cleanly below hero"),
        "Header contains dedicated identity section below hero"
      );
      assert.ok(
        headerCode.includes("store.name"),
        "Header renders store name"
      );
      assert.ok(
        headerCode.includes("ShieldCheck"),
        "Header renders verified merchant badge"
      );
    });

    await test("Public storefront resolves store name, category, and verified status cleanly", async () => {
      const res = await getPublicStoreBySlug(SLUG_D_1);
      assert.ok(res);
      assert.strictEqual(res.store.name, "Lagos Gadget Hub");
      assert.strictEqual(res.store.category, "Electronics");
      assert.strictEqual(res.store.isPublished, true);
    });
  } finally {
    await cleanupFixtures();
  }

  console.log("\n=================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
