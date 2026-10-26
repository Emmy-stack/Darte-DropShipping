export type ProductCategory =
  | "Electronics"
  | "Fashion"
  | "Beauty"
  | "Home & Living"
  | "Health & Wellness"
  | "Accessories"
  | "Phones & Gadgets"
  | "Fitness";

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductSupplier {
  name: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  fulfillmentDays: string;
  location: string;
  minOrderQty: number;
  dispatchRate: string;
}

export interface ProductShippingInfo {
  dispatchTime: string;
  estimatedDelivery: string;
  courier: string;
  freeShipping: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  images: string[];
  supplier: ProductSupplier;
  supplierRating: number;
  supplierCost: number;
  suggestedSellingPrice: number;
  stock: number;
  inStock: boolean;
  tags: string[];
  variants: ProductVariant[];
  shippingInfo: ProductShippingInfo;
  specifications: ProductSpecification[];
  badges?: string[];
}

export interface StoreProductItem {
  productId: string;
  addedAt: string;
  customSellingPrice?: number;
}
