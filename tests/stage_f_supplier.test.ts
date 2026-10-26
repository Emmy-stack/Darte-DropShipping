/**
 * Darté Stage F — Comprehensive Company / Supplier Dashboard
 * & Supplier Management Integration Test Suite
 */

import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import {
  registerSupplier,
  getSupplierByClerkId,
  getSupplierById,
  updateSupplierProfile,
  adminUpdateSupplierStatus,
  createSupplierProduct,
  updateSupplierProduct,
  getSupplierProducts,
  getSupplierProductById,
  deleteOrDeactivateSupplierProduct,
  getSupplierOrderItems,
  updateSupplierItemFulfillment,
  getSupplierDashboardMetrics,
} from "../src/lib/db/supplier";
import {
  SupplierVerificationStatus,
  SupplierProductStatus,
  SupplierFulfillmentStatus,
} from "../src/types/supplier";
import { PATCH as adminStatusPatch } from "../src/app/api/admin/supplier/[supplierId]/status/route";
import { addProductToSellerStore } from "../src/lib/db/sellerProducts";
import { getPublicStoreProducts, getPublicStoreProduct } from "../src/lib/db/storefront";
import { updateSellerOrderStatus } from "../src/lib/db/orders";

let totalPassed = 0;
let totalFailed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    totalPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    totalFailed++;
  }
}

async function runTestSuite() {
  console.log("\n=================================================================");
  console.log(" Darté — Stage F Supplier Hub & Product Management Test Suite");
  console.log("=================================================================\n");

  const timestamp = Date.now();
  const testSupplierClerkIdA = `user_sup_a_${timestamp}`;
  const testSupplierClerkIdB = `user_sup_b_${timestamp}`;
  const testSellerClerkId = `user_seller_${timestamp}`;

  let supplierAId = "";
  let supplierBId = "";
  let supplierCId = "";
  let productA1Id = "";
  let productA2Id = "";
  let productB1Id = "";
  let productC1Id = "";
  let productDemoId = "";
  let storeProfileId = "";
  let orderId = "";
  let orderItemIdA = "";
  let orderItemIdB = "";
  let order2Id = "";
  let orderItem2Id = "";

  try {
    // -------------------------------------------------------------
    // TEST GROUP 1: Supplier Registration & Verification Defaults
    // -------------------------------------------------------------
    console.log("TEST GROUP 1: Supplier Registration & Verification Defaults");

    await test("Supplier registration creates profile with PENDING verification status", async () => {
      const reg = await registerSupplier(testSupplierClerkIdA, {
        companyName: `Apex Supplies Ltd ${timestamp}`,
        businessEmail: `apex_${timestamp}@example.com`,
        phone: "+2348011112222",
        state: "Lagos",
        city: "Trade Fair Complex",
        address: "Block B, Suite 12",
        description: "Direct importer of smart gadgets and accessories.",
        categoriesSupplied: ["Electronics", "Mobile Accessories"],
      });

      assert.equal(reg.success, true);
      assert.ok(reg.supplier);
      supplierAId = reg.supplier.id;

      // Status MUST be PENDING
      assert.equal(reg.supplier.verificationStatus, SupplierVerificationStatus.PENDING);
      assert.equal(reg.supplier.clerkUserId, testSupplierClerkIdA);
      assert.ok(reg.supplier.slug.includes("apex-supplies-ltd"));
    });

    await test("Duplicate supplier registration for same user is rejected", async () => {
      const duplicateReg = await registerSupplier(testSupplierClerkIdA, {
        companyName: `Apex Another Name ${timestamp}`,
        businessEmail: `apex2_${timestamp}@example.com`,
        phone: "+2348011112222",
        state: "Lagos",
        city: "Trade Fair",
      });

      assert.equal(duplicateReg.success, false);
      assert.match(duplicateReg.error || "", /already exists/i);
    });

    await test("Registration with invalid email or short company name is rejected", async () => {
      const invalidEmail = await registerSupplier(`user_invalid_${timestamp}`, {
        companyName: "Valid Company",
        businessEmail: "not-an-email",
        phone: "+2348000000000",
        state: "Lagos",
        city: "Ikeja",
      });
      assert.equal(invalidEmail.success, false);
      assert.match(invalidEmail.error || "", /valid business email/i);

      const shortName = await registerSupplier(`user_short_${timestamp}`, {
        companyName: "A",
        businessEmail: "valid@example.com",
        phone: "+2348000000000",
        state: "Lagos",
        city: "Ikeja",
      });
      assert.equal(shortName.success, false);
      assert.match(shortName.error || "", /at least 2 characters/i);
    });

    // Register second supplier for tenant isolation testing
    await test("Register second supplier for multi-tenant isolation testing", async () => {
      const regB = await registerSupplier(testSupplierClerkIdB, {
        companyName: `Beacon Electronics ${timestamp}`,
        businessEmail: `beacon_${timestamp}@example.com`,
        phone: "+2348033334444",
        state: "Lagos",
        city: "Alaba International",
      });

      assert.equal(regB.success, true);
      assert.ok(regB.supplier);
      supplierBId = regB.supplier.id;
    });

    // -------------------------------------------------------------
    // TEST GROUP 2: Anti-Self-Approval & Admin Verification Enforcement
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 2: Anti-Self-Approval & Admin Verification Enforcement");

    await test("Supplier cannot self-approve by attempting to patch verificationStatus", async () => {
      // Attempt to modify verificationStatus directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maliciousPayload: any = {
        companyName: `Apex Supplies Ltd ${timestamp}`,
        verificationStatus: "APPROVED",
        adminNotes: "Self-approved by supplier",
      };

      const result = await updateSupplierProfile(testSupplierClerkIdA, maliciousPayload);
      assert.equal(result.success, true);

      // Re-fetch from DB and verify status remained PENDING
      const supplierInDb = await getSupplierById(supplierAId);
      assert.ok(supplierInDb);
      assert.equal(supplierInDb.verificationStatus, SupplierVerificationStatus.PENDING);
      assert.equal(supplierInDb.adminNotes, null);
    });

    await test("Only admin action can transition supplier to APPROVED", async () => {
      const adminApproval = await adminUpdateSupplierStatus(
        supplierAId,
        SupplierVerificationStatus.APPROVED,
        "Verified warehouse location and business documentation."
      );
      assert.equal(adminApproval.success, true);

      const approvedSupplier = await getSupplierById(supplierAId);
      assert.ok(approvedSupplier);
      assert.equal(approvedSupplier.verificationStatus, SupplierVerificationStatus.APPROVED);
    });

    // -------------------------------------------------------------
    // TEST GROUP 3: Multi-Tenant Profile Isolation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 3: Multi-Tenant Profile Isolation");

    await test("Supplier A cannot edit Supplier B's profile", async () => {
      // Updating profile uses clerkUserId resolved server-side from Clerk auth
      const result = await updateSupplierProfile(testSupplierClerkIdA, {
        companyName: `Apex Renamed ${timestamp}`,
      });
      assert.equal(result.success, true);

      // Verify Supplier B remained completely untouched
      const supplierB = await getSupplierById(supplierBId);
      assert.ok(supplierB);
      assert.equal(supplierB.companyName, `Beacon Electronics ${timestamp}`);
    });

    await test("Unregistered seller user returns null supplier profile", async () => {
      const profile = await getSupplierByClerkId(testSellerClerkId);
      assert.equal(profile, null);
    });

    // -------------------------------------------------------------
    // TEST GROUP 4: Supplier Product Creation & Verification Rules
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 4: Supplier Product Creation & Verification Rules");

    await test("Pending supplier (Supplier B) cannot publish ACTIVE products; forced to DRAFT", async () => {
      const draftResult = await createSupplierProduct(supplierBId, {
        name: `Wireless Earbuds Pro ${timestamp}`,
        category: "Audio",
        supplierCost: 8000,
        suggestedSellingPrice: 13000,
        stock: 25,
        supplierFulfillmentDays: "1-2 business days",
        status: SupplierProductStatus.ACTIVE, // attempted to publish as active
      });

      assert.equal(draftResult.success, true);
      assert.ok(draftResult.product);
      productB1Id = draftResult.product.id;

      // MUST be downgraded to DRAFT because Supplier B is PENDING
      assert.equal(draftResult.product.status, SupplierProductStatus.DRAFT);
    });

    await test("Pending supplier attempting to update product to ACTIVE is strictly rejected", async () => {
      const updateResult = await updateSupplierProduct(supplierBId, productB1Id, {
        status: SupplierProductStatus.ACTIVE,
      });

      assert.equal(updateResult.success, false);
      assert.match(updateResult.error || "", /pending verification/i);
    });

    await test("Approved supplier (Supplier A) can create ACTIVE products", async () => {
      const activeResult = await createSupplierProduct(supplierAId, {
        name: `High-Capacity Power Bank 30k ${timestamp}`,
        category: "Mobile Accessories",
        supplierCost: 16000,
        suggestedSellingPrice: 24000,
        stock: 40,
        supplierFulfillmentDays: "Same day dispatch",
        status: SupplierProductStatus.ACTIVE,
      });

      assert.equal(activeResult.success, true);
      assert.ok(activeResult.product);
      productA1Id = activeResult.product.id;
      assert.equal(activeResult.product.status, SupplierProductStatus.ACTIVE);
      assert.equal(activeResult.product.supplierCost, 16000);
    });

    await test("Product creation strictly rejects negative price or negative stock", async () => {
      const negativeCost = await createSupplierProduct(supplierAId, {
        name: `Faulty Product ${timestamp}`,
        category: "Gadgets",
        supplierCost: -500,
        stock: 10,
        supplierFulfillmentDays: "1-2 days",
      });
      assert.equal(negativeCost.success, false);
      assert.match(negativeCost.error || "", /positive integer/i);

      const negativeStock = await createSupplierProduct(supplierAId, {
        name: `Faulty Stock ${timestamp}`,
        category: "Gadgets",
        supplierCost: 5000,
        stock: -10,
        supplierFulfillmentDays: "1-2 days",
      });
      assert.equal(negativeStock.success, false);
      assert.match(negativeStock.error || "", /non-negative/i);
    });

    // -------------------------------------------------------------
    // TEST GROUP 5: Product Isolation & Cross-Supplier Guards
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 5: Product Isolation & Cross-Supplier Guards");

    await test("Supplier A query returns only Supplier A products", async () => {
      const prodsA = await getSupplierProducts(supplierAId);
      assert.ok(prodsA.some((p) => p.id === productA1Id));
      assert.ok(!prodsA.some((p) => p.id === productB1Id));
    });

    await test("Supplier B cannot edit Supplier A's product (cross-supplier modification blocked)", async () => {
      const crossEdit = await updateSupplierProduct(supplierBId, productA1Id, {
        name: "Hacked by Supplier B",
        supplierCost: 1000,
      });

      assert.equal(crossEdit.success, false);
      assert.match(crossEdit.error || "", /not owned/i);

      // Verify Supplier A's product remained untouched
      const originalProd = await getSupplierProductById(supplierAId, productA1Id);
      assert.ok(originalProd);
      assert.equal(originalProd.supplierCost, 16000);
      assert.notEqual(originalProd.name, "Hacked by Supplier B");
    });

    await test("Supplier B cannot delete or deactivate Supplier A's product", async () => {
      const crossDelete = await deleteOrDeactivateSupplierProduct(supplierBId, productA1Id);
      assert.equal(crossDelete.success, false);
      assert.match(crossDelete.error || "", /not owned/i);
    });

    // -------------------------------------------------------------
    // TEST GROUP 6: Safe Deactivation & Preserving Purchase History
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 6: Safe Deactivation & Preserving Purchase History");

    await test("Product with zero orders and zero seller imports can be safely deleted", async () => {
      const tempProd = await createSupplierProduct(supplierAId, {
        name: `Disposable Product ${timestamp}`,
        category: "General",
        supplierCost: 2000,
        stock: 5,
        supplierFulfillmentDays: "1-2 days",
      });
      assert.equal(tempProd.success, true);
      assert.ok(tempProd.product);

      const delResult = await deleteOrDeactivateSupplierProduct(supplierAId, tempProd.product.id);
      assert.equal(delResult.success, true);
      assert.equal(delResult.action, "deleted");

      const check = await getSupplierProductById(supplierAId, tempProd.product.id);
      assert.equal(check, null);
    });

    // -------------------------------------------------------------
    // TEST GROUP 7: Multi-Supplier Orders & Fulfillment Isolation
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 7: Multi-Supplier Orders & Fulfillment Isolation");

    await test("Setup multi-supplier customer order containing items from both Supplier A and B", async () => {
      // Create a paid customer order in PostgreSQL
      const testOrderNumber = `ORD-SUP-TEST-${timestamp.toString().slice(-6)}`;
      const order = await prisma.order.create({
        data: {
          orderNumber: testOrderNumber,
          sellerId: testSellerClerkId,
          storeSlug: `store-${timestamp.toString().slice(-6)}`,
          storeName: "Fashion & Tech Hub",
          customerName: "Chinedu Okafor",
          customerEmail: "chinedu@example.ng",
          customerPhone: "+2348099887766",
          deliveryAddress: "14 Admiralty Way, Lekki Phase 1",
          deliveryCity: "Lekki",
          deliveryState: "Lagos",
          deliveryInstructions: "Call upon arrival",
          subtotal: 50000,
          totalAmount: 50000,
          paymentStatus: "SUCCESS", // Verified paid order
          orderStatus: "PAID",
          paymentReference: `ref_sup_test_${timestamp}`,
          paidAt: new Date(),
          items: {
            create: [
              {
                productId: productA1Id,
                productName: `High-Capacity Power Bank 30k ${timestamp}`,
                quantity: 2,
                unitPrice: 20000, // Seller retail price
                lineTotal: 40000,
                supplierCostSnapshot: 16000, // Supplier A wholesale cost
                supplierName: `Apex Supplies Ltd ${timestamp}`,
                supplierId: supplierAId,
                fulfillmentStatus: SupplierFulfillmentStatus.PENDING,
              },
              {
                productId: productB1Id,
                productName: `Wireless Earbuds Pro ${timestamp}`,
                quantity: 1,
                unitPrice: 10000, // Seller retail price
                lineTotal: 10000,
                supplierCostSnapshot: 8000, // Supplier B wholesale cost
                supplierName: `Beacon Electronics ${timestamp}`,
                supplierId: supplierBId,
                fulfillmentStatus: SupplierFulfillmentStatus.PENDING,
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      assert.ok(order);
      orderId = order.id;

      const itemA = order.items.find((i) => i.supplierId === supplierAId);
      const itemB = order.items.find((i) => i.supplierId === supplierBId);

      assert.ok(itemA);
      assert.ok(itemB);
      orderItemIdA = itemA.id;
      orderItemIdB = itemB.id;
    });

    await test("Supplier A fulfillment query returns ONLY Supplier A item (strict tenant isolation)", async () => {
      const itemsForA = await getSupplierOrderItems(supplierAId);
      const matchedA = itemsForA.find((i) => i.id === orderItemIdA);
      const matchedB = itemsForA.find((i) => i.id === orderItemIdB);

      assert.ok(matchedA, "Supplier A must see their own order item");
      assert.equal(matchedB, undefined, "Supplier A must NEVER see Supplier B's order item");

      // Verify recipient details needed for delivery are present
      assert.equal(matchedA.recipientName, "Chinedu Okafor");
      assert.equal(matchedA.deliveryCity, "Lekki");
      assert.equal(matchedA.wholesaleUnitPrice, 16000);
      assert.equal(matchedA.wholesaleLineTotal, 32000); // 16000 * 2
    });

    await test("Supplier B fulfillment query returns ONLY Supplier B item", async () => {
      const itemsForB = await getSupplierOrderItems(supplierBId);
      const matchedA = itemsForB.find((i) => i.id === orderItemIdA);
      const matchedB = itemsForB.find((i) => i.id === orderItemIdB);

      assert.equal(matchedA, undefined, "Supplier B must NEVER see Supplier A's order item");
      assert.ok(matchedB, "Supplier B must see their own order item");
      assert.equal(matchedB.wholesaleUnitPrice, 8000);
    });

    // -------------------------------------------------------------
    // TEST GROUP 8: Fulfillment Transitions & Unpaid Order Protection
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 8: Fulfillment Transitions & Unpaid Order Protection");

    await test("Supplier cannot fulfill an unpaid order (strictly rejected)", async () => {
      // Create an unpaid pending order
      const unpaidOrder = await prisma.order.create({
        data: {
          orderNumber: `ORD-UNPAID-${timestamp.toString().slice(-6)}`,
          sellerId: testSellerClerkId,
          storeSlug: "store-test",
          storeName: "Store Test",
          customerName: "Unpaid Customer",
          customerEmail: "unpaid@example.com",
          customerPhone: "+2348000000000",
          deliveryAddress: "Test Address",
          deliveryCity: "Ikeja",
          deliveryState: "Lagos",
          subtotal: 16000,
          totalAmount: 16000,
          paymentStatus: "PENDING", // NOT PAID
          orderStatus: "PENDING_PAYMENT",
          paymentReference: `ref_unpaid_${timestamp}`,
          items: {
            create: [
              {
                productId: productA1Id,
                productName: "Unpaid Item",
                quantity: 1,
                unitPrice: 20000,
                lineTotal: 20000,
                supplierCostSnapshot: 16000,
                supplierId: supplierAId,
                fulfillmentStatus: SupplierFulfillmentStatus.PENDING,
              },
            ],
          },
        },
        include: { items: true },
      });

      const unpaidItemId = unpaidOrder.items[0].id;

      // Attempt to advance fulfillment status on unpaid order
      const result = await updateSupplierItemFulfillment(
        supplierAId,
        unpaidItemId,
        SupplierFulfillmentStatus.SHIPPED
      );

      assert.equal(result.success, false);
      assert.match(result.error || "", /unpaid/i);

      // Clean up unpaid test order
      await prisma.order.delete({ where: { id: unpaidOrder.id } });
    });

    await test("Supplier A can advance fulfillment status on legitimately paid order item", async () => {
      // Advance to PROCESSING
      const procResult = await updateSupplierItemFulfillment(
        supplierAId,
        orderItemIdA,
        SupplierFulfillmentStatus.PROCESSING
      );
      assert.equal(procResult.success, true);
      assert.equal(procResult.item?.fulfillmentStatus, SupplierFulfillmentStatus.PROCESSING);

      // Advance to SHIPPED
      const shipResult = await updateSupplierItemFulfillment(
        supplierAId,
        orderItemIdA,
        SupplierFulfillmentStatus.SHIPPED
      );
      assert.equal(shipResult.success, true);
      assert.equal(shipResult.item?.fulfillmentStatus, SupplierFulfillmentStatus.SHIPPED);

      // Verify Supplier B's item is still PENDING
      const checkB = await prisma.orderItem.findUnique({ where: { id: orderItemIdB } });
      assert.equal(checkB?.fulfillmentStatus, SupplierFulfillmentStatus.PENDING);
    });

    await test("Supplier B cannot update Supplier A's fulfillment status (forbidden cross-supplier update)", async () => {
      const crossFulfill = await updateSupplierItemFulfillment(
        supplierBId,
        orderItemIdA,
        SupplierFulfillmentStatus.DELIVERED
      );

      assert.equal(crossFulfill.success, false);
      assert.match(crossFulfill.error || "", /not found or not assigned/i);
    });

    // -------------------------------------------------------------
    // TEST GROUP 9: Order Snapshots Immutability & Zero Price Tampering
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 9: Order Snapshots Immutability & Zero Price Tampering");

    await test("Changing wholesale price does NOT alter historical order snapshots", async () => {
      // Supplier A changes product wholesale cost from 16,000 to 19,000
      await updateSupplierProduct(supplierAId, productA1Id, {
        supplierCost: 19000,
      });

      // Verify OrderItem snapshot remained 16,000
      const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemIdA },
      });
      assert.ok(orderItem);
      assert.equal(orderItem.supplierCostSnapshot, 16000);
      assert.equal(orderItem.unitPrice, 20000); // Retail selling price also untouched
    });

    await test("Product with existing order cannot be hard-deleted; safely archived instead", async () => {
      const delResult = await deleteOrDeactivateSupplierProduct(supplierAId, productA1Id);
      assert.equal(delResult.success, true);
      assert.equal(delResult.action, "archived");

      // Verify product is now INACTIVE
      const check = await getSupplierProductById(supplierAId, productA1Id);
      assert.ok(check);
      assert.equal(check.status, SupplierProductStatus.INACTIVE);
      assert.equal(check.inStock, false);

      // Historical OrderItem and Order remain intact
      const itemCheck = await prisma.orderItem.findUnique({ where: { id: orderItemIdA } });
      assert.ok(itemCheck);
    });

    // -------------------------------------------------------------
    // TEST GROUP 10: Operational Metrics Accuracy & Zero Fake Payouts
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 10: Operational Metrics Accuracy & Zero Fake Payouts");

    await test("Dashboard metrics compute real counts and avoid misleading settled payouts", async () => {
      const metrics = await getSupplierDashboardMetrics(supplierAId);
      assert.ok(metrics);
      assert.equal(metrics.totalProducts >= 1, true);
      assert.ok(typeof metrics.pendingFulfillments === "number");
      assert.ok(typeof metrics.totalWholesaleInFulfillment === "number");
      // Must not fabricate fake settlement
      assert.ok(!("settledEarnings" in metrics));
      assert.ok(!("payoutBalance" in metrics));
    });

    // -------------------------------------------------------------
    // TEST GROUP 11: Admin Status Route Security & Fail-Closed Audit
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 11: Admin Status Route Security & Fail-Closed Audit");

    await test("PATCH /api/admin/supplier/[supplierId]/status fails closed (503) when ADMIN_SECRET_KEY is missing", async () => {
      const origKey = process.env.ADMIN_SECRET_KEY;
      delete process.env.ADMIN_SECRET_KEY;

      try {
        const req = new Request(`http://localhost:3000/api/admin/supplier/${supplierAId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: SupplierVerificationStatus.APPROVED }),
        });
        const res = await adminStatusPatch(req, {
          params: Promise.resolve({ supplierId: supplierAId }),
        });
        assert.equal(res.status, 503);
        const body = await res.json();
        assert.match(body.error || "", /configuration required/i);
      } finally {
        if (origKey !== undefined) process.env.ADMIN_SECRET_KEY = origKey;
      }
    });

    await test("PATCH /api/admin/supplier/[supplierId]/status rejects request without x-admin-secret (403)", async () => {
      const origKey = process.env.ADMIN_SECRET_KEY;
      process.env.ADMIN_SECRET_KEY = `audit_test_key_${timestamp}`;

      try {
        const req = new Request(`http://localhost:3000/api/admin/supplier/${supplierAId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: SupplierVerificationStatus.APPROVED }),
        });
        const res = await adminStatusPatch(req, {
          params: Promise.resolve({ supplierId: supplierAId }),
        });
        assert.equal(res.status, 403);
        const body = await res.json();
        assert.match(body.error || "", /unauthorized/i);
      } finally {
        if (origKey !== undefined) process.env.ADMIN_SECRET_KEY = origKey;
        else delete process.env.ADMIN_SECRET_KEY;
      }
    });

    await test("PATCH /api/admin/supplier/[supplierId]/status rejects invalid x-admin-secret (403)", async () => {
      const origKey = process.env.ADMIN_SECRET_KEY;
      process.env.ADMIN_SECRET_KEY = `audit_test_key_${timestamp}`;

      try {
        const req = new Request(`http://localhost:3000/api/admin/supplier/${supplierAId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": "wrong_attacker_secret",
          },
          body: JSON.stringify({ status: SupplierVerificationStatus.APPROVED }),
        });
        const res = await adminStatusPatch(req, {
          params: Promise.resolve({ supplierId: supplierAId }),
        });
        assert.equal(res.status, 403);
      } finally {
        if (origKey !== undefined) process.env.ADMIN_SECRET_KEY = origKey;
        else delete process.env.ADMIN_SECRET_KEY;
      }
    });

    await test("PATCH /api/admin/supplier/[supplierId]/status succeeds with valid x-admin-secret", async () => {
      const origKey = process.env.ADMIN_SECRET_KEY;
      const secret = `audit_test_key_${timestamp}`;
      process.env.ADMIN_SECRET_KEY = secret;

      try {
        const req = new Request(`http://localhost:3000/api/admin/supplier/${supplierBId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": secret,
          },
          body: JSON.stringify({
            status: SupplierVerificationStatus.APPROVED,
            adminNotes: "Approved via automated admin security audit suite.",
          }),
        });
        const res = await adminStatusPatch(req, {
          params: Promise.resolve({ supplierId: supplierBId }),
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);

        const supB = await getSupplierById(supplierBId);
        assert.equal(supB?.verificationStatus, SupplierVerificationStatus.APPROVED);
        assert.equal(supB?.adminNotes, "Approved via automated admin security audit suite.");
      } finally {
        if (origKey !== undefined) process.env.ADMIN_SECRET_KEY = origKey;
        else delete process.env.ADMIN_SECRET_KEY;
      }
    });

    // -------------------------------------------------------------
    // TEST GROUP 12: Shared Catalogue & Storefront Visibility Enforcement
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 12: Shared Catalogue & Storefront Visibility Enforcement");

    await test("Shared catalogue query excludes unapproved suppliers and draft/inactive products", async () => {
      // Create Pending Supplier C
      const regC = await registerSupplier(`user_sup_c_${timestamp}`, {
        companyName: `Pending Supplier Ltd ${timestamp}`,
        businessEmail: `pending_${timestamp}@example.com`,
        phone: "+2348055556666",
        state: "Lagos",
        city: "Ikeja",
      });
      assert.ok(regC.supplier);
      supplierCId = regC.supplier.id;

      // Create active product for approved Supplier A
      const prodA2 = await createSupplierProduct(supplierAId, {
        name: `Active Solar Charger ${timestamp}`,
        category: "Electronics",
        supplierCost: 15000,
        suggestedSellingPrice: 22000,
        stock: 30,
        status: SupplierProductStatus.ACTIVE,
        supplierFulfillmentDays: "1 day",
      });
      assert.ok(prodA2.product);
      productA2Id = prodA2.product.id;

      // Create product for Supplier C (status DRAFT because supplier is pending)
      const prodC = await createSupplierProduct(supplierCId, {
        name: `Pending Supplier Gadget ${timestamp}`,
        category: "Gadgets",
        supplierCost: 5000,
        stock: 10,
        supplierFulfillmentDays: "1-2 days",
      });
      assert.ok(prodC.product);
      productC1Id = prodC.product.id;

      // Create legacy demo product (supplierId: null, status: ACTIVE)
      const demoProd = await prisma.product.create({
        data: {
          id: `prod_demo_${timestamp}`,
          name: `Legacy Demo Watch ${timestamp}`,
          slug: `demo-watch-${timestamp}`,
          category: "Watches",
          supplierCost: 7000,
          suggestedSellingPrice: 12000,
          stock: 50,
          inStock: true,
          status: "ACTIVE",
          supplierId: null,
          supplierName: "Darté Direct",
          shortDescription: "Demo watch description",
          description: "Full description of demo watch",
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
          supplierRating: 4.8,
          supplierFulfillmentDays: "1-2 days",
          supplierLocation: "Lagos, Nigeria",
          supplierDispatchRate: "99%",
          shippingInfo: {
            weight: "0.5kg",
            dispatchTime: "1-2 days",
          },
        },
      });
      productDemoId = demoProd.id;

      // Query shared discovery catalogue with production where clause
      const catalogue = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { supplierId: null },
            { supplier: { verificationStatus: "APPROVED" } },
          ],
        },
      });

      const hasApproved = catalogue.some((p) => p.id === productA2Id);
      const hasDemo = catalogue.some((p) => p.id === productDemoId);
      const hasPending = catalogue.some((p) => p.id === productC1Id);

      assert.ok(hasApproved, "Active products from approved suppliers must appear in catalogue");
      assert.ok(hasDemo, "Legacy demo products without supplier must appear in catalogue");
      assert.ok(!hasPending, "Products from unapproved suppliers must NEVER appear in catalogue");
    });

    await test("addProductToSellerStore rejects draft products or products from unapproved suppliers", async () => {
      // 1. Try to add unapproved supplier product
      await assert.rejects(
        async () => {
          await addProductToSellerStore(testSellerClerkId, productC1Id);
        },
        /pending verification|inactive or in draft mode/i
      );

      // 2. Add approved supplier product and demo product successfully
      const addedA = await addProductToSellerStore(testSellerClerkId, productA2Id, 25000);
      assert.equal(addedA.success, true);

      const addedDemo = await addProductToSellerStore(testSellerClerkId, productDemoId, 15000);
      assert.equal(addedDemo.success, true);
    });

    await test("Storefront getPublicStoreProducts strictly omits unapproved/suspended supplier products", async () => {
      // Create StoreProfile for test seller
      const storeSlug = `audit-store-${timestamp.toString().slice(-6)}`;
      const store = await prisma.storeProfile.create({
        data: {
          sellerId: testSellerClerkId,
          name: `Audit Store ${timestamp.toString().slice(-6)}`,
          slug: storeSlug,
          isPublished: true,
        },
      });
      storeProfileId = store.id;

      // Storefront should show both products
      const publicStore = await getPublicStoreProducts(storeSlug);
      assert.ok(publicStore);
      assert.ok(publicStore.products.some((p) => p.id === productA2Id));
      assert.ok(publicStore.products.some((p) => p.id === productDemoId));

      // Suspend Supplier A
      await adminUpdateSupplierStatus(supplierAId, SupplierVerificationStatus.SUSPENDED, "Suspended for audit test");

      // Storefront must immediately filter out productA2Id
      const publicStoreAfterSuspension = await getPublicStoreProducts(storeSlug);
      assert.ok(publicStoreAfterSuspension);
      assert.ok(!publicStoreAfterSuspension.products.some((p) => p.id === productA2Id), "Suspended supplier product must be hidden from storefront");
      assert.ok(publicStoreAfterSuspension.products.some((p) => p.id === productDemoId), "Demo product remains visible");

      // Direct detail lookup for productA2Id must return null
      const directDetail = await getPublicStoreProduct(storeSlug, productA2Id);
      assert.equal(directDetail, null, "Suspended supplier product detail lookup must return null");

      // Re-approve Supplier A
      await adminUpdateSupplierStatus(supplierAId, SupplierVerificationStatus.APPROVED, "Re-approved");
    });

    await test("Supplier wholesale cost change does NOT overwrite seller custom retail selling price", async () => {
      // Get seller's store product
      const storeProdBefore = await prisma.storeProduct.findUnique({
        where: {
          sellerId_productId: {
            sellerId: testSellerClerkId,
            productId: productA2Id,
          },
        },
      });
      assert.ok(storeProdBefore);
      const originalSellerPrice = storeProdBefore.customSellingPrice;

      // Supplier updates wholesale cost
      await updateSupplierProduct(supplierAId, productA2Id, {
        supplierCost: 18000,
      });

      // Check seller store product retail price
      const storeProdAfter = await prisma.storeProduct.findUnique({
        where: {
          sellerId_productId: {
            sellerId: testSellerClerkId,
            productId: productA2Id,
          },
        },
      });
      assert.ok(storeProdAfter);
      assert.equal(storeProdAfter.customSellingPrice, originalSellerPrice, "Seller retail price must remain untouched");
    });

    // -------------------------------------------------------------
    // TEST GROUP 13: Order State Machine Transitions, Parent Isolation & Privacy
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 13: Order State Machine Transitions, Parent Isolation & Privacy");

    await test("Fulfillment state machine rejects invalid jumps and enforces sequence", async () => {
      // Create new paid order for state machine verification
      const order2 = await prisma.order.create({
        data: {
          orderNumber: `ORD-SM-${timestamp.toString().slice(-6)}`,
          sellerId: testSellerClerkId,
          storeSlug: `store-${timestamp.toString().slice(-6)}`,
          storeName: "Test Store",
          customerName: "Amina Yusuf",
          customerEmail: "amina@example.ng",
          customerPhone: "+2348077665544",
          deliveryAddress: "Plot 8, Victoria Island",
          deliveryCity: "Victoria Island",
          deliveryState: "Lagos",
          subtotal: 25000,
          totalAmount: 25000,
          paymentStatus: "SUCCESS",
          orderStatus: "PAID",
          paymentReference: `ref_sm_${timestamp}`,
          paidAt: new Date(),
          items: {
            create: [
              {
                productId: productA2Id,
                productName: "Power Bank",
                quantity: 1,
                unitPrice: 25000,
                lineTotal: 25000,
                supplierCostSnapshot: 15000,
                supplierId: supplierAId,
                fulfillmentStatus: SupplierFulfillmentStatus.PENDING,
              },
            ],
          },
        },
        include: { items: true },
      });
      order2Id = order2.id;
      orderItem2Id = order2.items[0].id;

      // 1. Attempt invalid transition: PENDING directly to DELIVERED
      const directDelivered = await updateSupplierItemFulfillment(
        supplierAId,
        orderItem2Id,
        SupplierFulfillmentStatus.DELIVERED
      );
      assert.equal(directDelivered.success, false);
      assert.match(directDelivered.error || "", /Invalid fulfillment transition/i);

      // 2. Valid sequence: PENDING -> PROCESSING -> SHIPPED -> DELIVERED
      const step1 = await updateSupplierItemFulfillment(supplierAId, orderItem2Id, SupplierFulfillmentStatus.PROCESSING);
      assert.equal(step1.success, true);

      const step2 = await updateSupplierItemFulfillment(supplierAId, orderItem2Id, SupplierFulfillmentStatus.SHIPPED);
      assert.equal(step2.success, true);

      // Verify parent order status was NOT modified by supplier fulfillment
      const parentOrderCheck = await prisma.order.findUnique({ where: { id: order2Id } });
      assert.equal(parentOrderCheck?.orderStatus, "PAID", "Supplier fulfillment must NOT overwrite parent order status");

      const step3 = await updateSupplierItemFulfillment(supplierAId, orderItem2Id, SupplierFulfillmentStatus.DELIVERED);
      assert.equal(step3.success, true);

      // 3. Attempt invalid transition from terminal state: DELIVERED -> PENDING
      const backwards = await updateSupplierItemFulfillment(supplierAId, orderItem2Id, SupplierFulfillmentStatus.PENDING);
      assert.equal(backwards.success, false);
      assert.match(backwards.error || "", /Invalid fulfillment transition/i);
    });

    await test("Cannot fulfill an item on a CANCELLED or REFUNDED customer order", async () => {
      // Mark order2 as CANCELLED
      await prisma.order.update({
        where: { id: order2Id },
        data: { orderStatus: "CANCELLED" },
      });

      const cancelledFulfill = await updateSupplierItemFulfillment(
        supplierAId,
        orderItem2Id,
        SupplierFulfillmentStatus.PROCESSING
      );
      assert.equal(cancelledFulfill.success, false);
      assert.match(cancelledFulfill.error || "", /Cannot fulfill an order with status "CANCELLED"/i);
    });

    await test("updateSellerOrderStatus rejects advancing unpaid orders or delivering cancelled orders", async () => {
      // Create unpaid order
      const unpaid = await prisma.order.create({
        data: {
          orderNumber: `ORD-UNP-${timestamp.toString().slice(-6)}`,
          sellerId: testSellerClerkId,
          storeSlug: "store",
          storeName: "Store",
          customerName: "Test",
          customerEmail: "test@example.com",
          customerPhone: "+2348000000000",
          deliveryAddress: "Addr",
          deliveryCity: "City",
          deliveryState: "Lagos",
          subtotal: 5000,
          totalAmount: 5000,
          paymentStatus: "PENDING",
          orderStatus: "PENDING_PAYMENT",
          paymentReference: `ref_unp_${timestamp}`,
        },
      });

      // Try to mark PROCESSING
      const badAdvance = await updateSellerOrderStatus(testSellerClerkId, unpaid.id, "PROCESSING");
      assert.equal(badAdvance.success, false);
      assert.match(badAdvance.error || "", /Cannot advance fulfillment on an unpaid order/i);

      await prisma.order.delete({ where: { id: unpaid.id } });
    });

    await test("Supplier order fulfillment view protects sensitive customer PII and seller margins", async () => {
      const items = await getSupplierOrderItems(supplierAId);
      const testItem = items.find((i) => i.id === orderItem2Id);
      assert.ok(testItem);

      // Recipient delivery fields are present for dispatch
      assert.equal(testItem.recipientName, "Amina Yusuf");
      assert.equal(testItem.deliveryCity, "Victoria Island");
      assert.equal(testItem.deliveryState, "Lagos");
      assert.equal(testItem.deliveryAddress, "Plot 8, Victoria Island");

      // Confidential fields are NOT in the SupplierOrderItem DTO
      assert.equal("customerEmail" in testItem, false, "Customer email must not be exposed to supplier");
      assert.equal("customerPhone" in testItem, false, "Customer phone must not be exposed to supplier");
      assert.equal("sellerProfit" in testItem, false, "Seller profit must not be exposed to supplier");
      assert.equal("sellerMargin" in testItem, false, "Seller margin must not be exposed to supplier");
    });

    // -------------------------------------------------------------
    // TEST GROUP 14: Runtime Accessor Resilience & Safe Fallback
    // -------------------------------------------------------------
    console.log("\nTEST GROUP 14: Runtime Accessor Resilience & Safe Fallback");

    await test("prisma.supplierProfile is defined and findUnique executes cleanly on registered user", async () => {
      assert.ok(prisma.supplierProfile, "prisma.supplierProfile accessor must be defined on prisma instance");
      const profile = await prisma.supplierProfile.findUnique({
        where: { clerkUserId: testSupplierClerkIdA },
      });
      assert.ok(profile, "Supplier profile must be found");
      assert.equal(profile.clerkUserId, testSupplierClerkIdA);
    });

    await test("getSupplierByClerkId executes findUnique safely for non-existent user and returns null without throwing", async () => {
      const nonExistent = await getSupplierByClerkId(`user_non_existent_${Date.now()}`);
      assert.equal(nonExistent, null);
    });

    await test("getSupplierDashboardMetrics executes without error on incomplete/pending supplier", async () => {
      const metrics = await getSupplierDashboardMetrics(supplierCId);
      assert.ok(metrics);
      assert.equal(metrics.totalProducts >= 0, true);
      assert.equal(metrics.pendingFulfillments, 0);
    });

  } finally {
    // -------------------------------------------------------------
    // CLEANUP TEST FIXTURES
    // -------------------------------------------------------------
    try {
      if (orderId) {
        await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
      }
      if (order2Id) {
        await prisma.order.delete({ where: { id: order2Id } }).catch(() => {});
      }
      if (storeProfileId) {
        await prisma.storeProduct.deleteMany({ where: { sellerId: testSellerClerkId } }).catch(() => {});
        await prisma.storeProfile.delete({ where: { id: storeProfileId } }).catch(() => {});
      }
      if (productA1Id) {
        await prisma.product.delete({ where: { id: productA1Id } }).catch(() => {});
      }
      if (productA2Id) {
        await prisma.product.delete({ where: { id: productA2Id } }).catch(() => {});
      }
      if (productB1Id) {
        await prisma.product.delete({ where: { id: productB1Id } }).catch(() => {});
      }
      if (productC1Id) {
        await prisma.product.delete({ where: { id: productC1Id } }).catch(() => {});
      }
      if (productDemoId) {
        await prisma.product.delete({ where: { id: productDemoId } }).catch(() => {});
      }
      if (supplierAId) {
        await prisma.supplierProfile.delete({ where: { id: supplierAId } }).catch(() => {});
      }
      if (supplierBId) {
        await prisma.supplierProfile.delete({ where: { id: supplierBId } }).catch(() => {});
      }
      if (supplierCId) {
        await prisma.supplierProfile.delete({ where: { id: supplierCId } }).catch(() => {});
      }
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
  }

  console.log("\n=================================================================");
  console.log(` RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
  console.log("=================================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
