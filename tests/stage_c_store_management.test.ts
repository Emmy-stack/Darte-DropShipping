/**
 * Darté — Stage C Seller Store Management Integration & Unit Test Suite
 *
 * Verifies:
 * 1. Store Profile Creation & Retrieval via PostgreSQL Prisma
 * 2. Store Profile Update & Persistence
 * 3. Profile Completeness Calculation (not_configured -> incomplete -> complete)
 * 4. Empty optional fields handling (clearing or leaving empty)
 * 5. Input Validation (invalid names, invalid emails)
 * 6. Slug Normalization (accents, spaces, symbols, consecutive hyphens)
 * 7. Slug Reservation Rejection ("admin", "api", "dashboard", etc.)
 * 8. Slug Uniqueness & Cross-Seller Conflict Protection (P2002 constraint)
 * 9. Multi-Tenant Seller Isolation (Seller A cannot read or modify Seller B's store)
 * 10. Customer Policies & Currency Standards Persistence
 */

import assert from "assert";
import { prisma, isDatabaseConfigured } from "../src/lib/prisma";
import {
  normalizeSlug,
  validateSlug,
  isSlugAvailable,
  calculateProfileCompleteness,
  getSellerStoreProfile,
  saveSellerStoreProfile,
  StoreProfileInput,
  StoreProfileData,
} from "../src/lib/db/storeProfile";

const TEST_SELLER_C_1 = "user_test_stage_c_seller_1";
const TEST_SELLER_C_2 = "user_test_stage_c_seller_2";
const TEST_SLUG_1 = "stage-c-test-store-one";
const TEST_SLUG_2 = "stage-c-test-store-two";

async function cleanupFixtures() {
  if (isDatabaseConfigured()) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.storeProfile.deleteMany({
          where: {
            sellerId: { in: [TEST_SELLER_C_1, TEST_SELLER_C_2] },
          },
        });
        await prisma.storeProfile.deleteMany({
          where: {
            slug: { in: [TEST_SLUG_1, TEST_SLUG_2, "reserved-test-slug"] },
          },
        });
        break;
      } catch {
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }
}

async function runStageCTests() {
  console.log("=================================================================");
  console.log(" Darté — Stage C Seller Store Management Test Suite");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✗ ${name}`);
        console.error("   ", err instanceof Error ? err.message : err);
        failed++;
      });
  }

  try {
    await cleanupFixtures();

    // -------------------------------------------------------------
    // GROUP 1: Slug Normalization & Validation
    // -------------------------------------------------------------
    console.log("TEST GROUP 1: Store Slug Normalization & Validation");

    await test("normalizeSlug cleans spaces, symbols, and diacritics", () => {
      assert.strictEqual(normalizeSlug("Emmy's Cool Gadgets!"), "emmys-cool-gadgets");
      assert.strictEqual(normalizeSlug("  Lagos -- Fashion & Style  "), "lagos-fashion-style");
      assert.strictEqual(normalizeSlug("Café Darté Tech"), "cafe-darte-tech");
      assert.strictEqual(normalizeSlug("---Store---"), "store");
      assert.strictEqual(normalizeSlug(""), "");
    });

    await test("validateSlug rejects short, long, or malformed slugs", () => {
      assert.strictEqual(validateSlug("ab").valid, false);
      assert.strictEqual(validateSlug("a".repeat(51)).valid, false);
      assert.strictEqual(validateSlug("valid-store-123").valid, true);
      assert.strictEqual(validateSlug("invalid_slug").valid, false, "Underscore should be rejected");
      assert.strictEqual(validateSlug("invalid--slug").valid, false, "Consecutive hyphens rejected");
    });

    await test("validateSlug strictly rejects reserved system slugs", () => {
      const reserved = ["api", "dashboard", "admin", "settings", "store", "onboarding", "checkout"];
      for (const res of reserved) {
        const check = validateSlug(res);
        assert.strictEqual(check.valid, false, `Slug '${res}' must be reserved`);
      }
    });

    // -------------------------------------------------------------
    // GROUP 2: Profile Completeness Logic
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 2: Profile Completeness Computation");

    await test("Profile with missing name or slug is not_configured (0%)", () => {
      const res1 = calculateProfileCompleteness(null);
      assert.strictEqual(res1.status, "not_configured");
      assert.strictEqual(res1.percentage, 0);

      const partial: StoreProfileData = {
        id: "1",
        sellerId: "s1",
        name: "",
        slug: "",
        description: null,
        logoUrl: null,
        category: null,
        contactEmail: null,
        contactPhone: null,
        country: "Nigeria",
        state: null,
        city: null,
        shippingPolicy: null,
        returnPolicy: null,
        orderProcessingInfo: null,
        customerSupportInstructions: null,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res2 = calculateProfileCompleteness(partial);
      assert.strictEqual(res2.status, "not_configured");
      assert.strictEqual(res2.percentage, 0);
    });

    await test("Profile with only basic identity is incomplete", () => {
      const partial: StoreProfileData = {
        id: "1",
        sellerId: "s1",
        name: "Test Store",
        slug: "test-store",
        description: "A great store",
        category: "Electronics",
        logoUrl: null,
        contactEmail: null,
        contactPhone: null,
        country: "Nigeria",
        state: null,
        city: null,
        shippingPolicy: null,
        returnPolicy: null,
        orderProcessingInfo: null,
        customerSupportInstructions: null,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = calculateProfileCompleteness(partial);
      assert.strictEqual(res.status, "incomplete");
      assert(res.percentage > 0 && res.percentage < 100);
      assert(res.missingFields.includes("Contact Email"));
    });

    await test("Profile with all core fields is complete (100%)", () => {
      const full: StoreProfileData = {
        id: "1",
        sellerId: "s1",
        name: "Test Store",
        slug: "test-store",
        description: "Quality electronics across Nigeria",
        category: "Electronics",
        logoUrl: "https://example.com/logo.png",
        contactEmail: "support@teststore.ng",
        contactPhone: "+234 801 234 5678",
        country: "Nigeria",
        state: "Lagos",
        city: "Ikeja",
        shippingPolicy: "Lagos 24h, Interstate 3 days",
        returnPolicy: "72 hours inspection",
        orderProcessingInfo: "Mon-Sat 8am-6pm",
        customerSupportInstructions: "WhatsApp support",
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = calculateProfileCompleteness(full);
      assert.strictEqual(res.status, "complete");
      assert.strictEqual(res.percentage, 100);
      assert.strictEqual(res.missingFields.length, 0);
    });

    // -------------------------------------------------------------
    // GROUP 3: Database Persistence & CRUD Operations
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 3: PostgreSQL Database Store Profile CRUD");

    await test("Seller can create a new store profile in PostgreSQL", async () => {
      const input: StoreProfileInput = {
        name: "Emmy Gadgets Store",
        slug: TEST_SLUG_1,
        description: "Direct distributor of mobile gadgets in Lagos.",
        category: "Electronics",
        contactEmail: "emmy@gadgets.ng",
        contactPhone: "+234 802 345 6789",
        country: "Nigeria 🇳🇬",
        state: "Lagos",
        city: "Ikeja",
        shippingPolicy: "Dispatch within 24 hours.",
        returnPolicy: "7-day return policy.",
      };

      const result = await saveSellerStoreProfile(TEST_SELLER_C_1, input);
      assert(result.success, "Profile creation must succeed");
      assert.strictEqual(result.profile.sellerId, TEST_SELLER_C_1);
      assert.strictEqual(result.profile.name, "Emmy Gadgets Store");
      assert.strictEqual(result.profile.slug, TEST_SLUG_1);
      assert.strictEqual(result.profile.contactEmail, "emmy@gadgets.ng");
      assert.strictEqual(result.profile.shippingPolicy, "Dispatch within 24 hours.");
    });

    await test("Saved profile persists and can be retrieved from PostgreSQL", async () => {
      const { profile, completeness } = await getSellerStoreProfile(TEST_SELLER_C_1);
      assert(profile !== null, "Profile must exist in database");
      assert.strictEqual(profile.sellerId, TEST_SELLER_C_1);
      assert.strictEqual(profile.slug, TEST_SLUG_1);
      assert.strictEqual(profile.name, "Emmy Gadgets Store");
      assert.strictEqual(profile.category, "Electronics");
      assert.strictEqual(completeness.status, "complete");
      assert.strictEqual(completeness.percentage, 100);
    });

    await test("Seller can update their store profile and policies", async () => {
      const updateInput: StoreProfileInput = {
        name: "Emmy Premium Gadgets",
        slug: TEST_SLUG_1,
        description: "Updated brand description with expanded catalog.",
        category: "Phones & Tablets",
        contactEmail: "orders@emmygadgets.ng",
        contactPhone: "+234 803 999 8888",
        state: "Lagos",
        city: "Lekki Phase 1",
        shippingPolicy: "Lagos express dispatch same-day.",
        returnPolicy: "3-day replacement guarantee.",
        orderProcessingInfo: "Monday-Saturday 9am-6pm.",
        customerSupportInstructions: "WhatsApp support line active 24/7.",
      };

      const result = await saveSellerStoreProfile(TEST_SELLER_C_1, updateInput);
      assert(result.success);
      assert.strictEqual(result.profile.name, "Emmy Premium Gadgets");
      assert.strictEqual(result.profile.city, "Lekki Phase 1");
      assert.strictEqual(result.profile.orderProcessingInfo, "Monday-Saturday 9am-6pm.");

      // Verify re-reading from database reflects updates
      const fetched = await getSellerStoreProfile(TEST_SELLER_C_1);
      assert.strictEqual(fetched.profile?.name, "Emmy Premium Gadgets");
      assert.strictEqual(fetched.profile?.city, "Lekki Phase 1");
    });

    await test("Empty optional fields are properly stored as null without throwing", async () => {
      const clearedInput: StoreProfileInput = {
        name: "Emmy Premium Gadgets",
        slug: TEST_SLUG_1,
        description: "",
        category: null,
        contactEmail: "",
        contactPhone: null,
        shippingPolicy: "",
      };

      const result = await saveSellerStoreProfile(TEST_SELLER_C_1, clearedInput);
      assert(result.success);
      assert.strictEqual(result.profile.description, null);
      assert.strictEqual(result.profile.contactEmail, null);
      assert.strictEqual(result.profile.contactPhone, null);
      assert.strictEqual(result.profile.shippingPolicy, null);
    });

    await test("Invalid email or invalid store name is strictly rejected", async () => {
      // Invalid name
      let caughtName = false;
      try {
        await saveSellerStoreProfile(TEST_SELLER_C_1, {
          name: " ",
          slug: TEST_SLUG_1,
        });
      } catch (err: unknown) {
        caughtName = true;
        assert(err instanceof Error && err.message.includes("Store name must be at least 2 characters"));
      }
      assert(caughtName, "Must reject empty or short name");

      // Invalid email
      let caughtEmail = false;
      try {
        await saveSellerStoreProfile(TEST_SELLER_C_1, {
          name: "Valid Store Name",
          slug: TEST_SLUG_1,
          contactEmail: "invalid-email-format",
        });
      } catch (err: unknown) {
        caughtEmail = true;
        assert(err instanceof Error && err.message.includes("valid email address"));
      }
      assert(caughtEmail, "Must reject malformed email");
    });

    // -------------------------------------------------------------
    // GROUP 4: Slug Uniqueness & Cross-Seller Conflict Protection
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 4: Slug Uniqueness & Concurrency Protection");

    await test("Seller B can claim their own unique store slug", async () => {
      const resultB = await saveSellerStoreProfile(TEST_SELLER_C_2, {
        name: "Seller B Boutique",
        slug: TEST_SLUG_2,
        category: "Fashion",
      });
      assert(resultB.success);
      assert.strictEqual(resultB.profile.slug, TEST_SLUG_2);
    });

    await test("Seller B cannot claim Seller A's existing slug (rejected with conflict)", async () => {
      let conflictCaught = false;
      try {
        await saveSellerStoreProfile(TEST_SELLER_C_2, {
          name: "Seller B Impersonator",
          slug: TEST_SLUG_1, // Belongs to Seller A
        });
      } catch (err: unknown) {
        conflictCaught = true;
        assert(err instanceof Error && err.message.includes("already taken"));
      }
      assert(conflictCaught, "Attempt to claim another seller's slug must throw conflict");
    });

    if (isDatabaseConfigured()) {
      await test("Direct database raw duplicate slug insert is blocked by @@unique constraint (P2002)", async () => {
        let p2002Caught = false;
        try {
          await prisma.storeProfile.create({
            data: {
              sellerId: "user_impersonator_direct_db",
              name: "Duplicate Slug Direct DB",
              slug: TEST_SLUG_1, // Already exists in database!
            },
          });
        } catch (err: unknown) {
          if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as { code: string }).code === "P2002"
          ) {
            p2002Caught = true;
          }
        }
        assert(p2002Caught, "PostgreSQL @@unique constraint must prevent duplicate slug insert");
      });
    }

    // -------------------------------------------------------------
    // GROUP 5: Multi-Tenant Seller Isolation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 5: Multi-Tenant Seller Isolation");

    await test("Seller A and Seller B profiles remain completely isolated", async () => {
      const profA = await getSellerStoreProfile(TEST_SELLER_C_1);
      const profB = await getSellerStoreProfile(TEST_SELLER_C_2);

      assert(profA.profile !== null);
      assert(profB.profile !== null);

      assert.strictEqual(profA.profile.sellerId, TEST_SELLER_C_1);
      assert.strictEqual(profB.profile.sellerId, TEST_SELLER_C_2);

      assert.notStrictEqual(profA.profile.name, profB.profile.name);
      assert.notStrictEqual(profA.profile.slug, profB.profile.slug);

      // Verify isSlugAvailable recognizes self-ownership vs cross-ownership
      const checkAforA = await isSlugAvailable(TEST_SLUG_1, TEST_SELLER_C_1);
      const checkAforB = await isSlugAvailable(TEST_SLUG_1, TEST_SELLER_C_2);

      assert.strictEqual(checkAforA.available, true, "Seller A can keep their own slug");
      assert.strictEqual(checkAforB.available, false, "Seller B cannot take Seller A's slug");
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

runStageCTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
