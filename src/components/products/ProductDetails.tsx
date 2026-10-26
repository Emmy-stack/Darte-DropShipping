"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Product } from "@/lib/types/product";
import ProductGallery from "./ProductGallery";
import PricingCard from "./PricingCard";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options && v.options.length > 0) {
        initial[v.name] = v.options[0];
      }
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "shipping" | "supplier">("overview");

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs & Back Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6B7280]">
        <Link
          href="/dashboard/products/find"
          className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#16A34A] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Find Products</span>
        </Link>
        <span>/</span>
        <span className="text-[#16A34A] font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-[#111827] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Top Header Title & Meta */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#0B3D2E]">
            {product.category}
          </span>
          {product.badges?.map((badge) => (
            <span
              key={badge}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[#374151]"
            >
              {badge}
            </span>
          ))}
          <div className="flex items-center gap-1 text-xs text-[#374151] font-semibold ml-auto">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.supplierRating.toFixed(1)}</span>
            <span className="text-[#9CA3AF]">({product.supplier.reviewCount} supplier reviews)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)] leading-tight">
          {product.name}
        </h1>

        <p className="text-sm text-[#4B5563] max-w-3xl leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      {/* 3. Main Two-Column Layout (Gallery + Details Left, Economics Card Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Variants Selector (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                Available Variants
              </h3>
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-2">
                    <span className="text-xs font-semibold text-[#111827]">
                      {variant.name}:{" "}
                      <span className="text-[#16A34A]">{selectedVariants[variant.name]}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => {
                        const isSelected = selectedVariants[variant.name] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [variant.name]: option,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#0B3D2E] text-white shadow-xs"
                                : "bg-[#F8FAF9] text-[#4B5563] border border-[#E5E7EB] hover:bg-white"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabbed Section: Overview, Specs, Shipping, Supplier */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            {/* Tabs Bar */}
            <div
              role="tablist"
              aria-label="Product Information Tabs"
              className="flex items-center border-b border-[#E5E7EB] bg-[#F8FAF9] px-2 overflow-x-auto scrollbar-none"
            >
              {[
                { id: "overview", label: "Description" },
                { id: "specs", label: "Specifications" },
                { id: "shipping", label: "Shipping & Logistics" },
                { id: "supplier", label: "Supplier Profile" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                      isActive
                        ? "border-[#16A34A] text-[#0B3D2E] bg-white"
                        : "border-transparent text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827]">Product Overview</h4>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {product.description}
                  </p>
                  <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#374151]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Ready for one-click catalog import</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#374151]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>High-resolution studio photography included</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#374151]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Full return support on defective merchandise</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#374151]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Automated inventory sync with supplier</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827]">Technical Specifications</h4>
                  <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
                    {product.specifications.map((spec) => (
                      <div
                        key={spec.label}
                        className="grid grid-cols-3 p-3 text-xs even:bg-[#F8FAF9]"
                      >
                        <span className="font-semibold text-[#6B7280]">{spec.label}</span>
                        <span className="col-span-2 text-[#111827] font-medium">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827]">Fulfillment &amp; Delivery</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                      <div className="flex items-center gap-2 text-[#16A34A] font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Dispatch Turnaround</span>
                      </div>
                      <p className="text-sm font-bold text-[#111827]">
                        {product.shippingInfo.dispatchTime}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        Orders submitted before cut-off leave warehouse next business day.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                      <div className="flex items-center gap-2 text-[#16A34A] font-bold">
                        <Truck className="w-4 h-4" />
                        <span>Nationwide Delivery</span>
                      </div>
                      <p className="text-sm font-bold text-[#111827]">
                        {product.shippingInfo.estimatedDelivery}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        Fulfilled via {product.shippingInfo.courier}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "supplier" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827]">Verified Supplier Partner</h4>
                  <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold">
                          {product.supplier.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#111827]">
                            {product.supplier.name}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                            <MapPin className="w-3 h-3 text-[#16A34A]" />
                            <span>{product.supplier.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold text-xs text-[#111827]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.supplierRating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">
                          {product.supplier.reviewCount} supplier ratings
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB] text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6B7280]">
                          Dispatch Rate
                        </span>
                        <span className="block font-bold text-[#16A34A]">
                          {product.supplier.dispatchRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6B7280]">
                          Min Order Qty
                        </span>
                        <span className="block font-bold text-[#111827]">
                          {product.supplier.minOrderQty} unit (Dropshipping)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Economics & Add to Store Card */}
        <div className="lg:col-span-5 sticky top-24">
          <PricingCard product={product} />
        </div>
      </div>
    </div>
  );
}
