"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  ArrowRight,
  Trash2,
  TrendingUp,
  Tag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Edit2,
  Info,
  X,
} from "lucide-react";
import { useStoreProducts } from "@/context/StoreProductsContext";
import { formatNaira } from "@/lib/utils/formatCurrency";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23F3F4F6'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='sans-serif' font-size='16' font-weight='600'%3EDart%C3%A9 Product%3C/text%3E%3C/svg%3E";

export default function MyProductsView() {
  const { getStoreProducts, isHydrated, removeProductFromStore, updateStoreProductPrice } =
    useStoreProducts();
  const products = getStoreProducts();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Totals
  const totalPotentialProfit = products.reduce((sum, p) => sum + p.storeProfit, 0);
  const averageMargin =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + p.storeMargin, 0) / products.length
        )
      : 0;

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setTempPrice(currentPrice);
  };

  const handleSavePrice = (id: string, supplierCost: number) => {
    // Validate that selling price is at least supplier cost
    const validPrice = Math.max(supplierCost, tempPrice || supplierCost);
    updateStoreProductPrice(id, validPrice);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] h-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-white rounded-2xl border border-[#E5E7EB]" />
          <div className="h-28 bg-white rounded-2xl border border-[#E5E7EB]" />
          <div className="h-28 bg-white rounded-2xl border border-[#E5E7EB]" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Storefront Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
              Your Products
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Products you add to your store will appear here.
            </p>
          </div>

          <Link
            href="/dashboard/products/find"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold shadow-xs shadow-[#16A34A]/25 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Find Products</span>
          </Link>
        </div>

        {/* Polished Empty State */}
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 sm:p-14 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-5 shadow-xs">
            <Package className="w-8 h-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Your products will appear here once you add them.
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mt-2 leading-relaxed">
            Browse our verified supplier marketplace to find high-margin trending products, inspect their profit potential, and add them to your store with one click.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/dashboard/products/find"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold shadow-xs shadow-[#16A34A]/20 transition-all hover:scale-[1.02]"
            >
              <span>Find Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Actions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Store Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Your Products
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Manage pricing margins and inventory for items ready in your store.
          </p>
        </div>

        <Link
          href="/dashboard/products/find"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#165641] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Find More Products</span>
        </Link>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Added Products</span>
            <Package className="w-4 h-4 text-[#16A34A]" />
          </div>
          <span className="text-2xl font-extrabold text-[#111827] block font-[family-name:var(--font-heading)]">
            {products.length}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Held in temporary session catalog
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Potential Profit</span>
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          </div>
          <span className="text-2xl font-extrabold text-[#16A34A] block font-[family-name:var(--font-heading)]">
            {formatNaira(totalPotentialProfit)}
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Estimated profit if 1 unit of each sells
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Margin</span>
            <Tag className="w-4 h-4 text-[#16A34A]" />
          </div>
          <span className="text-2xl font-extrabold text-[#0B3D2E] block font-[family-name:var(--font-heading)]">
            {averageMargin}%
          </span>
          <span className="text-[11px] text-[#6B7280] mt-1 block">
            Across all selected inventory items
          </span>
        </div>
      </div>

      {/* 3. Products List */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Products In Your Store ({products.length})
          </h2>
          <span className="text-xs text-[#6B7280]">
            Click any product to inspect details or adjust markup
          </span>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {products.map((item) => {
            const isEditing = editingId === item.id;
            const imgSrc = imageErrors[item.id] ? FALLBACK_IMAGE : item.images[0];

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F8FAF9]/50 transition-colors"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative aspect-square w-16 sm:w-20 rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                    <Image
                      src={imgSrc}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#0B3D2E]">
                        {item.category}
                      </span>
                      {item.inStock ? (
                        <span className="text-[10px] font-semibold text-[#16A34A] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                          In Stock ({item.stock})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-500">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/products/${item.id}`}
                      className="text-sm font-bold text-[#111827] hover:text-[#16A34A] transition-colors block truncate"
                    >
                      {item.name}
                    </Link>

                    <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                      <span>Supplier: {item.supplier.name}</span>
                      {item.supplier.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Economics Box */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E5E7EB]">
                  {/* Supplier Cost */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                      Cost
                    </span>
                    <span className="text-xs font-semibold text-[#4B5563]">
                      {formatNaira(item.supplierCost)}
                    </span>
                  </div>

                  {/* Selling Price */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                      Selling Price
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePrice(item.id, item.supplierCost);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="w-24 px-2 py-1 text-xs rounded-lg border border-[#16A34A] bg-white font-bold text-[#111827] focus:outline-hidden"
                          min={item.supplierCost}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePrice(item.id, item.supplierCost)}
                          className="p-1 rounded-md bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors"
                          aria-label="Save price"
                          title="Save price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 rounded-md bg-gray-100 text-[#4B5563] hover:bg-gray-200 transition-colors"
                          aria-label="Cancel editing"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-[#111827]">
                          {formatNaira(item.storeSellingPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartEdit(item.id, item.storeSellingPrice)
                          }
                          className="p-1 text-[#9CA3AF] hover:text-[#16A34A] transition-colors"
                          title="Edit selling price"
                          aria-label="Edit selling price"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profit */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                      Profit / Margin
                    </span>
                    <span className="text-xs font-extrabold text-[#16A34A] block">
                      +{formatNaira(item.storeProfit)}
                    </span>
                    <span className="text-[10px] font-bold text-[#0B3D2E]">
                      {item.storeMargin}% margin
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/products/${item.id}`}
                      className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                      title="View product details"
                      aria-label="View product details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeProductFromStore(item.id)}
                      className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove from store"
                      aria-label="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Stage B Architecture Note */}
      <div className="p-4 rounded-2xl bg-[#DCFCE7]/40 border border-[#BBF7D0] flex items-start gap-3 text-xs text-[#0B3D2E]">
        <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Stage B Database Persistence Active</p>
          <p className="text-[#374151]">
            These products are securely linked to your seller account in PostgreSQL via Prisma. Your custom retail prices and profit margins are persisted across all sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
