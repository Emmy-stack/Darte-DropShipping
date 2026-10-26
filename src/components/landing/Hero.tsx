"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Package,
  Sparkles,
  ShoppingBag,
  Users,
  Plus,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  const [isAdded, setIsAdded] = useState(false);

  const supplierPrice = 18500;
  const sellingPrice = 27500;
  const profit = sellingPrice - supplierPrice;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle background ambient mesh glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#DCFCE7]/60 via-[#16A34A]/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute top-10 right-[-10%] w-[400px] h-[400px] bg-[#16A34A]/5 blur-[90px] -z-10 pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 text-left max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0B3D2E]">
                The New African Commerce
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.1] font-[family-name:var(--font-heading)]">
              Turn Products <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D2E] via-[#16A34A] to-[#15803D]">
                Into Business.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 text-lg sm:text-xl text-[#4B5563] leading-relaxed font-normal">
              Discover products, launch your store, and start selling without
              holding inventory. Darté gives you the tools to build and grow
              your online business.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-base font-semibold shadow-md shadow-[#16A34A]/25 transition-all duration-200 group"
              >
                <span>Start Selling</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] text-base font-semibold transition-all duration-200 shadow-sm hover:border-[#D1D5DB]"
              >
                <ShoppingBag className="w-4 h-4 text-[#16A34A]" />
                <span>Explore Products</span>
              </a>
            </div>

            {/* Trust statement */}
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]/80 flex items-center gap-3 text-xs sm:text-sm text-[#6B7280]">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#0B3D2E] text-white text-[11px] font-bold flex items-center justify-center">
                  NG
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#16A34A] text-white text-[11px] font-bold flex items-center justify-center">
                  GH
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#0E4736] text-white text-[11px] font-bold flex items-center justify-center">
                  KE
                </div>
              </div>
              <p className="font-medium text-[#374151]">
                Built for the next generation of African online sellers.
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual Ecosystem */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Visual Container */}
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Main Central Product Card: Trending Product */}
              <div className="relative z-20 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_20px_50px_-15px_rgba(11,61,46,0.12)] transition-all duration-300">
                {/* Header status bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F3F4F6]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold">
                      <Sparkles className="w-3 h-3 text-[#16A34A]" />
                      Trending Product
                    </span>
                    <span className="text-xs text-[#9CA3AF]">High Demand</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#16A34A] font-medium bg-[#16A34A]/5 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Supplier
                  </div>
                </div>

                {/* Product Detail Preview */}
                <div className="flex items-center gap-4">
                  {/* Visual product thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-[#F1F5F3] to-[#E2E8F0] p-2 flex items-center justify-center relative overflow-hidden border border-[#E5E7EB]">
                    {/* Realistic Smartwatch SVG Illustration */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full drop-shadow-md"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Watch Straps */}
                      <rect x="36" y="2" width="28" height="22" rx="4" fill="#1E293B" />
                      <rect x="36" y="76" width="28" height="22" rx="4" fill="#1E293B" />
                      {/* Watch Case */}
                      <rect
                        x="24"
                        y="18"
                        width="52"
                        height="64"
                        rx="16"
                        fill="#0F172A"
                        stroke="#475569"
                        strokeWidth="2"
                      />
                      {/* AMOLED Screen */}
                      <rect x="29" y="23" width="42" height="54" rx="11" fill="#020617" />
                      {/* UI on Screen */}
                      <circle cx="50" cy="42" r="12" stroke="#16A34A" strokeWidth="2.5" strokeDasharray="60 15" />
                      <text x="50" y="45" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                        10:42
                      </text>
                      <path d="M42 58 Q46 54 50 58 T58 58" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
                      <text x="50" y="68" textAnchor="middle" fill="#94A3B8" fontSize="6" fontFamily="sans-serif">
                        7,420 steps
                      </text>
                    </svg>
                    <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0B3D2E] text-white">
                      TOP
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-tight">
                      Wireless Smartwatch
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Electronics &amp; Wearables • 4.9 ★ (412 reviews)
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#0B3D2E] font-medium bg-[#F1F5F3] px-2 py-0.5 rounded">
                      <Package className="w-3 h-3 text-[#16A34A]" />
                      <span>Ready to fulfill in 24h</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Grid */}
                <div className="mt-5 grid grid-cols-3 gap-2.5 p-3.5 bg-[#F8FAF9] rounded-xl border border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] font-medium text-[#6B7280] block">
                      Supplier Price
                    </span>
                    <span className="text-sm font-semibold text-[#374151]">
                      ₦{supplierPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-l border-[#E5E7EB] pl-2.5">
                    <span className="text-[11px] font-medium text-[#6B7280] block">
                      Selling Price
                    </span>
                    <span className="text-sm font-semibold text-[#111827]">
                      ₦{sellingPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-l border-[#BBF7D0] pl-2.5 bg-[#DCFCE7]/50 rounded-lg p-1">
                    <span className="text-[11px] font-semibold text-[#0B3D2E] block">
                      Potential Profit
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#16A34A] block">
                      ₦{profit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action button in card */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setIsAdded(!isAdded)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isAdded
                        ? "bg-[#0B3D2E] text-white shadow-sm"
                        : "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-md shadow-[#16A34A]/20"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 text-[#DCFCE7]" />
                        <span>Added to Your Storefront ✓</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Store</span>
                      </>
                    )}
                  </button>
                  {isAdded && (
                    <p className="text-center text-[11px] text-[#16A34A] mt-1.5 font-medium animate-fade-in">
                      Ready to sell! Syncing to Emmy Gadgets storefront...
                    </p>
                  )}
                </div>
              </div>

              {/* Floating Card 1: +₦45,000 Sale (Top Right) */}
              <div className="absolute -top-6 -right-3 sm:-right-6 z-30 bg-white rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 shadow-lg shadow-black/5 animate-float-slow hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1">
                    <span className="text-[#16A34A] font-extrabold">+₦45,000</span> Sale
                  </div>
                  <span className="text-[10px] text-[#6B7280]">Customer paid via Transfer</span>
                </div>
              </div>

              {/* Floating Card 2: Order Fulfilled ✓ (Bottom Left) */}
              <div className="absolute -bottom-6 -left-3 sm:-left-8 z-30 bg-white rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 shadow-lg shadow-black/5 animate-float-reverse hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0B3D2E] flex items-center justify-center text-[#DCFCE7]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1">
                    Order Fulfilled <span className="text-[#16A34A]">✓</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280]">Supplier dispatched to Abuja</span>
                </div>
              </div>

              {/* Floating Card 3: 1,284 Store Visitors (Top Left) */}
              <div className="absolute -top-7 -left-2 sm:-left-6 z-10 bg-white/95 backdrop-blur-sm rounded-xl border border-[#E5E7EB] px-3 py-2 shadow-md hidden md:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#374151]">
                  <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#111827] block">
                    1,284 Store Visitors
                  </span>
                  <span className="text-[9px] text-[#16A34A] font-medium">
                    +24% from Instagram Bio
                  </span>
                </div>
              </div>

              {/* Subtle Darté Workflow Indicator Ring */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B7280] px-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Zero Inventory Held
                </span>
                <span className="text-[#9CA3AF]">•</span>
                <span>Supplier Ships Direct</span>
                <span className="text-[#9CA3AF]">•</span>
                <span className="font-semibold text-[#0B3D2E]">Direct Payout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
