"use client";

import React, { useState } from "react";
import {
  Plus,
  Check,
  TrendingUp,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  badge: string;
  supplierPrice: number;
  suggestedPrice: number;
  supplierName: string;
  supplierLocation: string;
  rating: number;
  salesCount: string;
  renderVisual: React.ReactNode;
}

export default function ProductShowcase() {
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Trending");

  const products: Product[] = [
    {
      id: "prod-projector",
      name: "Ultra-HD Portable Projector",
      category: "Home & Tech",
      badge: "High Margin",
      supplierPrice: 32000,
      suggestedPrice: 47000,
      supplierName: "TechHub Lagos",
      supplierLocation: "Ikeja, Lagos",
      rating: 4.9,
      salesCount: "1.2k+ sold",
      renderVisual: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Projector Body */}
          <rect
            x="20"
            y="35"
            width="120"
            height="55"
            rx="12"
            fill="#1E293B"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Glass Lens Rim */}
          <circle cx="50" cy="62" r="20" fill="#0F172A" stroke="#16A34A" strokeWidth="2.5" />
          <circle cx="50" cy="62" r="14" fill="#0284C7" fillOpacity="0.4" />
          <circle cx="47" cy="58" r="4" fill="#FFFFFF" fillOpacity="0.8" />
          {/* Vent Grills */}
          <line x1="85" y1="50" x2="125" y2="50" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="58" x2="125" y2="58" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="66" x2="125" y2="66" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="74" x2="115" y2="74" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* Power LED */}
          <circle cx="128" cy="44" r="2.5" fill="#16A34A" />
        </svg>
      ),
    },
    {
      id: "prod-smartwatch",
      name: "Aura Series Smartwatch",
      category: "Wearables",
      badge: "Fast Selling",
      supplierPrice: 18500,
      suggestedPrice: 27500,
      supplierName: "Horizon Import Ltd",
      supplierLocation: "Trade Fair, Lagos",
      rating: 4.8,
      salesCount: "3.4k+ sold",
      renderVisual: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Straps */}
          <rect x="65" y="10" width="30" height="25" rx="5" fill="#334155" />
          <rect x="65" y="85" width="30" height="25" rx="5" fill="#334155" />
          {/* Case */}
          <rect
            x="50"
            y="26"
            width="60"
            height="68"
            rx="16"
            fill="#0F172A"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
          {/* Screen */}
          <rect x="55" y="32" width="50" height="56" rx="10" fill="#020617" />
          {/* Clock & Activity Display */}
          <circle cx="80" cy="52" r="14" stroke="#16A34A" strokeWidth="2" strokeDasharray="65 20" />
          <text x="80" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
            09:41
          </text>
          <rect x="64" y="70" width="32" height="4" rx="2" fill="#38BDF8" />
        </svg>
      ),
    },
    {
      id: "prod-earbuds",
      name: "Pro ANC Wireless Earbuds",
      category: "Audio",
      badge: "High Margin",
      supplierPrice: 14200,
      suggestedPrice: 22500,
      supplierName: "SoundWave Africa",
      supplierLocation: "Alaba, Lagos",
      rating: 4.9,
      salesCount: "2.1k+ sold",
      renderVisual: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Charging Case Body */}
          <rect
            x="45"
            y="30"
            width="70"
            height="62"
            rx="20"
            fill="#1E293B"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Lid seam */}
          <line x1="45" y1="52" x2="115" y2="52" stroke="#334155" strokeWidth="1.5" />
          {/* LED battery indicator */}
          <circle cx="80" cy="62" r="2.5" fill="#16A34A" />
          {/* Earbud silhouette accent */}
          <circle cx="68" cy="41" r="5" fill="#0F172A" />
          <circle cx="92" cy="41" r="5" fill="#0F172A" />
          <rect x="66" y="44" width="4" height="6" rx="1" fill="#0F172A" />
          <rect x="90" y="44" width="4" height="6" rx="1" fill="#0F172A" />
        </svg>
      ),
    },
    {
      id: "prod-blender",
      name: "Portable USB-C Blender",
      category: "Kitchen & Living",
      badge: "Top Viral",
      supplierPrice: 9500,
      suggestedPrice: 16000,
      supplierName: "PrimeKitchen Supply",
      supplierLocation: "Wuse, Abuja",
      rating: 4.7,
      salesCount: "4.8k+ sold",
      renderVisual: (
        <svg
          viewBox="0 0 160 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blender Jar */}
          <rect
            x="58"
            y="18"
            width="44"
            height="55"
            rx="8"
            fill="#E2E8F0"
            fillOpacity="0.4"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          {/* Lid */}
          <rect x="54" y="12" width="52" height="10" rx="3" fill="#0B3D2E" />
          <rect x="73" y="8" width="14" height="5" rx="2" fill="#16A34A" />
          {/* Motor Base */}
          <rect
            x="56"
            y="72"
            width="48"
            height="36"
            rx="8"
            fill="#0F172A"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
          {/* Power Button */}
          <circle cx="80" cy="88" r="5" fill="#16A34A" />
          {/* Fruit smoothie swirl inside */}
          <path
            d="M65 48 Q80 40 95 48"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ),
    },
  ];

  const toggleAdd = (id: string) => {
    if (addedIds.includes(id)) {
      setAddedIds(addedIds.filter((item) => item !== id));
    } else {
      setAddedIds([...addedIds, id]);
    }
  };

  const totalSelectedProfit = addedIds.reduce((sum, id) => {
    const prod = products.find((p) => p.id === id);
    return prod ? sum + (prod.suggestedPrice - prod.supplierPrice) : sum;
  }, 0);

  return (
    <section id="products" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold uppercase tracking-wider mb-4">
            Curated Catalog
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Find products worth selling.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B7280] leading-relaxed">
            Don&apos;t waste time searching through thousands of products. Discover
            products, compare supplier prices, and understand your potential
            margins before you sell.
          </p>
        </div>

        {/* Filter / Category Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center gap-2">
            {[
              "All Trending",
              "Electronics & Gadgets",
              "Wearables",
              "Kitchen & Wellness",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-[#0B3D2E] text-white shadow-sm"
                    : "bg-[#F8FAF9] text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB]/70 border border-[#E5E7EB]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Interactive Profit Summary Indicator */}
          {addedIds.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-[#DCFCE7] border border-[#BBF7D0] px-4 py-2 rounded-xl text-xs font-semibold text-[#0B3D2E] animate-fade-in shadow-sm">
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              <span>
                {addedIds.length} {addedIds.length === 1 ? "product" : "products"} added to your store
              </span>
              <span className="bg-[#16A34A] text-white px-2 py-0.5 rounded-lg text-xs">
                +₦{totalSelectedProfit.toLocaleString()} Profit
              </span>
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const profit = product.suggestedPrice - product.supplierPrice;
            const marginPercent = Math.round(
              (profit / product.suggestedPrice) * 100
            );
            const isAdded = addedIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] hover-card-elevation overflow-hidden flex flex-col justify-between transition-all duration-200"
              >
                {/* Card Top: Visual & Badge */}
                <div className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B3D2E] border border-[#BBF7D0]">
                      {product.badge}
                    </span>
                  </div>

                  {/* Visual Render Container */}
                  <div className="w-full h-36 bg-gradient-to-b from-white to-[#F1F5F3] rounded-xl flex items-center justify-center border border-[#E5E7EB] p-2 relative group-hover:scale-[1.02] transition-transform">
                    {product.renderVisual}
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[10px] font-medium text-[#4B5563] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-[#9CA3AF]">({product.salesCount})</span>
                    </div>
                  </div>

                  {/* Title & Supplier */}
                  <h3 className="text-base font-bold text-[#111827] mt-4 leading-snug">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{product.supplierName}</span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="text-[11px] text-[#9CA3AF] truncate">
                      {product.supplierLocation}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Margin & Pricing & Action */}
                <div className="p-5 pt-4">
                  {/* Price breakdown box */}
                  <div className="bg-white rounded-xl p-3 border border-[#E5E7EB] space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">Supplier price:</span>
                      <span className="font-semibold text-[#374151]">
                        ₦{product.supplierPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">Suggested price:</span>
                      <span className="font-semibold text-[#111827]">
                        ₦{product.suggestedPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B3D2E]">
                        Potential profit:
                      </span>
                      <div className="text-right">
                        <span className="text-base font-black text-[#16A34A] block">
                          ₦{profit.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.2 rounded">
                          +{marginPercent}% margin
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Store Button */}
                  <button
                    type="button"
                    onClick={() => toggleAdd(product.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] ${
                      isAdded
                        ? "bg-[#0B3D2E] text-white shadow-sm"
                        : "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm shadow-[#16A34A]/20"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 text-[#DCFCE7]" />
                        <span>Added to Store ✓</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Store</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">
                Over 20,000+ winning products updated weekly
              </h4>
              <p className="text-xs text-[#6B7280]">
                Suppliers in Nigeria, China, and global hubs ready to fulfill directly to your buyers.
              </p>
            </div>
          </div>
          <a
            href="#sellers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0B3D2E] hover:text-[#16A34A] transition-colors whitespace-nowrap"
          >
            <span>Start importing into your storefront</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
