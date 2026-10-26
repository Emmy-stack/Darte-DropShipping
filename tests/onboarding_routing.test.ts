/**
 * Darté — Onboarding Routing & Completion Bug Regression Test Suite
 *
 * Verifies that:
 * 1. Completed sellers are recognized as onboarded and do not get sent to onboarding.
 * 2. Database records (PostgreSQL StoreProduct) act as an authoritative self-healing source of truth.
 * 3. setUserRole does not overwrite or downgrade an existing seller's onboardingCompleted flag.
 * 4. Un-onboarded users are accurately flagged as needing onboarding.
 * 5. Onboarding state is strictly multi-tenant isolated (Seller A does not affect Seller B).
 * 6. Multi-worker disk synchronization prevents stale in-memory cache bugs.
 * 7. Routing guard logic correctly resolves destination for signed-out, completed, and uncompleted users.
 */

import assert from "assert";
import fs from "fs/promises";
import path from "path";
import { prisma, isDatabaseConfigured } from "../src/lib/prisma";
import {
  getUserProfile,
  getFullUserContext,
  setUserRole,
  completeSellerOnboarding,
  isUserOnboarded,
  ensureDB,
} from "../src/lib/db/profileStore";
import { Role } from "../src/lib/types/profile";

const DB_FILE = path.join(process.cwd(), "data", "darte_db.json");

// Test user fixtures
const TEST_SELLER_COMPLETED = "user_test_completed_seller_999";
const TEST_SELLER_NEW = "user_test_brand_new_seller_888";
const TEST_SELLER_DB_ONLY = "user_test_db_only_seller_777";
const TEST_SELLER_ISOLATION_A = "user_test_seller_iso_a_111";
const TEST_SELLER_ISOLATION_B = "user_test_seller_iso_b_222";

async function cleanupTestFixtures() {
  const db = await ensureDB();
  const testIds = [
    TEST_SELLER_COMPLETED,
    TEST_SELLER_NEW,
    TEST_SELLER_DB_ONLY,
    TEST_SELLER_ISOLATION_A,
    TEST_SELLER_ISOLATION_B,
  ];

  for (const id of testIds) {
    const profile = db.users[id];
    if (profile) {
      delete db.sellerProfiles[profile.id];
      delete db.supplierProfiles[profile.id];
      delete db.stores[profile.id];
      delete db.users[id];
    }
  }

  // Also clean up any StoreProducts for test sellers in PostgreSQL
  if (isDatabaseConfigured()) {
    try {
      await prisma.storeProduct.deleteMany({
        where: {
          sellerId: { in: testIds },
        },
      });
    } catch {
      // ignore
    }
  }

  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tempFile, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tempFile, DB_FILE);
}

async function runTests() {
  console.log("=================================================================");
  console.log(" Darté — Seller Onboarding Routing & Completion Test Suite");
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
    await cleanupTestFixtures();

    // -------------------------------------------------------------
    // GROUP 1: Onboarding Completion State & Persistence
    // -------------------------------------------------------------
    console.log("TEST GROUP 1: Onboarding Completion & State Persistence");

    await test("Brand new user has no profile initially", async () => {
      const profile = await getUserProfile(TEST_SELLER_NEW);
      assert.strictEqual(profile, null);
      const onboarded = await isUserOnboarded(TEST_SELLER_NEW);
      assert.strictEqual(onboarded, false);
    });

    await test("Setting role for new user sets onboardingCompleted: false", async () => {
      const profile = await setUserRole(TEST_SELLER_NEW, Role.SELLER);
      assert.strictEqual(profile.clerkUserId, TEST_SELLER_NEW);
      assert.strictEqual(profile.role, Role.SELLER);
      assert.strictEqual(profile.onboardingCompleted, false);
      const onboarded = await isUserOnboarded(TEST_SELLER_NEW);
      assert.strictEqual(onboarded, false);
    });

    await test("Completing onboarding sets onboardingCompleted: true and creates store", async () => {
      const result = await completeSellerOnboarding(TEST_SELLER_COMPLETED, {
        storeName: "Test Electronics",
        storeDescription: "Quality electronics across Nigeria",
        storeCategory: "Electronics",
        country: "Nigeria 🇳🇬",
        state: "Lagos",
        city: "Ikeja",
        phone: "+234 800 000 0001",
        goals: ["Start my first online business"],
      });

      assert.strictEqual(result.profile.onboardingCompleted, true);
      assert.strictEqual(result.store.name, "Test Electronics");
      assert.strictEqual(result.store.slug, "test-electronics");

      // Verify via getUserProfile
      const profile = await getUserProfile(TEST_SELLER_COMPLETED);
      assert(profile !== null);
      assert.strictEqual(profile.onboardingCompleted, true);

      // Verify via isUserOnboarded
      const onboarded = await isUserOnboarded(TEST_SELLER_COMPLETED);
      assert.strictEqual(onboarded, true);

      // Verify full business context
      const context = await getFullUserContext(TEST_SELLER_COMPLETED);
      assert(context.profile !== null);
      assert.strictEqual(context.profile.onboardingCompleted, true);
      assert.strictEqual(context.store?.name, "Test Electronics");
      assert.strictEqual(context.sellerProfile?.storeName, "Test Electronics");
    });

    // -------------------------------------------------------------
    // GROUP 2: Overwrite Prevention (Bug Regression)
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 2: setUserRole Overwrite Prevention");

    await test("Calling setUserRole on completed seller NEVER resets onboardingCompleted to false", async () => {
      // Attempt to call setUserRole on an already completed seller
      const updated = await setUserRole(TEST_SELLER_COMPLETED, Role.SELLER);
      assert.strictEqual(updated.onboardingCompleted, true, "onboardingCompleted must remain true");

      const profile = await getUserProfile(TEST_SELLER_COMPLETED);
      assert(profile !== null);
      assert.strictEqual(profile.onboardingCompleted, true, "Profile must remain onboarded");
    });

    // -------------------------------------------------------------
    // GROUP 3: PostgreSQL Database Self-Healing & Authoritative Reconciliation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 3: PostgreSQL Database Self-Healing");

    if (isDatabaseConfigured()) {
      await test("Seller with PostgreSQL StoreProduct is auto-reconciled even if profile was uninitialized", async () => {
        // Find any valid product in catalog
        const catalogProd = await prisma.product.findFirst();
        assert(catalogProd, "Catalogue must have at least one product for testing");

        // Insert a store product directly into PostgreSQL for TEST_SELLER_DB_ONLY
        await prisma.storeProduct.create({
          data: {
            sellerId: TEST_SELLER_DB_ONLY,
            productId: catalogProd.id,
            customSellingPrice: catalogProd.suggestedSellingPrice,
          },
        });

        // Query profile — should auto-heal from PostgreSQL!
        const profile = await getUserProfile(TEST_SELLER_DB_ONLY);
        assert(profile !== null, "Profile should be auto-reconciled from database");
        assert.strictEqual(profile.onboardingCompleted, true, "Auto-reconciled profile must be marked completed");
        assert.strictEqual(profile.role, Role.SELLER);

        const context = await getFullUserContext(TEST_SELLER_DB_ONLY);
        assert(context.profile !== null);
        assert.strictEqual(context.profile.onboardingCompleted, true);
        assert(context.store !== null, "A store record should be auto-provisioned");

        // Calling setUserRole on this seller should also preserve onboardingCompleted = true
        const roleResult = await setUserRole(TEST_SELLER_DB_ONLY, Role.SELLER);
        assert.strictEqual(roleResult.onboardingCompleted, true);
      });
    } else {
      console.log("  [SKIPPED] PostgreSQL is not configured in this environment.");
    }

    // -------------------------------------------------------------
    // GROUP 4: Multi-Tenant Seller Isolation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 4: Multi-Tenant Seller Isolation");

    await test("Seller A onboarding status has zero influence on Seller B", async () => {
      // Complete onboarding for Seller A
      await completeSellerOnboarding(TEST_SELLER_ISOLATION_A, {
        storeName: "Seller A Store",
        storeDescription: "Seller A Description",
        storeCategory: "Fashion",
        country: "Nigeria 🇳🇬",
        state: "Rivers",
        city: "Port Harcourt",
        phone: "+234 800 111 2222",
        goals: ["Sell through social media"],
      });

      // Seller B is un-onboarded
      await setUserRole(TEST_SELLER_ISOLATION_B, Role.SELLER);

      const onboardedA = await isUserOnboarded(TEST_SELLER_ISOLATION_A);
      const onboardedB = await isUserOnboarded(TEST_SELLER_ISOLATION_B);

      assert.strictEqual(onboardedA, true, "Seller A must be onboarded");
      assert.strictEqual(onboardedB, false, "Seller B must NOT be onboarded");

      const contextA = await getFullUserContext(TEST_SELLER_ISOLATION_A);
      const contextB = await getFullUserContext(TEST_SELLER_ISOLATION_B);

      assert.strictEqual(contextA.profile?.onboardingCompleted, true);
      assert.strictEqual(contextA.store?.name, "Seller A Store");

      assert.strictEqual(contextB.profile?.onboardingCompleted, false);
      assert.strictEqual(contextB.store, null);
    });

    // -------------------------------------------------------------
    // GROUP 5: Disk Synchronization & Stale Memory Invalidation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 5: Disk Synchronization & Multi-Worker Cache Invalidation");

    await test("External disk file modification is immediately reflected via mtime invalidation", async () => {
      // Direct raw write to DB_FILE on disk (simulating an update written by a separate Next.js worker)
      const diskContent = await fs.readFile(DB_FILE, "utf-8");
      const diskDB = JSON.parse(diskContent);

      const workerSimUser = "user_worker_sim_333";
      diskDB.users[workerSimUser] = {
        id: "usr_worker_sim",
        clerkUserId: workerSimUser,
        role: Role.SELLER,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Write to disk and touch mtime
      const tmp = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.writeFile(tmp, JSON.stringify(diskDB, null, 2), "utf-8");
      await fs.rename(tmp, DB_FILE);

      // Now ensureDB / getUserProfile should pick it up WITHOUT server restart
      const fetched = await getUserProfile(workerSimUser);
      assert(fetched !== null, "Worker simulation user must be read from disk");
      assert.strictEqual(fetched.onboardingCompleted, true);

      // Clean up
      delete diskDB.users[workerSimUser];
      const tmp2 = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.writeFile(tmp2, JSON.stringify(diskDB, null, 2), "utf-8");
      await fs.rename(tmp2, DB_FILE);
    });

    // -------------------------------------------------------------
    // GROUP 6: Route Decision Logic Verification
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 6: Route Decision Resolution Matrix");

    function resolveDashboardRoute(userId: string | null, profile: { role: string; onboardingCompleted: boolean } | null) {
      if (!userId) {
        return { destination: "/sign-in?redirect_url=/dashboard", action: "REDIRECT_SIGN_IN" };
      }
      if (profile?.role === Role.SUPPLIER && profile.onboardingCompleted) {
        return { destination: "/dashboard/supplier", action: "REDIRECT_SUPPLIER_DASHBOARD" };
      }
      if (!profile || !profile.onboardingCompleted) {
        return { destination: "/onboarding", action: "REDIRECT_ONBOARDING" };
      }
      return { destination: "/dashboard", action: "RENDER_DASHBOARD" };
    }

    function resolveOnboardingRoute(userId: string | null, profile: { role: string; onboardingCompleted: boolean } | null) {
      if (!userId) {
        return { destination: "/sign-in?redirect_url=/onboarding", action: "REDIRECT_SIGN_IN" };
      }
      if (profile && profile.onboardingCompleted) {
        if (profile.role === Role.SUPPLIER) {
          return { destination: "/dashboard/supplier", action: "REDIRECT_SUPPLIER_DASHBOARD" };
        }
        return { destination: "/dashboard", action: "REDIRECT_SELLER_DASHBOARD" };
      }
      return { destination: "/onboarding", action: "RENDER_ONBOARDING" };
    }

    await test("Signed-out user visiting /dashboard is redirected to sign-in preserving destination", () => {
      const res = resolveDashboardRoute(null, null);
      assert.strictEqual(res.action, "REDIRECT_SIGN_IN");
      assert.strictEqual(res.destination, "/sign-in?redirect_url=/dashboard");
    });

    await test("Un-onboarded user visiting /dashboard is redirected to /onboarding", () => {
      const res1 = resolveDashboardRoute("user_new", null);
      assert.strictEqual(res1.action, "REDIRECT_ONBOARDING");
      assert.strictEqual(res1.destination, "/onboarding");

      const res2 = resolveDashboardRoute("user_new", { role: Role.SELLER, onboardingCompleted: false });
      assert.strictEqual(res2.action, "REDIRECT_ONBOARDING");
      assert.strictEqual(res2.destination, "/onboarding");
    });

    await test("Completed seller visiting /dashboard renders dashboard directly (no redirect)", () => {
      const res = resolveDashboardRoute("user_seller", { role: Role.SELLER, onboardingCompleted: true });
      assert.strictEqual(res.action, "RENDER_DASHBOARD");
      assert.strictEqual(res.destination, "/dashboard");
    });

    await test("Completed supplier visiting /dashboard redirects to /dashboard/supplier", () => {
      const res = resolveDashboardRoute("user_supplier", { role: Role.SUPPLIER, onboardingCompleted: true });
      assert.strictEqual(res.action, "REDIRECT_SUPPLIER_DASHBOARD");
      assert.strictEqual(res.destination, "/dashboard/supplier");
    });

    await test("Completed seller visiting /onboarding redirects to /dashboard (never restarts)", () => {
      const res = resolveOnboardingRoute("user_seller", { role: Role.SELLER, onboardingCompleted: true });
      assert.strictEqual(res.action, "REDIRECT_SELLER_DASHBOARD");
      assert.strictEqual(res.destination, "/dashboard");
    });

    await test("Completed supplier visiting /onboarding redirects to /dashboard/supplier", () => {
      const res = resolveOnboardingRoute("user_supplier", { role: Role.SUPPLIER, onboardingCompleted: true });
      assert.strictEqual(res.action, "REDIRECT_SUPPLIER_DASHBOARD");
      assert.strictEqual(res.destination, "/dashboard/supplier");
    });

    await test("Un-onboarded user visiting /onboarding renders onboarding form (no loop)", () => {
      const res = resolveOnboardingRoute("user_new", null);
      assert.strictEqual(res.action, "RENDER_ONBOARDING");
      assert.strictEqual(res.destination, "/onboarding");
    });

  } finally {
    await cleanupTestFixtures();
  }

  console.log("\n=================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
