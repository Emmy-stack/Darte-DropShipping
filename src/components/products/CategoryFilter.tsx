"use client";

import React from "react";
import { PRODUCT_CATEGORIES } from "@/data/products";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 -my-1">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat];

          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#0B3D2E] text-white shadow-xs scale-[1.02]"
                  : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F8FAF9] hover:text-[#111827]"
              }`}
            >
              <span>{cat}</span>
              {typeof count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
