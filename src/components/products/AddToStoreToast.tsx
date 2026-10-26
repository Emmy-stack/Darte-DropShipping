"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, X, Sparkles } from "lucide-react";
import { useStoreProducts } from "@/context/StoreProductsContext";
import { formatNaira } from "@/lib/utils/formatCurrency";

export default function AddToStoreToast() {
  const { toast, closeToast } = useStoreProducts();

  useEffect(() => {
    if (!toast.isOpen) return;
    const timer = setTimeout(() => {
      closeToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.isOpen, closeToast]);

  if (!toast.isOpen) return null;

  if (toast.isError) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-4 duration-200 px-4 sm:px-0"
      >
        <div className="bg-white rounded-2xl p-5 shadow-2xl border border-red-200 ring-1 ring-red-500/20">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-[#111827]">Action Failed</span>
              </div>
              <p className="text-xs text-[#4B5563] line-clamp-1 font-medium mb-1">
                {toast.productName}
              </p>
              <p className="text-[11px] text-red-600 leading-relaxed">
                {toast.errorMessage || "Could not complete this operation. Please try again."}
              </p>
            </div>

            <button
              onClick={closeToast}
              className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-4 duration-200 px-4 sm:px-0"
    >
      <div className="bg-white rounded-2xl p-5 shadow-2xl border border-[#DCFCE7] ring-1 ring-[#16A34A]/20">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-[#111827]">
                {toast.isNew ? "Added to Store" : "Already in Store (Updated)"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B3D2E]">
                <Sparkles className="w-3 h-3 text-[#16A34A]" />
                +{formatNaira(toast.profit)} profit
              </span>
            </div>
            <p className="text-xs text-[#4B5563] line-clamp-1 font-medium mb-1">
              {toast.productName}
            </p>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              {toast.isNew
                ? "This product has been added to your store and saved to your catalog."
                : "This product is already in your store catalog. Pricing and margins have been refreshed."}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <Link
                href="/dashboard/products"
                onClick={closeToast}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E] transition-colors"
              >
                <span>View in My Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <button
            onClick={closeToast}
            className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
