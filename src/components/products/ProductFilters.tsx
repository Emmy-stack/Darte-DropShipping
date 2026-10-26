"use client";

import React from "react";
import { SlidersHorizontal, RotateCcw, Check, Star } from "lucide-react";
import { PRODUCT_CATEGORIES, MOCK_PRODUCTS } from "@/data/products";

const ALL_SUPPLIERS = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.supplier.name))).sort();

export interface FilterState {
  category: string;
  supplier: string;
  priceRange: "all" | "under-10k" | "10k-20k" | "20k-plus";
  minProfit: number;
  minRating: number;
  availability: "all" | "in-stock";
  sortBy: "recommended" | "profit-desc" | "cost-asc" | "cost-desc" | "rating-desc";
}

export const INITIAL_FILTERS: FilterState = {
  category: "All",
  supplier: "all",
  priceRange: "all",
  minProfit: 0,
  minRating: 0,
  availability: "all",
  sortBy: "recommended",
};

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isMobileModal?: boolean;
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  isMobileModal = false,
}: ProductFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const isFiltered =
    filters.category !== "All" ||
    filters.supplier !== "all" ||
    filters.priceRange !== "all" ||
    filters.minProfit > 0 ||
    filters.minRating > 0 ||
    filters.availability !== "all" ||
    filters.sortBy !== "recommended";

  return (
    <div className={`space-y-6 ${isMobileModal ? "p-1" : "bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs"}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#16A34A]" />
          <h3 className="text-sm font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Filters
          </h3>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] hover:text-[#0B3D2E] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Sort Products
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter("sortBy", e.target.value as FilterState["sortBy"])}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] focus:outline-hidden focus:border-[#16A34A]"
        >
          <option value="recommended">Featured / Recommended</option>
          <option value="profit-desc">Highest Potential Profit</option>
          <option value="cost-asc">Supplier Cost: Low to High</option>
          <option value="cost-desc">Supplier Cost: High to Low</option>
          <option value="rating-desc">Top Supplier Rating</option>
        </select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] focus:outline-hidden focus:border-[#16A34A]"
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Supplier
        </label>
        <select
          value={filters.supplier}
          onChange={(e) => updateFilter("supplier", e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-[#111827] focus:outline-hidden focus:border-[#16A34A]"
        >
          <option value="all">All Verified Suppliers</option>
          {ALL_SUPPLIERS.map((sup) => (
            <option key={sup} value={sup}>
              {sup}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier Cost Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Supplier Cost
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "all", label: "Any Cost" },
            { id: "under-10k", label: "< ₦10,000" },
            { id: "10k-20k", label: "₦10k – ₦20k" },
            { id: "20k-plus", label: "₦20,000+" },
          ].map((option) => {
            const isSelected = filters.priceRange === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateFilter("priceRange", option.id as FilterState["priceRange"])
                }
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#DCFCE7] text-[#0B3D2E] font-bold border border-[#BBF7D0]"
                    : "bg-[#F8FAF9] border border-[#E5E7EB] text-[#4B5563] hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Potential Profit Minimum */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
            Min. Profit
          </label>
          <span className="text-xs font-bold text-[#16A34A]">
            {filters.minProfit > 0 ? `₦${filters.minProfit.toLocaleString()}+` : "Any"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { val: 0, label: "All" },
            { val: 5000, label: "₦5k+" },
            { val: 8000, label: "₦8k+" },
            { val: 10000, label: "₦10k+" },
            { val: 20000, label: "₦20k+" },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => updateFilter("minProfit", item.val)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                filters.minProfit === item.val
                  ? "bg-[#0B3D2E] text-white font-semibold"
                  : "bg-[#F8FAF9] border border-[#E5E7EB] text-[#4B5563] hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Supplier Rating
        </label>
        <div className="space-y-1.5">
          {[
            { rating: 0, label: "Any Rating" },
            { rating: 4.5, label: "4.5★ and above" },
            { rating: 4.8, label: "4.8★ top rated" },
          ].map((item) => {
            const isSelected = filters.minRating === item.rating;
            return (
              <button
                key={item.rating}
                type="button"
                onClick={() => updateFilter("minRating", item.rating)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#DCFCE7] text-[#0B3D2E] font-semibold border border-[#BBF7D0]"
                    : "hover:bg-[#F8FAF9] text-[#4B5563]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {item.rating > 0 && (
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  )}
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block">
          Availability
        </label>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Items (Including backorders)" },
            { id: "in-stock", label: "In Stock Only" },
          ].map((item) => {
            const isSelected = filters.availability === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  updateFilter("availability", item.id as FilterState["availability"])
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#DCFCE7] text-[#0B3D2E] font-semibold border border-[#BBF7D0]"
                    : "hover:bg-[#F8FAF9] text-[#4B5563]"
                }`}
              >
                <span>{item.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
