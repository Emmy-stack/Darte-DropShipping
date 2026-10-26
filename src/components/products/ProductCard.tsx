"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Plus, Check, ArrowRight, TrendingUp } from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatNaira, calculateProfit, calculateMarginPercentage } from "@/lib/utils/formatCurrency";
import { useStoreProducts } from "@/context/StoreProductsContext";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23F3F4F6'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='sans-serif' font-size='16' font-weight='600'%3EDart%C3%A9 Product%3C/text%3E%3C/svg%3E";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isProductInStore, addProductToStore } = useStoreProducts();
  const inStore = isProductInStore(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const profit = calculateProfit(product.suggestedSellingPrice, product.supplierCost);
  const marginPercent = calculateMarginPercentage(
    product.suggestedSellingPrice,
    product.supplierCost
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToStore(product.id);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#BBF7D0] shadow-xs hover-card-elevation overflow-hidden flex flex-col transition-all duration-200">
      {/* 1. Image & Badges Container */}
      <Link
        href={`/dashboard/products/${product.id}`}
        className="relative aspect-4/3 w-full bg-[#F3F4F6] overflow-hidden block"
        aria-label={`View details for ${product.name}`}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        )}

        <Image
          src={imageError ? FALLBACK_IMAGE : product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            {product.badges && product.badges.length > 0 ? (
              product.badges.map((badge) => (
                <span
                  key={badge}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs ${
                    badge === "High Margin"
                      ? "bg-[#0B3D2E]/90 text-[#DCFCE7] border border-[#16A34A]/30"
                      : badge === "New"
                      ? "bg-[#16A34A]/90 text-white"
                      : "bg-white/95 text-[#111827] border border-[#E5E7EB]"
                  }`}
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/95 text-[#4B5563] backdrop-blur-xs border border-[#E5E7EB]">
                {product.category}
              </span>
            )}
          </div>

          {/* Stock Status Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs ${
              product.inStock
                ? "bg-white/95 text-[#0B3D2E] border border-[#DCFCE7]"
                : "bg-gray-900/80 text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.inStock ? "bg-[#16A34A]" : "bg-gray-400"
              }`}
            />
            <span>{product.inStock ? "In Stock" : "Out of Stock"}</span>
          </span>
        </div>
      </Link>

      {/* 2. Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Supplier Info & Category */}
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] mb-1.5">
            <span className="font-medium text-[#16A34A] truncate max-w-[55%]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 shrink-0 font-medium text-[#374151]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.supplierRating.toFixed(1)}</span>
              {product.supplier.verified && (
                <span title="Verified Supplier">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                </span>
              )}
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/dashboard/products/${product.id}`}
            className="block group-hover:text-[#16A34A] transition-colors"
          >
            <h3 className="text-sm font-bold text-[#111827] line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Supplier Name */}
          <p className="text-[11px] text-[#6B7280] mt-1 truncate">
            Supplier: <span className="text-[#374151] font-medium">{product.supplier.name}</span>
          </p>
        </div>

        {/* 3. Product Profit Calculation Box */}
        <div className="bg-[#F8FAF9] rounded-xl p-3 border border-[#E5E7EB] space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] block">
                Supplier Cost
              </span>
              <span className="text-xs font-bold text-[#111827] mt-0.5 block">
                {formatNaira(product.supplierCost)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] block">
                Selling Price
              </span>
              <span className="text-xs font-semibold text-[#4B5563] mt-0.5 block">
                {formatNaira(product.suggestedSellingPrice)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#0B3D2E]">
                Potential Profit
              </span>
            </div>
            <div className="text-right flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-[#16A34A]">
                {formatNaira(profit)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#0B3D2E]">
                {marginPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-[#111827] text-xs font-semibold transition-colors"
          >
            <span>View Product</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
          </Link>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
              inStore
                ? "bg-[#DCFCE7] text-[#0B3D2E] border border-[#BBF7D0]"
                : "bg-[#0B3D2E] hover:bg-[#165641] text-white"
            }`}
            title={inStore ? "Already in your store (Click to update)" : "Add to Store"}
            aria-label={inStore ? "Product in store" : "Add product to store"}
          >
            {inStore ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="hidden sm:inline">In Store</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
