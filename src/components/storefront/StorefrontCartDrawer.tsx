"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useStoreCart } from "@/context/StoreCartContext";
import { formatNaira } from "@/lib/utils/formatCurrency";

interface StorefrontCartDrawerProps {
  storeSlug: string;
  storeName: string;
}

export default function StorefrontCartDrawer({
  storeSlug,
  storeName,
}: StorefrontCartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
  } = useStoreCart();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Prevent background body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-all duration-300 ease-in-out">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAF9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#0B3D2E] flex items-center justify-center shadow-2xs">
                <ShoppingBag className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111827]">
                  Your Shopping Cart
                </h2>
                <span className="text-[11px] text-[#6B7280]">
                  {storeName} • {totalCount} item{totalCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-lg border border-[#E5E7EB] hover:bg-white text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors"
              title="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#111827]">
                    Your Cart is Empty
                  </h3>
                  <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
                    Add curated products from {storeName} to prepare your order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors"
                >
                  Browse Store Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAF9]/60 hover:bg-white hover:border-[#D1D5DB] transition-all flex items-start gap-3"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-[#9CA3AF]" />
                      )}
                    </div>

                    {/* Item Info & Quantity Controls */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#111827] truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-[#9CA3AF] hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-extrabold text-[#111827]">
                        {formatNaira(item.price)}
                      </div>

                      {/* Quantity bar & line total */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="inline-flex items-center border border-[#D1D5DB] rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-[#111827]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#0B3D2E]">
                          Total: {formatNaira(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-800 underline transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E5E7EB] bg-white space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[#6B7280]">Subtotal</span>
                  <span className="text-lg font-black text-[#111827]">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Nationwide Shipping</span>
                  <span className="text-[#16A34A] font-semibold">Store Shipping Policy</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Secure Nigerian bank &amp; card checkout powered by Paystack</span>
                </div>
              </div>

              <Link
                href={`/shop/${storeSlug}/checkout`}
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
