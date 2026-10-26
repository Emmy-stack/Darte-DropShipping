"use client";

import React from "react";
import { PackageX, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function TrustStrip() {
  const indicators = [
    {
      icon: PackageX,
      title: "No inventory required",
      subtitle: "Zero capital tied down in stock",
    },
    {
      icon: ShieldCheck,
      title: "Verified suppliers",
      subtitle: "Vetted quality & factory pricing",
    },
    {
      icon: Zap,
      title: "Automated fulfillment",
      subtitle: "Dispatched direct to buyers",
    },
    {
      icon: BarChart3,
      title: "Built-in analytics",
      subtitle: "Track views, orders & profit",
    },
  ];

  return (
    <section className="border-y border-[#E5E7EB] bg-white/70 py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Everything you need to start selling online
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {indicators.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 group p-2 rounded-xl transition-colors hover:bg-[#F8FAF9]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#16A34A] group-hover:text-white transition-all duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#0B3D2E] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
