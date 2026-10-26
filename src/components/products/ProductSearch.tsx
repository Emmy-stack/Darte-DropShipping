"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFilters?: () => void;
  activeFilterCount?: number;
}

export default function ProductSearch({
  searchQuery,
  onSearchChange,
  onToggleFilters,
  activeFilterCount = 0,
}: ProductSearchProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input Container */}
      <div className="relative flex-1">
        <label htmlFor="product-discovery-search" className="sr-only">
          Search products
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
          <Search className="w-4 h-4" />
        </div>

        <input
          id="product-discovery-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onSearchChange("");
          }}
          placeholder="Search products, categories, suppliers, or tags (e.g. watch, beauty, phone)..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all shadow-xs [&::-webkit-search-cancel-button]:hidden"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#111827] transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button (Mobile & Tablet) */}
      {onToggleFilters && (
        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-xs font-semibold text-[#111827] transition-colors shadow-xs shrink-0"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#16A34A]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
