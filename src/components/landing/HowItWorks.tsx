"use client";

import React, { useState } from "react";
import {
  Compass,
  Store,
  Share2,
  Truck,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Discover",
      tagline: "Curated & High-Margin",
      description: "Find products from suppliers on Darté.",
      details:
        "Browse thousands of vetted electronics, beauty, home, and fashion items with factory pricing and clear margin estimates.",
      icon: Compass,
      microVisual: (
        <div className="bg-[#F8FAF9] p-3 rounded-lg border border-[#E5E7EB] text-left">
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] mb-1">
            <span>Electronics • Nigeria</span>
            <span className="text-[#16A34A] font-semibold">94% Margin</span>
          </div>
          <div className="font-semibold text-xs text-[#111827]">
            Mini 4K Pocket Projector
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">Supplier: ₦32,000</span>
            <span className="text-[#16A34A] font-bold">+₦15,000</span>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      title: "Add to your store",
      tagline: "1-Click Import",
      description:
        "Import the product, customize the listing and set your selling price.",
      details:
        "Adjust retail pricing to decide your profit margin, write your own description, or use our high-converting presets.",
      icon: Store,
      microVisual: (
        <div className="bg-[#F8FAF9] p-3 rounded-lg border border-[#E5E7EB] text-left">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[#6B7280]">Markup Slider</span>
            <span className="bg-[#DCFCE7] text-[#0B3D2E] font-bold px-1.5 py-0.5 rounded text-[10px]">
              +48%
            </span>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#16A34A] h-full w-2/3 rounded-full" />
          </div>
          <div className="mt-2 text-xs flex justify-between font-semibold">
            <span className="text-[#6B7280]">Store Price:</span>
            <span className="text-[#111827]">₦47,000</span>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "Make a sale",
      tagline: "Social Selling",
      description:
        "Share your store or product across your social channels and start receiving orders.",
      details:
        "Post your storefront link directly in your Instagram bio, WhatsApp status, or TikTok videos. Customers buy seamlessly.",
      icon: Share2,
      microVisual: (
        <div className="bg-[#F8FAF9] p-3 rounded-lg border border-[#E5E7EB] text-left">
          <div className="text-[11px] font-medium text-[#6B7280] mb-1.5 flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-[#16A34A]" />
            <span>Storefront Link</span>
          </div>
          <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-[#E5E7EB] text-[#111827] truncate">
            darte.shop/emmygadgets
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#16A34A] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Instant Mobile Checkout</span>
          </div>
        </div>
      ),
    },
    {
      num: "04",
      title: "Get fulfilled",
      tagline: "Hands-Free Logistics",
      description:
        "The supplier handles fulfillment while Darté helps you manage the order.",
      details:
        "The supplier packs and delivers directly to your customer's doorstep. Your profit drops directly into your Darté wallet.",
      icon: Truck,
      microVisual: (
        <div className="bg-[#F8FAF9] p-3 rounded-lg border border-[#E5E7EB] text-left">
          <div className="flex items-center justify-between text-[11px] text-[#0B3D2E] mb-1 font-semibold">
            <span>Tracking: #DRT-8942</span>
            <span className="text-[#16A34A]">In Transit</span>
          </div>
          <div className="text-[11px] text-[#6B7280]">
            Supplier dispatched via Express
          </div>
          <div className="mt-2 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded inline-block">
            +₦15,000 Added to Wallet
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F8FAF9] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold uppercase tracking-wider mb-4">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            From product idea to profit{" "}
            <span className="text-[#16A34A]">in a few clicks.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B7280] leading-relaxed">
            Darté simplifies the entire process of starting and running an
            online business.
          </p>
        </div>

        {/* Desktop Horizontal Timeline / Step Grid */}
        <div className="mt-16 hidden lg:block">
          {/* Connector Line */}
          <div className="relative">
            <div
              className="absolute top-1/2 left-12 right-12 h-0.5 bg-[#E5E7EB] -translate-y-1/2 -z-0"
              aria-hidden="true"
            />
            <div className="grid grid-cols-4 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    onClick={() => setActiveStep(idx)}
                    className="cursor-pointer group flex flex-col items-center"
                  >
                    {/* Step Number Circle */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all duration-300 border-2 ${
                        activeStep === idx
                          ? "bg-[#0B3D2E] text-[#DCFCE7] border-[#16A34A] shadow-lg shadow-[#0B3D2E]/20 scale-110"
                          : "bg-white text-[#374151] border-[#E5E7EB] group-hover:border-[#16A34A] group-hover:text-[#16A34A]"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Step Label */}
                    <span className="mt-3 text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                      Step {step.num}
                    </span>
                    <h3 className="text-lg font-bold text-[#111827] mt-1 group-hover:text-[#0B3D2E] transition-colors">
                      {step.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cards Display for All 4 Steps */}
          <div className="mt-12 grid grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover-card-elevation flex flex-col justify-between cursor-pointer ${
                  activeStep === idx
                    ? "border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/10"
                    : "border-[#E5E7EB] shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-[#E5E7EB] font-[family-name:var(--font-heading)]">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0B3D2E] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      {step.tagline}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#111827] mb-2">
                    {step.description}
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                    {step.details}
                  </p>
                </div>

                {/* Micro Visual Card */}
                <div className="mt-2 pt-2 border-t border-[#F3F4F6]">
                  {step.microVisual}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="mt-12 lg:hidden space-y-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#DCFCE7] flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#16A34A] tracking-wider uppercase">
                      Step {step.num}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0B3D2E] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      {step.tagline}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-[#374151] mb-2">
                    {step.description}
                  </p>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                    {step.details}
                  </p>
                  <div>{step.microVisual}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
