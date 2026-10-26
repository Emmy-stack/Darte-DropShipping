/**
 * Darté Stage E — Shopping Cart Type Definitions
 */

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number; // Retail selling price in integer Naira (₦)
  image: string | null;
  quantity: number;
  inStock: boolean;
  maxStock?: number;
}

export interface StoreCart {
  storeSlug: string;
  items: CartItem[];
  updatedAt: string;
}
