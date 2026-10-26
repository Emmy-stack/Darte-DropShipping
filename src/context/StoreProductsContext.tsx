"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Product, StoreProductItem } from "@/lib/types/product";
import { MOCK_PRODUCTS, getProductById } from "@/data/products";
import { calculateProfit, calculateMarginPercentage } from "@/lib/utils/formatCurrency";

export interface StoredProductDetail extends Product {
  storeRecordId?: string;
  addedAt: string;
  storeSellingPrice: number;
  storeProfit: number;
  storeMargin: number;
}

export interface ToastNotification {
  isOpen: boolean;
  productName: string;
  profit: number;
  isNew: boolean;
  isError?: boolean;
  errorMessage?: string;
}

interface StoreProductsContextType {
  storeItems: StoreProductItem[];
  storeProducts: StoredProductDetail[];
  isHydrated: boolean;
  isLoading: boolean;
  isProductInStore: (productId: string) => boolean;
  addProductToStore: (
    productId: string,
    customSellingPrice?: number
  ) => Promise<{ success: boolean; isNew: boolean }>;
  removeProductFromStore: (productId: string) => Promise<void>;
  updateStoreProductPrice: (productId: string, newPrice: number) => Promise<void>;
  getStoreProducts: () => StoredProductDetail[];
  toast: ToastNotification;
  closeToast: () => void;
  refreshStoreProducts: () => Promise<void>;
}

const StoreProductsContext = createContext<StoreProductsContextType | undefined>(undefined);

export function StoreProductsProvider({ children }: { children: React.ReactNode }) {
  const [storeProducts, setStoreProducts] = useState<StoredProductDetail[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // In-flight request lock to prevent duplicate concurrent submissions
  const pendingRequests = useRef<Set<string>>(new Set());

  const [toast, setToast] = useState<ToastNotification>({
    isOpen: false,
    productName: "",
    profit: 0,
    isNew: true,
  });

  // Fetch authenticated seller's store products from backend
  const fetchSellerProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/seller/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          setStoreProducts(data.products);
        }
      } else if (response.status === 401) {
        // User is not signed in
        setStoreProducts([]);
      }
    } catch (err) {
      console.warn("Could not load store products from backend:", err);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, []);

  // Initial load on mount without synchronous setState in effect body
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const response = await fetch("/api/seller/products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            setStoreProducts(data.products);
          }
        } else if (response.status === 401) {
          if (isMounted) setStoreProducts([]);
        }
      } catch (err) {
        console.warn("Could not load store products from backend:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsHydrated(true);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derived storeItems for backwards compatibility
  const storeItems: StoreProductItem[] = useMemo(() => {
    return storeProducts.map((p) => ({
      productId: p.id,
      addedAt: p.addedAt,
      customSellingPrice: p.storeSellingPrice,
    }));
  }, [storeProducts]);

  const isProductInStore = useCallback(
    (productId: string): boolean => {
      return storeProducts.some((item) => item.id === productId);
    },
    [storeProducts]
  );

  const addProductToStore = useCallback(
    async (
      productId: string,
      customSellingPrice?: number
    ): Promise<{ success: boolean; isNew: boolean }> => {
      // Prevent duplicate concurrent requests
      if (pendingRequests.current.has(`add_${productId}`)) {
        return { success: false, isNew: false };
      }
      pendingRequests.current.add(`add_${productId}`);

      const product = getProductById(productId) || MOCK_PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        pendingRequests.current.delete(`add_${productId}`);
        return { success: false, isNew: false };
      }

      const price = customSellingPrice ?? product.suggestedSellingPrice;
      const profit = calculateProfit(price, product.supplierCost);
      const margin = calculateMarginPercentage(price, product.supplierCost);
      const existingIdx = storeProducts.findIndex((p) => p.id === productId);
      const isNew = existingIdx < 0;

      // 1. Optimistic update
      const previousState = [...storeProducts];
      let optimisticList: StoredProductDetail[];

      if (isNew) {
        const newDetail: StoredProductDetail = {
          ...product,
          addedAt: new Date().toISOString(),
          storeSellingPrice: price,
          storeProfit: profit,
          storeMargin: margin,
        };
        optimisticList = [newDetail, ...storeProducts];
      } else {
        optimisticList = storeProducts.map((p, idx) =>
          idx === existingIdx
            ? {
                ...p,
                storeSellingPrice: price,
                storeProfit: profit,
                storeMargin: margin,
              }
            : p
        );
      }

      setStoreProducts(optimisticList);
      setToast({
        isOpen: true,
        productName: product.name,
        profit,
        isNew,
        isError: false,
      });

      // 2. Persist to backend
      try {
        const res = await fetch("/api/seller/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, customSellingPrice: price }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // Rollback on failure
          setStoreProducts(previousState);
          setToast({
            isOpen: true,
            productName: product.name,
            profit: 0,
            isNew: false,
            isError: true,
            errorMessage: errData.error || "Failed to save product to store",
          });
          return { success: false, isNew: false };
        }

        const data = await res.json();
        // Sync any server-assigned ID if available
        if (data.record?.id) {
          setStoreProducts((current) =>
            current.map((item) =>
              item.id === productId ? { ...item, storeRecordId: data.record.id } : item
            )
          );
        }

        return { success: true, isNew };
      } catch (err: unknown) {
        // Rollback
        setStoreProducts(previousState);
        const errorMsg = err instanceof Error ? err.message : "Network error while saving product";
        setToast({
          isOpen: true,
          productName: product.name,
          profit: 0,
          isNew: false,
          isError: true,
          errorMessage: errorMsg,
        });
        return { success: false, isNew: false };
      } finally {
        pendingRequests.current.delete(`add_${productId}`);
      }
    },
    [storeProducts]
  );

  const updateStoreProductPrice = useCallback(
    async (productId: string, newPrice: number) => {
      const existing = storeProducts.find((p) => p.id === productId);
      if (!existing) return;

      const previousState = [...storeProducts];
      const validPrice = Math.max(existing.supplierCost, newPrice);
      const newProfit = calculateProfit(validPrice, existing.supplierCost);
      const newMargin = calculateMarginPercentage(validPrice, existing.supplierCost);

      // Optimistic update
      setStoreProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                storeSellingPrice: validPrice,
                storeProfit: newProfit,
                storeMargin: newMargin,
              }
            : item
        )
      );

      try {
        const res = await fetch(`/api/seller/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customSellingPrice: validPrice }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setStoreProducts(previousState);
          setToast({
            isOpen: true,
            productName: existing.name,
            profit: 0,
            isNew: false,
            isError: true,
            errorMessage: errData.error || "Failed to update selling price",
          });
        }
      } catch (err: unknown) {
        setStoreProducts(previousState);
        const errorMsg = err instanceof Error ? err.message : "Network error while updating price";
        setToast({
          isOpen: true,
          productName: existing.name,
          profit: 0,
          isNew: false,
          isError: true,
          errorMessage: errorMsg,
        });
      }
    },
    [storeProducts]
  );

  const removeProductFromStore = useCallback(
    async (productId: string) => {
      const existing = storeProducts.find((p) => p.id === productId);
      const previousState = [...storeProducts];

      // Optimistic remove
      setStoreProducts((prev) => prev.filter((p) => p.id !== productId));

      try {
        const res = await fetch(`/api/seller/products/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setStoreProducts(previousState);
          if (existing) {
            setToast({
              isOpen: true,
              productName: existing.name,
              profit: 0,
              isNew: false,
              isError: true,
              errorMessage: errData.error || "Failed to remove product from store",
            });
          }
        }
      } catch (err: unknown) {
        setStoreProducts(previousState);
        const errorMsg = err instanceof Error ? err.message : "Network error while removing product";
        if (existing) {
          setToast({
            isOpen: true,
            productName: existing.name,
            profit: 0,
            isNew: false,
            isError: true,
            errorMessage: errorMsg,
          });
        }
      }
    },
    [storeProducts]
  );

  const getStoreProducts = useCallback((): StoredProductDetail[] => {
    return storeProducts;
  }, [storeProducts]);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <StoreProductsContext.Provider
      value={{
        storeItems,
        storeProducts,
        isHydrated,
        isLoading,
        isProductInStore,
        addProductToStore,
        removeProductFromStore,
        updateStoreProductPrice,
        getStoreProducts,
        toast,
        closeToast,
        refreshStoreProducts: fetchSellerProducts,
      }}
    >
      {children}
    </StoreProductsContext.Provider>
  );
}

export function useStoreProducts() {
  const context = useContext(StoreProductsContext);
  if (!context) {
    throw new Error("useStoreProducts must be used within a StoreProductsProvider");
  }
  return context;
}
