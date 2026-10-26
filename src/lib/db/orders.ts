import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  CheckoutInitializeInput,
  OrderStatus,
  PaymentStatus,
  PublicOrderSummary,
  PublicOrderItem,
  SellerOrder,
} from "@/types/order";
import { normalizeSlug } from "@/types/store";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack";

export interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  authorizationUrl?: string;
  reference?: string;
  orderId?: string;
  totalAmount?: number;
  error?: string;
}

export interface VerifyOrderResult {
  success: boolean;
  order?: PublicOrderSummary;
  alreadyPaid?: boolean;
  status?: string;
  error?: string;
}

/**
 * Generates a human-friendly unique order number (e.g., DRT-M29B-4F8K).
 */
export function generateOrderNumber(): string {
  const dateStr = Date.now().toString(36).toUpperCase().slice(-4);
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DRT-${dateStr}-${randStr}`;
}

/**
 * Generates a unique transaction reference for Paystack.
 */
export function generatePaymentReference(): string {
  return `drt_tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Validates checkout customer details.
 */
export function validateCustomerDetails(customer: CheckoutInitializeInput["customer"]): string | null {
  if (!customer.name || customer.name.trim().length < 2) {
    return "Please enter your full name (at least 2 characters).";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customer.email || !emailRegex.test(customer.email.trim())) {
    return "Please enter a valid delivery email address.";
  }
  const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9+]/g, "") : "";
  if (!cleanPhone || cleanPhone.length < 8) {
    return "Please enter a valid delivery phone number.";
  }
  if (!customer.address || customer.address.trim().length < 5) {
    return "Please enter your complete street delivery address.";
  }
  if (!customer.city || customer.city.trim().length < 2) {
    return "Please specify your delivery city.";
  }
  if (!customer.state || customer.state.trim().length < 2) {
    return "Please specify your delivery state.";
  }
  return null;
}

/**
 * Creates a pending order in PostgreSQL and initializes Paystack hosted payment.
 * Strictly re-queries products and calculates authoritative prices from the database.
 */
export async function createPendingOrder(
  input: CheckoutInitializeInput,
  options: { callbackBaseUrl: string }
): Promise<CreateOrderResult> {
  const customerValidationError = validateCustomerDetails(input.customer);
  if (customerValidationError) {
    return { success: false, error: customerValidationError };
  }

  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Your shopping cart is empty." };
  }

  const normalizedSlug = normalizeSlug(input.storeSlug);
  if (!normalizedSlug) {
    return { success: false, error: "Invalid store identifier." };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database service is not configured." };
  }

  try {
    // 1. Verify store exists and is published
    const storeProfile = await prisma.storeProfile.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!storeProfile || !storeProfile.isPublished) {
      return { success: false, error: "This storefront is currently unavailable for purchases." };
    }

    const sellerId = storeProfile.sellerId;

    // 2. Query StoreProducts and Products for this seller
    const productIds = input.items.map((it) => it.productId);
    const storeProducts = await prisma.storeProduct.findMany({
      where: {
        sellerId,
        productId: { in: productIds },
      },
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    });

    const storeProductMap = new Map(storeProducts.map((sp) => [sp.productId, sp]));

    // 3. Validate every item and calculate authoritative subtotal
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      storeProductId: string;
      productName: string;
      productImage: string | null;
      productSlug: string;
      category: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      supplierCostSnapshot: number;
      supplierName: string;
      supplierId: string | null;
    }> = [];

    for (const item of input.items) {
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { success: false, error: "Invalid item quantity specified." };
      }

      const sp = storeProductMap.get(item.productId);
      if (!sp) {
        return {
          success: false,
          error: `One of the items in your cart is no longer offered by ${storeProfile.name}.`,
        };
      }

      if (!sp.product.inStock) {
        return {
          success: false,
          error: `"${sp.product.name}" is currently sold out. Please remove it from your cart to proceed.`,
        };
      }

      if (sp.product.status !== "ACTIVE") {
        return {
          success: false,
          error: `"${sp.product.name}" is no longer available. Please remove it from your cart to proceed.`,
        };
      }

      if (sp.product.supplierId && sp.product.supplier?.verificationStatus !== "APPROVED") {
        return {
          success: false,
          error: `"${sp.product.name}" is temporarily unavailable for purchase. Please remove it from your cart to proceed.`,
        };
      }

      const unitPrice = sp.customSellingPrice; // Integer Naira
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      const primaryImage =
        sp.product.images && sp.product.images.length > 0 ? sp.product.images[0] : null;

      orderItemsData.push({
        productId: sp.product.id,
        storeProductId: sp.id,
        productName: sp.product.name,
        productImage: primaryImage,
        productSlug: sp.product.slug,
        category: sp.product.category,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        supplierCostSnapshot: sp.product.supplierCost,
        supplierName: sp.product.supplierName,
        supplierId: sp.product.supplierId || null,
      });
    }

    const shippingAmount = 0; // Standard store shipping policy (or included in retail)
    const discountAmount = 0;
    const totalAmount = subtotal + shippingAmount - discountAmount;

    if (totalAmount <= 0) {
      return { success: false, error: "Invalid order total amount." };
    }

    const orderNumber = generateOrderNumber();
    const paymentReference = generatePaymentReference();

    // 4. Create Order and OrderItems in PostgreSQL atomically
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        sellerId,
        storeId: storeProfile.id,
        storeSlug: storeProfile.slug,
        storeName: storeProfile.name,
        customerName: input.customer.name.trim(),
        customerEmail: input.customer.email.trim().toLowerCase(),
        customerPhone: input.customer.phone.trim(),
        deliveryAddress: input.customer.address.trim(),
        deliveryCity: input.customer.city.trim(),
        deliveryState: input.customer.state.trim(),
        deliveryInstructions: input.customer.instructions?.trim() || null,
        subtotal,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency: "NGN",
        orderStatus: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: "PAYSTACK",
        paymentReference,
        items: {
          create: orderItemsData.map((d) => ({
            productId: d.productId,
            storeProductId: d.storeProductId,
            productName: d.productName,
            productImage: d.productImage,
            productSlug: d.productSlug,
            category: d.category,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            lineTotal: d.lineTotal,
            supplierCostSnapshot: d.supplierCostSnapshot,
            supplierName: d.supplierName,
            supplierId: d.supplierId,
          })),
        },
      },
    });

    // 5. Initialize Paystack Transaction
    const callbackBase = options.callbackBaseUrl.replace(/\/+$/, "");
    const callbackUrl = `${callbackBase}/shop/${encodeURIComponent(storeProfile.slug)}/order-confirmation?reference=${encodeURIComponent(paymentReference)}`;

    const paystackRes = await initializePaystackTransaction({
      email: input.customer.email.trim().toLowerCase(),
      amountKobo: totalAmount * 100, // Paystack expects amount in Kobo (NGN * 100)
      reference: paymentReference,
      callbackUrl,
      metadata: {
        orderId: createdOrder.id,
        orderNumber,
        storeSlug: storeProfile.slug,
        sellerId,
        customerName: input.customer.name.trim(),
        customerPhone: input.customer.phone.trim(),
      },
    });

    if (!paystackRes.success || !paystackRes.authorizationUrl) {
      // Mark payment failed in DB
      await prisma.order.update({
        where: { id: createdOrder.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return {
        success: false,
        orderNumber,
        error: paystackRes.error || "Unable to initialize Paystack payment session.",
      };
    }

    // Update with access code if returned
    if (paystackRes.accessCode) {
      await prisma.order.update({
        where: { id: createdOrder.id },
        data: { paystackAccessCode: paystackRes.accessCode },
      });
    }

    return {
      success: true,
      orderNumber,
      authorizationUrl: paystackRes.authorizationUrl,
      reference: paymentReference,
      orderId: createdOrder.id,
      totalAmount,
    };
  } catch (err: unknown) {
    console.error("Error creating order:", err);
    const message = err instanceof Error ? err.message : "Internal error processing order.";
    return { success: false, error: message };
  }
}

/**
 * Verifies transaction with Paystack and transitions order to PAID / SUCCESS.
 * Fully idempotent: repeated calls return the existing paid order without double-fulfilling.
 */
export async function verifyAndFulfillOrder(
  reference: string
): Promise<VerifyOrderResult> {
  if (!reference || !reference.trim()) {
    return { success: false, error: "Transaction reference is missing." };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database service is not configured." };
  }

  try {
    const cleanRef = reference.trim();
    const order = await prisma.order.findUnique({
      where: { paymentReference: cleanRef },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found for the supplied reference." };
    }

    // Idempotent check: already verified and marked paid
    if (order.orderStatus === OrderStatus.PAID && order.paymentStatus === PaymentStatus.SUCCESS) {
      return {
        success: true,
        alreadyPaid: true,
        order: mapToPublicOrderSummary(order),
      };
    }

    // Call Paystack verify API
    const verifyRes = await verifyPaystackTransaction(cleanRef);

    if (!verifyRes.success) {
      return {
        success: false,
        status: "verification_error",
        error: verifyRes.error || "Paystack verification request failed.",
      };
    }

    const expectedAmountKobo = order.totalAmount * 100;

    // Validate Paystack status
    if (verifyRes.status !== "success") {
      const mappedPaymentStatus =
        verifyRes.status === "abandoned"
          ? PaymentStatus.ABANDONED
          : PaymentStatus.FAILED;

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: mappedPaymentStatus },
      });

      return {
        success: false,
        status: verifyRes.status,
        error: `Payment was not completed. Gateway status: ${verifyRes.status}`,
      };
    }

    // Validate amount integrity (exact kobo match)
    if (verifyRes.amountKobo !== expectedAmountKobo) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return {
        success: false,
        status: "amount_mismatch",
        error: "Paid amount does not match the order payable total.",
      };
    }

    // Validate currency integrity
    if (verifyRes.currency !== "NGN") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return {
        success: false,
        status: "currency_mismatch",
        error: "Currency mismatch: only NGN transactions are accepted.",
      };
    }

    // Transition order to PAID and SUCCESS
    const paidAt = verifyRes.paidAt ? new Date(verifyRes.paidAt) : new Date();

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: OrderStatus.PAID,
        paymentStatus: PaymentStatus.SUCCESS,
        paidAt,
      },
      include: {
        items: true,
      },
    });

    return {
      success: true,
      alreadyPaid: false,
      order: mapToPublicOrderSummary(updatedOrder),
    };
  } catch (err: unknown) {
    console.error("Error verifying order:", err);
    const message = err instanceof Error ? err.message : "Error verifying order payment.";
    return { success: false, error: message };
  }
}

/**
 * Handles Paystack webhooks (e.g. charge.success) idempotently.
 */
export async function handlePaystackWebhookChargeSuccess(data: {
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
}): Promise<{ success: boolean; message: string }> {
  if (!data.reference) {
    return { success: false, message: "Missing reference in webhook payload." };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, message: "Database not configured." };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { paymentReference: data.reference },
    });

    if (!order) {
      return { success: false, message: "Order not found for webhook reference." };
    }

    // If already paid, acknowledge idempotently
    if (order.orderStatus === OrderStatus.PAID && order.paymentStatus === PaymentStatus.SUCCESS) {
      return { success: true, message: "Order already verified and fulfilled." };
    }

    const expectedKobo = order.totalAmount * 100;
    if (data.amount !== expectedKobo || data.currency !== "NGN") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      return { success: false, message: "Payment amount or currency mismatch." };
    }

    const paidAt = data.paid_at ? new Date(data.paid_at) : new Date();

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: OrderStatus.PAID,
        paymentStatus: PaymentStatus.SUCCESS,
        paidAt,
      },
    });

    return { success: true, message: "Order successfully marked as paid from webhook." };
  } catch (err: unknown) {
    console.error("Error handling webhook charge success:", err);
    return { success: false, message: "Database update error during webhook handling." };
  }
}

/**
 * Retrieves public order summary by payment reference or order number.
 * Never exposes confidential supplier cost, seller Clerk ID, or internal metadata.
 */
export async function getPublicOrderByReference(
  referenceOrOrderNumber: string
): Promise<PublicOrderSummary | null> {
  if (!referenceOrOrderNumber || !referenceOrOrderNumber.trim()) return null;
  if (!isDatabaseConfigured()) return null;

  try {
    const target = referenceOrOrderNumber.trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ paymentReference: target }, { orderNumber: target }],
      },
      include: {
        items: true,
      },
    });

    if (!order) return null;

    return mapToPublicOrderSummary(order);
  } catch (err) {
    console.error("Database error in getPublicOrderByReference:", err);
    return null;
  }
}

/**
 * Retrieves all orders for a specific authenticated seller.
 * Strictly enforces seller isolation: a seller can ONLY access orders where sellerId matches.
 */
export async function getSellerOrders(
  sellerId: string,
  options: { status?: string; search?: string } = {}
): Promise<SellerOrder[]> {
  if (!sellerId || !sellerId.trim()) return [];
  if (!isDatabaseConfigured()) return [];

  try {
    const whereClause: Record<string, unknown> = {
      sellerId: sellerId.trim(),
    };

    if (options.status && options.status !== "ALL") {
      whereClause.orderStatus = options.status;
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      whereClause.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      sellerId: ord.sellerId,
      storeId: ord.storeId,
      storeSlug: ord.storeSlug,
      storeName: ord.storeName,
      customerName: ord.customerName,
      customerEmail: ord.customerEmail,
      customerPhone: ord.customerPhone,
      deliveryAddress: ord.deliveryAddress,
      deliveryCity: ord.deliveryCity,
      deliveryState: ord.deliveryState,
      deliveryInstructions: ord.deliveryInstructions,
      subtotal: ord.subtotal,
      shippingAmount: ord.shippingAmount,
      discountAmount: ord.discountAmount,
      totalAmount: ord.totalAmount,
      currency: ord.currency,
      orderStatus: ord.orderStatus,
      paymentStatus: ord.paymentStatus,
      paymentProvider: ord.paymentProvider,
      paymentReference: ord.paymentReference,
      paidAt: ord.paidAt ? ord.paidAt.toISOString() : null,
      createdAt: ord.createdAt.toISOString(),
      items: ord.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        productSlug: it.productSlug,
        category: it.category,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        supplierCostSnapshot: it.supplierCostSnapshot,
        supplierName: it.supplierName,
        supplierId: it.supplierId,
      })),
    }));
  } catch (err) {
    console.error("Database error in getSellerOrders:", err);
    return [];
  }
}

/**
 * Updates an order's status by authenticated seller.
 * Strictly verifies that the order belongs to the calling sellerId.
 */
export async function updateSellerOrderStatus(
  sellerId: string,
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  if (!sellerId || !orderId || !newStatus) {
    return { success: false, error: "Missing required update parameters." };
  }

  const validStatuses = Object.values(OrderStatus);
  if (!validStatuses.includes(newStatus as (typeof validStatuses)[number])) {
    return { success: false, error: `Invalid order status: ${newStatus}` };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.sellerId !== sellerId) {
      return { success: false, error: "Unauthorized: You do not own this order." };
    }

    if (
      order.paymentStatus !== "SUCCESS" &&
      (newStatus === OrderStatus.PROCESSING ||
        newStatus === OrderStatus.SHIPPED ||
        newStatus === OrderStatus.DELIVERED)
    ) {
      return { success: false, error: "Cannot advance fulfillment on an unpaid order." };
    }

    if (
      (order.orderStatus === OrderStatus.CANCELLED || order.paymentStatus === PaymentStatus.REFUNDED) &&
      newStatus === OrderStatus.DELIVERED
    ) {
      return { success: false, error: "Cannot mark a cancelled or refunded order as delivered." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    return { success: true };
  } catch (err) {
    console.error("Database error in updateSellerOrderStatus:", err);
    return { success: false, error: "Failed to update order status." };
  }
}

/**
 * Maps a database Order record to the clean PublicOrderSummary DTO.
 * Excludes all confidential data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToPublicOrderSummary(order: any): PublicOrderSummary {
  return {
    orderNumber: order.orderNumber,
    storeSlug: order.storeSlug,
    storeName: order.storeName,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryState: order.deliveryState,
    deliveryInstructions: order.deliveryInstructions,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentReference: order.paymentReference,
    paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (order.items || []).map((it: any): PublicOrderItem => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImage: it.productImage,
      productSlug: it.productSlug,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
    })),
  };
}
