"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import { CartItem } from "@/types/cart";
import { PublicStoreProduct } from "@/types/store";

interface StoreCartContextValue {
  storeSlug: string;
  items: CartItem[];
  addItem: (product: PublicStoreProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotal: number;
  isLoaded: boolean;
}

const StoreCartContext = createContext<StoreCartContextValue | null>(null);

const emptySubscribe = () => () => {};

export function StoreCartProvider({
  storeSlug,
  children,
}: {
  storeSlug: string;
  children: React.ReactNode;
}) {
  const storageKey = `darte_cart_${storeSlug}`;

  // Lazily initialize items from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`darte_cart_${storeSlug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const isLoaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn("Could not persist cart to localStorage:", err);
    }
  }, [items, isLoaded, storageKey]);

  const addItem = (product: PublicStoreProduct, quantity = 1) => {
    const qtyToAdd = Math.max(1, quantity);
    const primaryImage =
      product.images && product.images.length > 0 ? product.images[0] : null;

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.productId === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + qtyToAdd;
        updated[existingIdx] = {
          ...existing,
          price: product.price, // ensure updated price
          quantity: newQty,
          inStock: product.inStock,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: primaryImage,
          quantity: qtyToAdd,
          inStock: product.inStock,
          maxStock: product.stock,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity } : it))
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const totalCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [items]);

  return (
    <StoreCartContext.Provider
      value={{
        storeSlug,
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotal,
        isLoaded,
      }}
    >
      {children}
    </StoreCartContext.Provider>
  );
}

export function useStoreCart() {
  const context = useContext(StoreCartContext);
  if (!context) {
    return {
      storeSlug: "",
      items: [],
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
      isCartOpen: false,
      setIsCartOpen: () => {},
      totalCount: 0,
      subtotal: 0,
      isLoaded: true,
    };
  }
  return context;
}
