"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, SlidersHorizontal, PackageOpen } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import { Product } from "@/lib/types/product";
import { calculateProfit } from "@/lib/utils/formatCurrency";
import ProductSearch from "./ProductSearch";
import CategoryFilter from "./CategoryFilter";
import ProductFilters, { FilterState, INITIAL_FILTERS } from "./ProductFilters";
import FilterDrawer from "./FilterDrawer";
import ProductGrid from "./ProductGrid";

export default function FindProductsView() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);

  // Fetch updated catalogue from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalogue() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch {
        // Silent fallback to initial products
      }
    }
    fetchCatalogue();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category counts for category selector pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    let result: Product[] = [...products];

    // 1. Text Search
    const term = searchQuery.trim().toLowerCase();
    if (term) {
      result = result.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(term);
        const catMatch = product.category.toLowerCase().includes(term);
        const supplierMatch = product.supplier.name.toLowerCase().includes(term);
        const tagMatch = product.tags.some((tag) => tag.toLowerCase().includes(term));
        const descMatch = product.shortDescription.toLowerCase().includes(term);
        return nameMatch || catMatch || supplierMatch || tagMatch || descMatch;
      });
    }

    // 2. Category Filter
    if (filters.category !== "All") {
      result = result.filter((p) => p.category === filters.category);
    }

    // 2b. Supplier Filter
    if (filters.supplier && filters.supplier !== "all") {
      result = result.filter((p) => p.supplier.name === filters.supplier);
    }

    // 3. Price Range (Supplier Cost)
    if (filters.priceRange === "under-10k") {
      result = result.filter((p) => p.supplierCost < 10000);
    } else if (filters.priceRange === "10k-20k") {
      result = result.filter((p) => p.supplierCost >= 10000 && p.supplierCost <= 20000);
    } else if (filters.priceRange === "20k-plus") {
      result = result.filter((p) => p.supplierCost > 20000);
    }

    // 4. Min Profit Filter
    if (filters.minProfit > 0) {
      result = result.filter((p) => {
        const profit = calculateProfit(p.suggestedSellingPrice, p.supplierCost);
        return profit >= filters.minProfit;
      });
    }

    // 5. Supplier Rating Filter
    if (filters.minRating > 0) {
      result = result.filter((p) => p.supplierRating >= filters.minRating);
    }

    // 6. Availability Filter
    if (filters.availability === "in-stock") {
      result = result.filter((p) => p.inStock);
    }

    // 7. Sorting
    if (filters.sortBy === "profit-desc") {
      result.sort((a, b) => {
        const profitA = calculateProfit(a.suggestedSellingPrice, a.supplierCost);
        const profitB = calculateProfit(b.suggestedSellingPrice, b.supplierCost);
        return profitB - profitA;
      });
    } else if (filters.sortBy === "cost-asc") {
      result.sort((a, b) => a.supplierCost - b.supplierCost);
    } else if (filters.sortBy === "cost-desc") {
      result.sort((a, b) => b.supplierCost - a.supplierCost);
    } else if (filters.sortBy === "rating-desc") {
      result.sort((a, b) => b.supplierRating - a.supplierRating);
    }

    return result;
  }, [products, searchQuery, filters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.supplier !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.minProfit > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.availability !== "all") count++;
    if (filters.sortBy !== "recommended") count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSelectCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Find Products
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Discover products you can sell with Darté.
          </p>
        </div>

        {/* Catalog quick stats */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-[#F8FAF9] border border-[#E5E7EB] px-4 py-2 rounded-xl text-xs font-medium text-[#374151] flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-[#16A34A]" />
            <span>
              <strong>{products.length}</strong> Verified Products
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-4">
        <ProductSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setMobileDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* 3. Horizontal Category Selector */}
        <div className="pt-2 border-t border-[#E5E7EB]">
          <CategoryFilter
            selectedCategory={filters.category}
            onSelectCategory={handleSelectCategory}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* 4. Active Results Summary & Desktop Toggle */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[#6B7280]">
          Showing <span className="font-bold text-[#111827]">{filteredProducts.length}</span>{" "}
          product{filteredProducts.length !== 1 ? "s" : ""}
          {searchQuery && (
            <span>
              {" "}
              matching &ldquo;<span className="font-semibold text-[#111827]">{searchQuery}</span>&rdquo;
            </span>
          )}
          {filters.category !== "All" && (
            <span>
              {" "}
              in <span className="font-semibold text-[#16A34A]">{filters.category}</span>
            </span>
          )}
          {filters.supplier !== "all" && (
            <span>
              {" "}
              from <span className="font-semibold text-[#0B3D2E]">{filters.supplier}</span>
            </span>
          )}
        </p>

        {/* Desktop Filter Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setDesktopFiltersOpen(!desktopFiltersOpen)}
          className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#374151] hover:text-[#111827] transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>{desktopFiltersOpen ? "Hide Filters" : "Show Filters"}</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#16A34A] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 5. Main Content Area (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filters Sidebar (Collapsible) */}
        {desktopFiltersOpen && (
          <aside className="hidden lg:block lg:col-span-3 sticky top-24">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </aside>
        )}

        {/* Products Grid */}
        <div
          className={`${
            desktopFiltersOpen ? "lg:col-span-9" : "lg:col-span-12"
          } space-y-6`}
        >
          <ProductGrid
            products={filteredProducts}
            searchQuery={searchQuery}
            hasActiveFilters={activeFilterCount > 0}
            onResetFilters={handleResetFilters}
            onClearSearch={() => setSearchQuery("")}
          />
        </div>
      </div>

      {/* 6. Mobile & Tablet Filter Drawer */}
      <FilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalResults={filteredProducts.length}
      />
    </div>
  );
}
