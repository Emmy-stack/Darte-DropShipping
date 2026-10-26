"use client";

import React from "react";
import { SearchX, FilterX, RotateCcw } from "lucide-react";
import { Product } from "@/lib/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  searchQuery?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
}

export default function ProductGrid({
  products,
  searchQuery = "",
  hasActiveFilters = false,
  onResetFilters,
  onClearSearch,
}: ProductGridProps) {
  // Empty State
  if (products.length === 0) {
    if (searchQuery) {
      return (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-4 shadow-xs">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            No products found
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mt-1.5 leading-relaxed">
            Try a different search term or explore another category. No items matched &ldquo;
            <span className="font-semibold text-[#111827]">{searchQuery}</span>&rdquo;.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                Clear Search
              </button>
            )}
            {hasActiveFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-[#374151] text-xs sm:text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-4 shadow-xs">
          <FilterX className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
          No products match your current filters
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mt-1.5 leading-relaxed">
          Broaden your criteria or reset the filters to see more available dropshipping products.
        </p>

        {onResetFilters && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#165641] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
