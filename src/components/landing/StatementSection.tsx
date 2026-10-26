"use client";

import React from "react";
import { Warehouse } from "lucide-react";

export default function StatementSection() {
  return (
    <section className="py-28 md:py-36 bg-[#F8FAF9] relative overflow-hidden text-center">
      {/* Subtle radial ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#DCFCE7]/60 via-[#16A34A]/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs text-xs font-semibold text-[#0B3D2E] mb-8">
          <Warehouse className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>The Zero-Inventory Commerce Model</span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#111827] tracking-tight leading-[1.08] font-[family-name:var(--font-heading)]">
          You don&apos;t need a warehouse <br className="hidden sm:inline" />
          <span className="text-[#16A34A]">to build a business.</span>
        </h2>

        {/* Supporting Text */}
        <p className="mt-8 text-lg sm:text-xl md:text-2xl text-[#4B5563] max-w-3xl mx-auto font-normal leading-relaxed">
          Darté gives you the infrastructure to discover, sell, and grow —
          without the traditional barriers of inventory and fulfillment.
        </p>

        {/* Minimal metrics row */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-10 border-t border-[#E5E7EB]">
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] block font-[family-name:var(--font-heading)]">
              ₦0
            </span>
            <span className="text-xs font-medium text-[#6B7280] mt-1 block">
              Upfront inventory capital required
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#16A34A] block font-[family-name:var(--font-heading)]">
              100%
            </span>
            <span className="text-xs font-medium text-[#6B7280] mt-1 block">
              Supplier-backed order fulfillment
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B3D2E] block font-[family-name:var(--font-heading)]">
              &lt; 3 Mins
            </span>
            <span className="text-xs font-medium text-[#6B7280] mt-1 block">
              To launch your branded storefront
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
