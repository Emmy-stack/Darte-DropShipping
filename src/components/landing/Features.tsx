"use client";

import React from "react";
import {
  Compass,
  Calculator,
  Layout,
  ClipboardList,
  Truck,
  LineChart,
  Wallet,
  Share2,
  ArrowUpRight,
} from "lucide-react";

export default function Features() {
  const featureList = [
    {
      title: "Product Discovery",
      description: "Find products and suppliers in one place.",
      longDesc:
        "Direct access to vetted African and international suppliers with live stock levels and bulk wholesale pricing.",
      icon: Compass,
      tag: "Vetted Catalog",
    },
    {
      title: "Smart Pricing",
      description: "Understand your potential margins before selling.",
      longDesc:
        "Interactive margin calculators help you set retail prices that cover packaging, ads, and delivery fees safely.",
      icon: Calculator,
      tag: "Margin Calc",
    },
    {
      title: "Storefronts",
      description: "Create a professional online store.",
      longDesc:
        "Launch an ultra-fast, mobile-optimized online store under your own brand identity without writing a line of code.",
      icon: Layout,
      tag: "No-Code",
    },
    {
      title: "Order Management",
      description: "Manage every order from one dashboard.",
      longDesc:
        "Centralized control of all pending, shipped, delivered, and completed customer transactions in real time.",
      icon: ClipboardList,
      tag: "Automated",
    },
    {
      title: "Supplier Fulfillment",
      description: "Orders can flow directly to suppliers.",
      longDesc:
        "Once a buyer places an order, the supplier packs and delivers directly to their doorstep without your physical intervention.",
      icon: Truck,
      tag: "Zero Storage",
    },
    {
      title: "Business Analytics",
      description: "Track revenue, orders, products and profit.",
      longDesc:
        "Clean, visual charts showing which items are driving the highest profits, top customer locations, and repeat rates.",
      icon: LineChart,
      tag: "Live Metrics",
    },
    {
      title: "Wallet & Payouts",
      description: "Keep track of your earnings and withdrawals.",
      longDesc:
        "Instant settlement into your Darté wallet. Withdraw anytime directly into Nigerian banks with zero hassle.",
      icon: Wallet,
      tag: "Instant Payouts",
    },
    {
      title: "Social Selling",
      description:
        "Built for businesses selling through WhatsApp, Instagram, TikTok and other social channels.",
      longDesc:
        "Generate direct WhatsApp checkout links, Instagram bio links, and product stickers to convert social followers into paid orders.",
      icon: Share2,
      tag: "Omnichannel",
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold uppercase tracking-wider mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Everything your online business needs.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6B7280] leading-relaxed">
            Powerful software engineered to make African dropshipping, social
            commerce, and supply chain management completely seamless.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#F8FAF9] rounded-2xl p-6 border border-[#E5E7EB] hover-card-elevation flex flex-col justify-between group transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] text-[#16A34A] flex items-center justify-center shadow-xs group-hover:bg-[#16A34A] group-hover:text-white group-hover:border-[#16A34A] transition-all duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#0B3D2E] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] mb-2 group-hover:text-[#0B3D2E] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-sm font-semibold text-[#374151] mb-2 leading-snug">
                    {feat.description}
                  </p>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {feat.longDesc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#16A34A] font-medium">
                  <span>Learn more</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
