/**
 * Darté Stage E — Order & Checkout Type Definitions
 */

export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  ABANDONED: "ABANDONED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  instructions?: string;
}

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutInitializeInput {
  storeSlug: string;
  customer: CheckoutCustomerInput;
  items: CheckoutItemInput[];
}

export interface PublicOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  productSlug: string | null;
  category: string | null;
  quantity: number;
  unitPrice: number; // in integer Naira (₦)
  lineTotal: number; // in integer Naira (₦)
}

export interface PublicOrderSummary {
  orderNumber: string;
  storeSlug: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryInstructions?: string | null;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  orderStatus: OrderStatusType | string;
  paymentStatus: PaymentStatusType | string;
  paymentReference: string;
  paidAt?: string | null;
  createdAt: string;
  items: PublicOrderItem[];
}

export interface SellerOrderItem extends PublicOrderItem {
  supplierCostSnapshot?: number | null; // wholesale snapshot at purchase time (internal only)
  supplierName?: string | null;
  supplierId?: string | null;
}

export interface SellerOrder extends PublicOrderSummary {
  id: string;
  sellerId: string;
  storeId?: string | null;
  paymentProvider: string;
  items: SellerOrderItem[];
}
