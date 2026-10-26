"use client";

import React from "react";
import {
  Store,
  Sliders,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  Share2,
} from "lucide-react";

export default function SellerSection() {

  const sellerFeatures = [
    {
      title: "Customize your storefront",
      desc: "Choose your brand name, upload your logo, set your custom colors, and get a professional link in minutes.",
      icon: Store,
    },
    {
      title: "Manage your products",
      desc: "Import high-margin products with 1 click. Set your custom retail markup and control your catalog effortlessly.",
      icon: Sliders,
    },
    {
      title: "Track your orders",
      desc: "Get instant alerts whenever a customer places an order. Follow live tracking from supplier to customer.",
      icon: PackageCheck,
    },
    {
      title: "Monitor your profit",
      desc: "Track daily gross margins and withdraw directly into your Nigerian bank account or mobile wallet anytime.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="sellers" className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      {/* Background ambient subtle circle */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Selling Points */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold uppercase tracking-wider">
              For Online Sellers &amp; Creators
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)] leading-tight">
              Your store. <br />
              Your products. <br />
              <span className="text-[#16A34A]">Your business.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed">
              Create your own online storefront without worrying about
              inventory, complicated infrastructure, or manual order management.
            </p>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
              {sellerFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#16A34A]/40 transition-colors shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-snug">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="#get-started"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-base font-semibold shadow-md shadow-[#16A34A]/25 transition-all duration-200 group"
              >
                <span>Create Your Store</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <span className="text-xs text-[#6B7280] font-medium">
                Takes less than 3 minutes. Zero upfront fees.
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Storefront UI Mockup */}
          <div className="lg:col-span-6 relative">
            {/* Browser / Storefront Window Mockup */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_24px_60px_-15px_rgba(11,61,46,0.12)] overflow-hidden">
              {/* Browser chrome header */}
              <div className="bg-[#F1F5F3] px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                </div>
                {/* Clean URL bar */}
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-[#E5E7EB] text-xs font-mono text-[#374151] w-3/5 justify-center">
                  <span className="text-[#16A34A] font-bold">🔒</span>
                  <span>darte.shop/emmygadgets</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Storefront Content */}
              <div className="p-6">
                {/* Storefront Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      EG
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-extrabold text-[#111827]">
                          Emmy Gadgets
                        </h4>
                        <span className="text-[10px] bg-[#DCFCE7] text-[#0B3D2E] font-bold px-1.5 py-0.2 rounded">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        Curated Tech &amp; Everyday Electronics
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Cart (2)</span>
                    </span>
                  </div>
                </div>

                {/* Store Navigation Bar */}
                <div className="flex items-center justify-between mt-3 text-xs font-semibold text-[#4B5563] border-b border-[#F3F4F6] pb-2.5">
                  <div className="flex items-center gap-5">
                    <span className="text-[#16A34A] border-b-2 border-[#16A34A] pb-2 -mb-2.5 cursor-pointer">
                      Home
                    </span>
                    <span className="hover:text-[#111827] cursor-pointer">
                      Shop
                    </span>
                    <span className="hover:text-[#111827] cursor-pointer">
                      About
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9CA3AF] font-normal hidden sm:inline">
                    Dispatched same-day across Nigeria
                  </span>
                </div>

                {/* Store Hero Banner */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#0B3D2E] to-[#165641] text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#DCFCE7]">
                      New Drops This Week
                    </span>
                    <h5 className="text-sm sm:text-base font-bold mt-0.5">
                      Premium Gadgets With Direct Warranty
                    </h5>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-xs font-semibold text-white whitespace-nowrap shadow-xs">
                    Shop Now
                  </button>
                </div>

                {/* Section Title */}
                <div className="mt-5 mb-3 flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-bold text-[#111827]">
                    Featured Products
                  </h5>
                  <span className="text-[11px] text-[#16A34A] font-semibold cursor-pointer">
                    View All (18)
                  </span>
                </div>

                {/* Featured Products Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Store Item 1 */}
                  <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] flex flex-col justify-between">
                    <div className="w-full h-16 bg-white rounded-lg flex items-center justify-center p-1 border border-[#E5E7EB]">
                      <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border border-[#16A34A]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-[#111827] truncate">
                        Smart Watch Pro
                      </div>
                      <div className="text-xs font-bold text-[#16A34A] mt-0.5">
                        ₦27,500
                      </div>
                    </div>
                  </div>

                  {/* Store Item 2 */}
                  <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] flex flex-col justify-between">
                    <div className="w-full h-16 bg-white rounded-lg flex items-center justify-center p-1 border border-[#E5E7EB]">
                      <div className="w-10 h-8 rounded-lg bg-[#334155] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#38BDF8]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-[#111827] truncate">
                        Pocket 4K Projector
                      </div>
                      <div className="text-xs font-bold text-[#16A34A] mt-0.5">
                        ₦47,000
                      </div>
                    </div>
                  </div>

                  {/* Store Item 3 */}
                  <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] flex flex-col justify-between">
                    <div className="w-full h-16 bg-white rounded-lg flex items-center justify-center p-1 border border-[#E5E7EB]">
                      <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-[#111827] truncate">
                        ANC Earbuds
                      </div>
                      <div className="text-xs font-bold text-[#16A34A] mt-0.5">
                        ₦22,500
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Notification Strip */}
              <div className="bg-[#DCFCE7]/70 border-t border-[#BBF7D0] px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#0B3D2E] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                  <span>Real-time visitor from Instagram bio</span>
                </div>
                <span className="font-bold text-[#16A34A]">Auto-Fulfillment Active</span>
              </div>
            </div>

            {/* Floating Live Sale Badge */}
            <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-lg flex items-center gap-3 animate-float-slow">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#111827]">
                  New Order Received!
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  ₦27,500 • <span className="text-[#16A34A] font-bold">+₦9,000 Profit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
