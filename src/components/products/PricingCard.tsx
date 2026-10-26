"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Check,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Info,
} from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatNaira, calculateProfit, calculateMarginPercentage } from "@/lib/utils/formatCurrency";
import { useStoreProducts } from "@/context/StoreProductsContext";

interface PricingCardProps {
  product: Product;
}

export default function PricingCard({ product }: PricingCardProps) {
  const { isProductInStore, addProductToStore } = useStoreProducts();
  const inStore = isProductInStore(product.id);

  // Allow seller to customize retail price
  const [customPrice, setCustomPrice] = useState<number>(product.suggestedSellingPrice);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const profit = calculateProfit(customPrice, product.supplierCost);
  const marginPercent = calculateMarginPercentage(customPrice, product.supplierCost);

  const handleAdd = () => {
    addProductToStore(product.id, customPrice);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
      {/* 1. Header & Stock */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] block">
            Economics &amp; Margins
          </span>
          <h3 className="text-base font-bold text-[#111827] mt-0.5 font-[family-name:var(--font-heading)]">
            Profit Breakdown
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            product.inStock
              ? "bg-[#DCFCE7] text-[#0B3D2E]"
              : "bg-gray-100 text-[#6B7280]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              product.inStock ? "bg-[#16A34A]" : "bg-gray-400"
            }`}
          />
          <span>{product.inStock ? `${product.stock} Units in Stock` : "Out of Stock"}</span>
        </span>
      </div>

      {/* 2. Three Metric Columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
            Supplier Cost
          </span>
          <span className="text-base font-extrabold text-[#111827] mt-1 block">
            {formatNaira(product.supplierCost)}
          </span>
          <span className="text-[10px] text-[#6B7280] mt-0.5 block">
            What you pay supplier
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
            Selling Price
          </span>
          <span className="text-base font-extrabold text-[#111827] mt-1 block">
            {formatNaira(customPrice)}
          </span>
          <button
            type="button"
            onClick={() => setIsEditingPrice(!isEditingPrice)}
            className="text-[10px] text-[#16A34A] hover:underline font-semibold mt-0.5 block text-left"
          >
            {isEditingPrice ? "Close adjuster" : "Customize retail price"}
          </button>
        </div>
      </div>

      {/* Optional Custom Price Slider / Input */}
      {isEditingPrice && (
        <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#BBF7D0] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Set Your Retail Selling Price</span>
            <button
              type="button"
              onClick={() => setCustomPrice(product.suggestedSellingPrice)}
              className="text-[11px] text-[#6B7280] hover:text-[#111827] underline"
            >
              Reset to suggested
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#6B7280]">₦</span>
            <input
              type="number"
              min={product.supplierCost}
              step={500}
              value={customPrice}
              onChange={(e) => setCustomPrice(Number(e.target.value))}
              onBlur={() => setCustomPrice((prev) => Math.max(product.supplierCost, prev || product.supplierCost))}
              className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-bold text-[#111827] focus:outline-hidden focus:border-[#16A34A]"
            />
          </div>

          <input
            type="range"
            min={product.supplierCost}
            max={Math.max(product.suggestedSellingPrice * 2, product.supplierCost * 3)}
            step={500}
            value={Math.max(product.supplierCost, customPrice)}
            onChange={(e) => setCustomPrice(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer"
          />
          {customPrice <= product.supplierCost && (
            <p className="text-[11px] text-amber-600 font-medium">
              Selling at supplier cost yields ₦0 profit. Increase selling price to earn margin.
            </p>
          )}
        </div>
      )}

      {/* 3. Potential Profit Hero Banner */}
      <div className="p-4 rounded-2xl bg-[#0B3D2E] text-white flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#DCFCE7] font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span>Potential Profit / Unit</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            {formatNaira(profit)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-300 block uppercase tracking-wider">
            Margin
          </span>
          <span className="text-lg font-extrabold text-[#DCFCE7] block">
            {marginPercent}%
          </span>
        </div>
      </div>

      {/* 4. Add to Store Primary Action Button */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleAdd}
          className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs ${
            inStore
              ? "bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#0B3D2E] border border-[#BBF7D0]"
              : "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[#16A34A]/25"
          }`}
        >
          {inStore ? (
            <>
              <Check className="w-4 h-4 text-[#16A34A]" />
              <span>In Your Store (Click to Update Price)</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Store</span>
            </>
          )}
        </button>

        {inStore && (
          <Link
            href="/dashboard/products"
            className="w-full py-2.5 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-xs font-semibold text-[#111827] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Go to My Products</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
          </Link>
        )}

        {/* Stage B Context Indicator */}
        <div className="flex items-start gap-2 pt-1 text-[11px] text-[#6B7280]">
          <Info className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
          <span>
            <strong>Stage B Persistent:</strong> Added products are securely stored in PostgreSQL via Prisma with custom pricing and profit margins.
          </span>
        </div>
      </div>

      {/* 5. Trust & Shipping Assurances */}
      <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5 text-xs text-[#4B5563]">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>
            Dispatch within <strong>{product.shippingInfo.dispatchTime}</strong> ({product.shippingInfo.courier})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>Verified supplier dispatch rate: <strong>{product.supplier.dispatchRate}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>Pre-cleared product photos, copy, and specs ready for your storefront</span>
        </div>
      </div>
    </div>
  );
}
