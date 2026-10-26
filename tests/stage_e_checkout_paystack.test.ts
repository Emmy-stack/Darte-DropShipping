/**
 * Darté Stage E — Comprehensive E-Commerce Checkout, Paystack Payments
 * & Order Management Integration Test Suite
 */

import assert from "node:assert/strict";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";
import {
  createPendingOrder,
  verifyAndFulfillOrder,
  handlePaystackWebhookChargeSuccess,
  getPublicOrderByReference,
  getSellerOrders,
  updateSellerOrderStatus,
  validateCustomerDetails,
} from "../src/lib/db/orders";
import {
  initializePaystackTransaction,
  verifyPaystackWebhookSignature,
} from "../src/lib/paystack";
import { OrderStatus, PaymentStatus } from "../src/types/order";

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

// Mocking fetch helper for Paystack API calls
const originalFetch = global.fetch;

function setupMockPaystackFetch(options: {
  initStatus?: boolean;
  initMessage?: string;
  verifyStatus?: string; // "success", "failed", "abandoned"
  verifyAmountKobo?: number;
  verifyCurrency?: string;
  verifyRef?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.fetch = async (url: any, opts: any) => {
    const urlStr = String(url);

    if (urlStr.includes("/transaction/initialize")) {
      if (options.initStatus === false) {
        return new Response(
          JSON.stringify({
            status: false,
            message: options.initMessage || "Paystack initialization error",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const body = JSON.parse(opts.body);
      return new Response(
        JSON.stringify({
          status: true,
          message: "Authorization URL created",
          data: {
            authorization_url: `https://checkout.paystack.com/mock-auth-${body.reference}`,
            access_code: `mock-acc-${body.reference}`,
            reference: body.reference,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/transaction/verify")) {
      const ref = urlStr.split("/").pop();
      return new Response(
        JSON.stringify({
          status: true,
          message: "Verification successful",
          data: {
            status: options.verifyStatus || "success",
            reference: options.verifyRef || ref,
            amount: options.verifyAmountKobo !== undefined ? options.verifyAmountKobo : 2850000,
            currency: options.verifyCurrency || "NGN",
            paid_at: new Date().toISOString(),
            channel: "card",
            gateway_response: "Successful",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return originalFetch(url, opts);
  };
}

function restoreFetch() {
  global.fetch = originalFetch;
}

async function runStageETests() {
  console.log("\n=================================================================");
  console.log(" Darté — Stage E Checkout, Paystack Payments & Orders Test Suite");
  console.log("=================================================================\n");

  const testSellerA = `test_seller_stage_e_a_${Date.now()}`;
  const testSellerB = `test_seller_stage_e_b_${Date.now()}`;
  const testStoreSlugA = `stage-e-store-a-${Date.now()}`;
  const testStoreSlugB = `stage-e-store-b-${Date.now()}`;
  const testProductId1 = `prod_test_e1_${Date.now()}`;
  const testProductId2 = `prod_test_e2_${Date.now()}`;

  // Set mock Paystack secret key in test environment
  const mockSecretKey = "sk_test_mock_paystack_secret_key_123456789";
  process.env.PAYSTACK_SECRET_KEY = mockSecretKey;

  try {
    // -----------------------------------------------------------------
    // SETUP FIXTURES
    // -----------------------------------------------------------------
    // Create Catalog Products
    await prisma.product.create({
      data: {
        id: testProductId1,
        name: "Stage E Luxury Wireless Earbuds",
        slug: `stage-e-earbuds-${Date.now()}`,
        category: "Audio",
        shortDescription: "ANC earbuds with 36h battery life",
        description: "Premium earbuds for audiophiles.",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"],
        supplierName: "Horizon Sound Ltd",
        supplierRating: 4.8,
        supplierReviewCount: 88,
        supplierVerified: true,
        supplierFulfillmentDays: "2-3 business days",
        supplierLocation: "Alaba International Market, Lagos",
        supplierMinOrderQty: 1,
        supplierDispatchRate: "99%",
        supplierCost: 15000, // ₦15,000 wholesale
        suggestedSellingPrice: 25000,
        stock: 50,
        inStock: true,
        tags: ["audio", "bluetooth"],
        badges: ["Best Seller"],
        variants: [],
        shippingInfo: { nationwide: true },
        specifications: [],
      },
    });

    await prisma.product.create({
      data: {
        id: testProductId2,
        name: "Stage E Sold Out Smartwatch",
        slug: `stage-e-smartwatch-${Date.now()}`,
        category: "Wearables",
        shortDescription: "AMOLED fitness tracker",
        description: "Smartwatch with heart-rate tracking.",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
        supplierName: "Apex Wear Ltd",
        supplierRating: 4.6,
        supplierFulfillmentDays: "1-2 business days",
        supplierLocation: "Trade Fair Complex, Lagos",
        supplierDispatchRate: "95%",
        supplierCost: 18000,
        suggestedSellingPrice: 30000,
        stock: 0,
        inStock: false, // SOLD OUT
        shippingInfo: { nationwide: true },
      },
    });

    // Create Store Profiles for Seller A and Seller B
    await prisma.storeProfile.create({
      data: {
        sellerId: testSellerA,
        name: "Lagos Gadget Haven",
        slug: testStoreSlugA,
        description: "Top gadgets in Lagos.",
        category: "Electronics",
        country: "Nigeria",
        state: "Lagos",
        city: "Ikeja",
        contactEmail: "haven@lagos.ng",
        contactPhone: "+2348011223344",
        isPublished: true,
      },
    });

    await prisma.storeProfile.create({
      data: {
        sellerId: testSellerB,
        name: "Abuja Tech Boutique",
        slug: testStoreSlugB,
        description: "Boutique electronics in Abuja.",
        category: "Gadgets",
        country: "Nigeria",
        state: "FCT - Abuja",
        city: "Wuse II",
        isPublished: true,
      },
    });

    // Add product 1 to Seller A store with custom retail selling price ₦28,500
    await prisma.storeProduct.create({
      data: {
        sellerId: testSellerA,
        productId: testProductId1,
        customSellingPrice: 28500, // ₦28,500 retail
      },
    });

    // Add product 2 (out of stock) to Seller A store
    await prisma.storeProduct.create({
      data: {
        sellerId: testSellerA,
        productId: testProductId2,
        customSellingPrice: 35000,
      },
    });

    // =================================================================
    // TEST GROUP 1: Checkout Customer Details Validation
    // =================================================================
    console.log("TEST GROUP 1: Checkout Customer Details Validation");

    await test("Rejects missing or short customer name (<2 chars)", async () => {
      const err = validateCustomerDetails({
        name: "A",
        email: "test@example.com",
        phone: "08012345678",
        address: "123 Marina Street",
        city: "Lagos",
        state: "Lagos",
      });
      assert.ok(err && err.includes("full name"));
    });

    await test("Rejects invalid email format", async () => {
      const err = validateCustomerDetails({
        name: "Emeka Okoro",
        email: "not-an-email",
        phone: "08012345678",
        address: "123 Marina Street",
        city: "Lagos",
        state: "Lagos",
      });
      assert.ok(err && err.includes("valid delivery email"));
    });

    await test("Rejects invalid or short phone number", async () => {
      const err = validateCustomerDetails({
        name: "Emeka Okoro",
        email: "emeka@example.com",
        phone: "123",
        address: "123 Marina Street",
        city: "Lagos",
        state: "Lagos",
      });
      assert.ok(err && err.includes("phone number"));
    });

    await test("Rejects missing street address or city", async () => {
      const err = validateCustomerDetails({
        name: "Emeka Okoro",
        email: "emeka@example.com",
        phone: "08012345678",
        address: "St",
        city: "",
        state: "Lagos",
      });
      assert.ok(err && (err.includes("street") || err.includes("city")));
    });

    await test("Valid customer details pass with null error", async () => {
      const err = validateCustomerDetails({
        name: "Emeka Okoro",
        email: "emeka@example.com",
        phone: "+2348012345678",
        address: "14 Admiralty Way, Lekki Phase 1",
        city: "Lekki",
        state: "Lagos",
      });
      assert.equal(err, null);
    });

    // =================================================================
    // TEST GROUP 2: Anti-Tampering & Availability Verification
    // =================================================================
    console.log("\nTEST GROUP 2: Anti-Tampering & Inventory Integrity");

    await test("Rejects checkout on empty cart items array", async () => {
      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Emeka Okoro",
            email: "emeka@example.com",
            phone: "+2348012345678",
            address: "14 Admiralty Way",
            city: "Lagos",
            state: "Lagos",
          },
          items: [],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );
      assert.equal(res.success, false);
      assert.ok(res.error?.includes("empty"));
    });

    await test("Rejects invalid quantity (<= 0 or non-integer)", async () => {
      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Emeka Okoro",
            email: "emeka@example.com",
            phone: "+2348012345678",
            address: "14 Admiralty Way",
            city: "Lagos",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 0 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );
      assert.equal(res.success, false);
      assert.ok(res.error?.includes("quantity"));
    });

    await test("Strictly rejects sold out item (inStock = false)", async () => {
      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Emeka Okoro",
            email: "emeka@example.com",
            phone: "+2348012345678",
            address: "14 Admiralty Way",
            city: "Lagos",
            state: "Lagos",
          },
          items: [{ productId: testProductId2, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );
      assert.equal(res.success, false);
      assert.ok(res.error?.includes("sold out"));
    });

    await test("Cross-Store Guard: Rejects product not listed in the target store", async () => {
      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugB, // Seller B has not added product 1
          customer: {
            name: "Emeka Okoro",
            email: "emeka@example.com",
            phone: "+2348012345678",
            address: "14 Admiralty Way",
            city: "Lagos",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );
      assert.equal(res.success, false);
      assert.ok(res.error?.includes("no longer offered"));
    });

    // =================================================================
    // TEST GROUP 3: Order Creation & Snapshots in Database
    // =================================================================
    console.log("\nTEST GROUP 3: Order Creation & Snapshot Persistence");

    setupMockPaystackFetch({ initStatus: true });

    let createdOrderRef = "";
    let createdOrderNumber = "";

    await test("Server recalculates total strictly from DB selling price (₦28,500 * 2 = ₦57,000)", async () => {
      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Chukwuma Adebayo",
            email: "chukwuma@example.ng",
            phone: "+2348099887766",
            address: "42 Allen Avenue",
            city: "Ikeja",
            state: "Lagos",
            instructions: "Leave with security if not at desk",
          },
          items: [{ productId: testProductId1, quantity: 2 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );

      assert.equal(res.success, true);
      assert.ok(res.orderNumber?.startsWith("DRT-"));
      assert.ok(res.reference?.startsWith("drt_tx_"));
      assert.equal(res.totalAmount, 57000); // 28500 * 2
      assert.ok(res.authorizationUrl?.includes("mock-auth"));

      createdOrderRef = res.reference!;
      createdOrderNumber = res.orderNumber!;
    });

    await test("Order record persists in PostgreSQL with PENDING_PAYMENT status", async () => {
      const dbOrder = await prisma.order.findUnique({
        where: { paymentReference: createdOrderRef },
        include: { items: true },
      });

      assert.ok(dbOrder);
      assert.equal(dbOrder.orderNumber, createdOrderNumber);
      assert.equal(dbOrder.sellerId, testSellerA);
      assert.equal(dbOrder.storeSlug, testStoreSlugA);
      assert.equal(dbOrder.customerName, "Chukwuma Adebayo");
      assert.equal(dbOrder.customerEmail, "chukwuma@example.ng");
      assert.equal(dbOrder.deliveryState, "Lagos");
      assert.equal(dbOrder.orderStatus, OrderStatus.PENDING_PAYMENT);
      assert.equal(dbOrder.paymentStatus, PaymentStatus.PENDING);
      assert.equal(dbOrder.totalAmount, 57000);
      assert.equal(dbOrder.items.length, 1);

      // Verify item snapshot
      const item = dbOrder.items[0];
      assert.equal(item.productName, "Stage E Luxury Wireless Earbuds");
      assert.equal(item.quantity, 2);
      assert.equal(item.unitPrice, 28500); // retail selling price snapshot
      assert.equal(item.lineTotal, 57000);
      assert.equal(item.supplierCostSnapshot, 15000); // purchase-time confidential supplier cost
      assert.equal(item.supplierName, "Horizon Sound Ltd");
    });

    restoreFetch();

    // =================================================================
    // TEST GROUP 4: Paystack Initialization & Missing Config
    // =================================================================
    console.log("\nTEST GROUP 4: Paystack Gateway Initialization & Error Handling");

    await test("Missing PAYSTACK_SECRET_KEY returns clear server configuration error", async () => {
      const currentKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;

      const res = await initializePaystackTransaction({
        email: "test@example.com",
        amountKobo: 500000,
        reference: "ref_123",
        callbackUrl: "http://localhost:3000/callback",
      });

      assert.equal(res.success, false);
      assert.ok(res.error?.includes("PAYSTACK_SECRET_KEY"));

      process.env.PAYSTACK_SECRET_KEY = currentKey;
    });

    await test("Paystack initialization gateway failure marks payment FAILED and reports error", async () => {
      setupMockPaystackFetch({
        initStatus: false,
        initMessage: "Invalid subaccount or duplicate transaction reference",
      });

      const res = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Femi Ojo",
            email: "femi@example.com",
            phone: "+2348011223344",
            address: "10 Broad Street",
            city: "Lagos Island",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );

      assert.equal(res.success, false);
      assert.ok(res.error?.includes("Invalid subaccount"));

      restoreFetch();
    });

    // =================================================================
    // TEST GROUP 5: Paystack Verification & Idempotency
    // =================================================================
    console.log("\nTEST GROUP 5: Payment Verification & Idempotent Processing");

    await test("Successful Paystack verification marks order PAID and payment SUCCESS", async () => {
      setupMockPaystackFetch({
        verifyStatus: "success",
        verifyAmountKobo: 5700000, // ₦57,000 * 100 kobo
        verifyCurrency: "NGN",
        verifyRef: createdOrderRef,
      });

      const res = await verifyAndFulfillOrder(createdOrderRef);

      assert.equal(res.success, true);
      assert.equal(res.alreadyPaid, false);
      assert.ok(res.order);
      assert.equal(res.order.orderStatus, OrderStatus.PAID);
      assert.equal(res.order.paymentStatus, PaymentStatus.SUCCESS);
      assert.ok(res.order.paidAt);

      restoreFetch();
    });

    await test("Repeated verification callback is idempotent (alreadyPaid: true)", async () => {
      // Even if Paystack fetch is invoked again, order is already PAID
      const res = await verifyAndFulfillOrder(createdOrderRef);

      assert.equal(res.success, true);
      assert.equal(res.alreadyPaid, true);
      assert.equal(res.order?.orderStatus, OrderStatus.PAID);
      assert.equal(res.order?.paymentStatus, PaymentStatus.SUCCESS);
    });

    await test("Failed or abandoned transaction NEVER marks order as PAID", async () => {
      // Create a fresh pending order
      setupMockPaystackFetch({ initStatus: true });

      const pendingRes = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Tunde Bakare",
            email: "tunde@example.com",
            phone: "+2348022334455",
            address: "5 Toyin Street",
            city: "Ikeja",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );

      restoreFetch();

      const failedRef = pendingRes.reference!;

      // Verify with abandoned status
      setupMockPaystackFetch({
        verifyStatus: "abandoned",
        verifyRef: failedRef,
      });

      const verifyRes = await verifyAndFulfillOrder(failedRef);
      assert.equal(verifyRes.success, false);
      assert.equal(verifyRes.status, "abandoned");

      const dbOrder = await prisma.order.findUnique({
        where: { paymentReference: failedRef },
      });

      assert.equal(dbOrder?.orderStatus, OrderStatus.PENDING_PAYMENT); // Remains PENDING_PAYMENT, NEVER marked PAID
      assert.equal(dbOrder?.paymentStatus, PaymentStatus.ABANDONED);

      restoreFetch();
    });

    await test("Amount mismatch (paid less than expected) is rejected and not fulfilled", async () => {
      setupMockPaystackFetch({ initStatus: true });

      const pendingRes = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Bisi Alabi",
            email: "bisi@example.com",
            phone: "+2348033445566",
            address: "8 Ozumba Mbadiwe",
            city: "Victoria Island",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );

      restoreFetch();

      const mismatchRef = pendingRes.reference!;

      // Mock Paystack returning ₦10,000 instead of ₦28,500
      setupMockPaystackFetch({
        verifyStatus: "success",
        verifyAmountKobo: 1000000, // ₦10,000 instead of ₦28,500
        verifyCurrency: "NGN",
        verifyRef: mismatchRef,
      });

      const verifyRes = await verifyAndFulfillOrder(mismatchRef);
      assert.equal(verifyRes.success, false);
      assert.equal(verifyRes.status, "amount_mismatch");

      const dbOrder = await prisma.order.findUnique({
        where: { paymentReference: mismatchRef },
      });

      assert.equal(dbOrder?.orderStatus, OrderStatus.PENDING_PAYMENT);
      assert.equal(dbOrder?.paymentStatus, PaymentStatus.FAILED);

      restoreFetch();
    });

    // =================================================================
    // TEST GROUP 6: Paystack Webhook Signature & Idempotency
    // =================================================================
    console.log("\nTEST GROUP 6: Webhook HMAC Signature & Idempotency");

    await test("Valid HMAC SHA512 signature is verified successfully", async () => {
      const rawBody = JSON.stringify({
        event: "charge.success",
        data: { reference: "test_ref", amount: 2850000, currency: "NGN" },
      });

      const validSig = crypto
        .createHmac("sha512", mockSecretKey)
        .update(rawBody)
        .digest("hex");

      assert.equal(verifyPaystackWebhookSignature(rawBody, validSig), true);
    });

    await test("Invalid or forged signature is strictly rejected", async () => {
      const rawBody = JSON.stringify({ event: "charge.success" });
      const badSig = "forged_signature_00000000000000000000000000000000";

      assert.equal(verifyPaystackWebhookSignature(rawBody, badSig), false);
      assert.equal(verifyPaystackWebhookSignature(rawBody, null), false);
    });

    await test("Webhook charge.success transitions pending order to PAID and is idempotent", async () => {
      // Create pending order
      setupMockPaystackFetch({ initStatus: true });

      const pendingRes = await createPendingOrder(
        {
          storeSlug: testStoreSlugA,
          customer: {
            name: "Webhook Test Customer",
            email: "webhook@example.com",
            phone: "+2348044556677",
            address: "20 Marina",
            city: "Lagos",
            state: "Lagos",
          },
          items: [{ productId: testProductId1, quantity: 1 }],
        },
        { callbackBaseUrl: "http://localhost:3000" }
      );

      restoreFetch();

      const webhookRef = pendingRes.reference!;

      // Deliver charge.success webhook event
      const res1 = await handlePaystackWebhookChargeSuccess({
        reference: webhookRef,
        amount: 2850000, // ₦28,500 * 100
        currency: "NGN",
        paid_at: new Date().toISOString(),
      });

      assert.equal(res1.success, true);

      const dbOrder = await prisma.order.findUnique({
        where: { paymentReference: webhookRef },
      });

      assert.equal(dbOrder?.orderStatus, OrderStatus.PAID);
      assert.equal(dbOrder?.paymentStatus, PaymentStatus.SUCCESS);

      // Duplicate webhook delivery
      const res2 = await handlePaystackWebhookChargeSuccess({
        reference: webhookRef,
        amount: 2850000,
        currency: "NGN",
      });

      assert.equal(res2.success, true);
      assert.ok(res2.message.includes("already verified"));
    });

    // =================================================================
    // TEST GROUP 7: Multi-Tenant Seller Isolation & Order Management
    // =================================================================
    console.log("\nTEST GROUP 7: Multi-Tenant Seller Isolation & Visibility");

    await test("Seller A sees only their own storefront orders", async () => {
      const ordersA = await getSellerOrders(testSellerA);
      assert.ok(ordersA.length >= 1);
      assert.ok(ordersA.every((o) => o.sellerId === testSellerA));
    });

    await test("Seller B sees 0 orders from Seller A (strict tenant isolation)", async () => {
      const ordersB = await getSellerOrders(testSellerB);
      assert.equal(ordersB.length, 0);
    });

    await test("Seller B cannot modify or update Seller A's order status (unauthorized 403)", async () => {
      const ordersA = await getSellerOrders(testSellerA);
      const targetOrderId = ordersA[0].id;

      const res = await updateSellerOrderStatus(testSellerB, targetOrderId, OrderStatus.SHIPPED);
      assert.equal(res.success, false);
      assert.ok(res.error?.includes("Unauthorized"));

      // Verify status in DB remained unchanged
      const current = await prisma.order.findUnique({ where: { id: targetOrderId } });
      assert.notEqual(current?.orderStatus, OrderStatus.SHIPPED);
    });

    await test("Seller A can update their own order status to PROCESSING then SHIPPED", async () => {
      const ordersA = await getSellerOrders(testSellerA);
      const targetOrderId = ordersA[0].id;

      const res1 = await updateSellerOrderStatus(testSellerA, targetOrderId, OrderStatus.PROCESSING);
      assert.equal(res1.success, true);

      const res2 = await updateSellerOrderStatus(testSellerA, targetOrderId, OrderStatus.SHIPPED);
      assert.equal(res2.success, true);

      const updated = await prisma.order.findUnique({ where: { id: targetOrderId } });
      assert.equal(updated?.orderStatus, OrderStatus.SHIPPED);
    });

    await test("Public order lookup (getPublicOrderByReference) NEVER exposes supplierCost or sellerId", async () => {
      const publicSummary = await getPublicOrderByReference(createdOrderRef);

      assert.ok(publicSummary);
      assert.equal(publicSummary.orderNumber, createdOrderNumber);
      assert.equal(publicSummary.totalAmount, 57000);

      // Check item fields
      const pubItem = publicSummary.items[0];
      assert.equal(pubItem.productName, "Stage E Luxury Wireless Earbuds");
      assert.equal(pubItem.unitPrice, 28500);

      // CRITICAL SECURITY: supplier cost and seller internal IDs must NEVER be in public DTO
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.equal((pubItem as any).supplierCostSnapshot, undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.equal((publicSummary as any).sellerId, undefined);
    });

    // =================================================================
    // TEST GROUP 8: WhatsApp Replacement as Primary Checkout Flow
    // =================================================================
    console.log("\nTEST GROUP 8: Removal of WhatsApp as Checkout Mechanism");

    await test("Verified product detail view imports StoreCartProvider and exposes Add to Cart", async () => {
      const fs = await import("fs/promises");
      const detailViewContent = await fs.readFile(
        "src/components/storefront/PublicProductDetailView.tsx",
        "utf-8"
      );

      assert.ok(
        detailViewContent.includes("StoreCartProvider"),
        "PublicProductDetailView must integrate with StoreCartProvider"
      );
      assert.ok(
        detailViewContent.includes("Add to Cart"),
        "PublicProductDetailView must have Add to Cart action"
      );
      assert.ok(
        detailViewContent.includes("Buy Now"),
        "PublicProductDetailView must have Buy Now action"
      );
      assert.ok(
        !detailViewContent.includes("Order via WhatsApp"),
        "PublicProductDetailView must NOT have 'Order via WhatsApp' as primary CTA"
      );
    });
  } finally {
    restoreFetch();

    // Clean up test records
    try {
      await prisma.orderItem.deleteMany({
        where: { order: { sellerId: { in: [testSellerA, testSellerB] } } },
      });
      await prisma.order.deleteMany({
        where: { sellerId: { in: [testSellerA, testSellerB] } },
      });
      await prisma.storeProduct.deleteMany({
        where: { sellerId: { in: [testSellerA, testSellerB] } },
      });
      await prisma.storeProfile.deleteMany({
        where: { sellerId: { in: [testSellerA, testSellerB] } },
      });
      await prisma.product.deleteMany({
        where: { id: { in: [testProductId1, testProductId2] } },
      });
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

runStageETests();
