"use client";

import React from "react";
import {
  Users,
  Layers,
  Boxes,
  Inbox,
  Truck,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function SupplierSection() {
  const supplierFeatures = [
    {
      title: "Reach more sellers",
      desc: "Tap into an active network of thousands of hungry social media sellers and online store owners across Africa.",
      icon: Users,
    },
    {
      title: "Manage products",
      desc: "Easily upload bulk catalogs, high-resolution imagery, and wholesale pricing with automated margin calculation.",
      icon: Layers,
    },
    {
      title: "Track inventory",
      desc: "Live stock syncing ensures sellers never sell out-of-stock items, protecting your business reputation.",
      icon: Boxes,
    },
    {
      title: "Receive orders",
      desc: "Direct automated order routing with complete customer address data formatted for instant dispatch.",
      icon: Inbox,
    },
    {
      title: "Manage fulfillment",
      desc: "Print shipping labels with 1 click or use Darté delivery partners for seamless city-to-city logistics.",
      icon: Truck,
    },
    {
      title: "Monitor payouts",
      desc: "Guaranteed escrow protection. Once delivered, supplier wholesale funds are automatically credited to your account.",
      icon: Wallet,
    },
  ];

  return (
    <section id="suppliers" className="py-24 bg-[#0B3D2E] text-white relative overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 bg-[#16A34A]/20 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#165641]/30 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy & Bullet Grid */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#165641] text-[#DCFCE7] border border-[#16A34A]/30 text-xs font-semibold uppercase tracking-wider">
              For Wholesalers, Importers &amp; Manufacturers
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-heading)] leading-tight text-white">
              Have products to sell? <br />
              <span className="text-[#DCFCE7]">Become a Darté supplier.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#D1D5DB] leading-relaxed max-w-xl">
              Connect with online sellers, showcase your products, manage
              inventory, and fulfill orders from one platform.
            </p>

            {/* 6 Feature Bullets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {supplierFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0E4736]/70 border border-[#165641] hover:border-[#16A34A]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#16A34A]/20 text-[#DCFCE7] flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4 text-[#16A34A]" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-base font-semibold shadow-md shadow-black/20 transition-all duration-200 group"
              >
                <span>Become a Supplier</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <span className="text-xs text-[#A7F3D0] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                Zero onboarding fee • Escrow payment protection
              </span>
            </div>
          </div>

          {/* Right Column: Supplier Dashboard Visualization */}
          <div className="lg:col-span-6">
            <div className="bg-[#0E4736] rounded-2xl border border-[#165641] p-6 shadow-2xl relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#165641]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-bold">
                    HQ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Horizon Import Hub
                      </h4>
                      <span className="text-[10px] bg-[#16A34A]/30 text-[#DCFCE7] border border-[#16A34A]/40 px-2 py-0.5 rounded-full font-semibold">
                        Verified Supplier
                      </span>
                    </div>
                    <span className="text-xs text-[#9CA3AF]">
                      Warehouse ID: WH-LAG-04 • Trade Fair, Lagos
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#9CA3AF] block">
                    Escrow Ready Payout
                  </span>
                  <span className="text-sm font-bold text-[#DCFCE7]">
                    ₦1,842,500
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="bg-[#0B3D2E] p-3 rounded-xl border border-[#165641]">
                  <span className="text-[11px] text-[#9CA3AF] block">
                    Active Sellers
                  </span>
                  <span className="text-base font-bold text-white">418</span>
                  <span className="text-[10px] text-[#16A34A] block mt-0.5">
                    +32 this week
                  </span>
                </div>
                <div className="bg-[#0B3D2E] p-3 rounded-xl border border-[#165641]">
                  <span className="text-[11px] text-[#9CA3AF] block">
                    Pending Dispatch
                  </span>
                  <span className="text-base font-bold text-white">24</span>
                  <span className="text-[10px] text-amber-400 block mt-0.5">
                    Next courier: 2:00 PM
                  </span>
                </div>
                <div className="bg-[#0B3D2E] p-3 rounded-xl border border-[#165641]">
                  <span className="text-[11px] text-[#9CA3AF] block">
                    Fulfillment Rate
                  </span>
                  <span className="text-base font-bold text-[#DCFCE7]">
                    99.4%
                  </span>
                  <span className="text-[10px] text-[#16A34A] block mt-0.5">
                    Tier-1 Rating
                  </span>
                </div>
              </div>

              {/* Live Order Queue Preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#9CA3AF] px-1">
                  <span>Incoming Seller Orders</span>
                  <span>Auto-dispatched via Darté</span>
                </div>

                {/* Queue Item 1 */}
                <div className="bg-[#0B3D2E] p-3 rounded-xl border border-[#165641] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#165641] text-[#DCFCE7] flex items-center justify-center font-mono font-bold text-[11px]">
                      #89
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        2x Smartwatch Pro
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        Seller: Emmy Gadgets • Deliver to: Lekki Phase 1
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#DCFCE7]">₦37,000</span>
                    <span className="text-[10px] text-[#16A34A] block font-medium">
                      Label Printed ✓
                    </span>
                  </div>
                </div>

                {/* Queue Item 2 */}
                <div className="bg-[#0B3D2E] p-3 rounded-xl border border-[#165641] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#165641] text-[#DCFCE7] flex items-center justify-center font-mono font-bold text-[11px]">
                      #90
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        1x Ultra 4K Projector
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        Seller: NaijaTechStore • Deliver to: Wuse 2, Abuja
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#DCFCE7]">₦32,000</span>
                    <span className="text-[10px] text-amber-300 block font-medium">
                      Ready for pickup
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Assurance Note */}
              <div className="mt-5 pt-4 border-t border-[#165641] flex items-center justify-between text-xs text-[#A7F3D0]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Wholesale payouts settled directly to bank</span>
                </div>
                <span className="font-mono text-[11px] text-[#9CA3AF]">
                  Zero payment defaults
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
