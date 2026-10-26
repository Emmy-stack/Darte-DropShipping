/**
 * Darté Stage F — Supplier & Company Dashboard Type Definitions
 */

export const SupplierVerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type SupplierVerificationStatusType =
  (typeof SupplierVerificationStatus)[keyof typeof SupplierVerificationStatus];

export const SupplierProductStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type SupplierProductStatusType =
  (typeof SupplierProductStatus)[keyof typeof SupplierProductStatus];

export const SupplierFulfillmentStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type SupplierFulfillmentStatusType =
  (typeof SupplierFulfillmentStatus)[keyof typeof SupplierFulfillmentStatus];

export interface SupplierProfileData {
  id: string;
  clerkUserId: string;
  companyName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  businessEmail: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string | null;
  website: string | null;
  categoriesSupplied: string[];
  verificationStatus: SupplierVerificationStatusType | string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  activeProductCount?: number;
}

export interface SupplierRegistrationInput {
  companyName: string;
  businessEmail: string;
  phone: string;
  country?: string;
  state: string;
  city: string;
  address?: string;
  description?: string;
  categoriesSupplied?: string[];
  website?: string;
  logoUrl?: string;
}

export interface SupplierProfileUpdateInput {
  companyName?: string;
  businessEmail?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string | null;
  description?: string | null;
  categoriesSupplied?: string[];
  website?: string | null;
  logoUrl?: string | null;
}

export interface SupplierProductInput {
  name: string;
  category: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  supplierCost: number; // Wholesale price in integer NGN
  suggestedSellingPrice?: number; // Suggested retail price in integer NGN
  stock: number;
  inStock?: boolean;
  supplierFulfillmentDays: string; // e.g. "1-2 business days"
  supplierDispatchRate?: string; // e.g. "98%"
  supplierLocation?: string; // e.g. "Alaba, Lagos"
  supplierMinOrderQty?: number;
  status?: SupplierProductStatusType | string; // DRAFT, ACTIVE, INACTIVE
}

export interface SupplierProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  images: string[];
  supplierCost: number;
  suggestedSellingPrice: number;
  stock: number;
  inStock: boolean;
  status: string;
  supplierFulfillmentDays: string;
  supplierLocation: string;
  supplierDispatchRate: string;
  supplierMinOrderQty: number;
  connectedSellersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierOrderItem {
  id: string; // OrderItem ID
  orderId: string;
  orderNumber: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  productSlug: string | null;
  category: string | null;
  quantity: number;
  wholesaleUnitPrice: number; // supplierCostSnapshot at order time
  wholesaleLineTotal: number; // quantity * wholesaleUnitPrice
  fulfillmentStatus: SupplierFulfillmentStatusType | string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  // Delivery details for packing & dispatch
  recipientName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryInstructions?: string | null;
}

export interface SupplierDashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingFulfillments: number;
  inProgressFulfillments: number;
  completedFulfillments: number;
  totalWholesaleInFulfillment: number; // Integer NGN
}
