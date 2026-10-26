"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  PackageOpen,
  ArrowUpDown,
  ShoppingBag,
} from "lucide-react";
import {
  PublicStoreProfile,
  PublicStoreProduct,
  StorefrontSortOption,
} from "@/types/store";
import StorefrontHeader from "./StorefrontHeader";
import StorefrontProductCard from "./StorefrontProductCard";
import StorefrontPoliciesModal from "./StorefrontPoliciesModal";
import StorefrontCartDrawer from "./StorefrontCartDrawer";
import { StoreCartProvider } from "@/context/StoreCartContext";

interface StorefrontCatalogueViewProps {
  store: PublicStoreProfile;
  initialProducts: PublicStoreProduct[];
  categories: string[];
}

export default function StorefrontCatalogueView({
  store,
  initialProducts,
  categories,
}: StorefrontCatalogueViewProps) {
  return (
    <StoreCartProvider storeSlug={store.slug}>
      <StorefrontCatalogueContent
        store={store}
        initialProducts={initialProducts}
        categories={categories}
      />
    </StoreCartProvider>
  );
}

function StorefrontCatalogueContent({
  store,
  initialProducts,
  categories,
}: StorefrontCatalogueViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState<StorefrontSortOption>("default");
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  // Client-side filtering & sorting for instant responsiveness
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Category Filter
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => p.category.toLowerCase() === cat);
    }

    // 2. Search Query Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, sortOption]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== "all" || sortOption !== "default";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortOption("default");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827] flex flex-col">
      {/* Store Header */}
      <StorefrontHeader
        store={store}
        onOpenPolicies={() => setIsPoliciesOpen(true)}
      />

      {/* Main Storefront Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Controls Bar: Search, Category Filters, Sort */}
        {initialProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products in this store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D1D5DB] bg-white text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280] hidden sm:inline" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as StorefrontSortOption)}
                  className="px-3 py-2.5 rounded-xl border border-[#D1D5DB] bg-white text-xs font-medium text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#16A34A] shadow-2xs"
                >
                  <option value="default">Default (Newest)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Category Pills Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-[#6B7280] mr-1 shrink-0 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#9CA3AF]" />
                  <span>Category:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[#0B3D2E] text-white"
                      : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  All ({initialProducts.length})
                </button>

                {categories.map((cat) => {
                  const count = initialProducts.filter(
                    (p) => p.category.toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#0B3D2E] text-white"
                          : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto text-xs font-medium text-rose-600 hover:text-rose-800 whitespace-nowrap underline px-2 py-1"
                  >
                    Reset all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Count & Filter Indicator */}
        {initialProducts.length > 0 && hasActiveFilters && (
          <div className="text-xs text-[#6B7280] flex items-center justify-between">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of {initialProducts.length} products
            </span>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <StorefrontProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        ) : initialProducts.length > 0 ? (
          /* No search/filter match empty state */
          <div className="py-16 px-4 bg-white rounded-3xl border border-[#E5E7EB] text-center max-w-lg mx-auto space-y-4 my-8 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111827]">No Matching Products</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo; in this store. Try checking your spelling or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] hover:bg-[#114B39] text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Empty store: 0 products added by seller */
          <div className="py-20 px-4 bg-white rounded-3xl border border-[#E5E7EB] text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] text-[#0B3D2E] flex items-center justify-center mx-auto">
              <PackageOpen className="w-8 h-8 text-[#16A34A]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#111827]">Store Catalogue Empty</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                {store.name} hasn&apos;t added any products to their storefront catalogue yet. Please check back soon as new inventory is frequently updated!
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#16A34A] bg-[#DCFCE7]/50 px-3.5 py-1.5 rounded-full border border-[#16A34A]/20">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Verified Merchant Storefront</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-8 mt-12 text-center text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2">
          <p className="font-semibold text-[#111827]">
            {store.name} • Powered by Darté Commerce
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            Independent African dropshipping seller platform. Wholesale catalogue fulfilled via trusted local suppliers.
          </p>
        </div>
      </footer>

      {/* Policies & Info Modal */}
      <StorefrontPoliciesModal
        store={store}
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Cart Drawer */}
      <StorefrontCartDrawer
        storeSlug={store.slug}
        storeName={store.name}
      />
    </div>
  );
}
