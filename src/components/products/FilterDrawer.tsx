"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import ProductFilters, { FilterState } from "./ProductFilters";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  totalResults,
}: FilterDrawerProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Filter Products</h3>
            <p className="text-xs text-[#6B7280]">
              Showing {totalResults} available product{totalResults !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <ProductFilters
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            isMobileModal
          />
        </div>

        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAF9] flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#374151] hover:bg-[#F8FAF9]"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-semibold hover:bg-[#165641]"
          >
            Show {totalResults} Results
          </button>
        </div>
      </div>
    </div>
  );
}
