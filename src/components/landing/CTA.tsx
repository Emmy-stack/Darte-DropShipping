"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section id="get-started" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Green Card */}
        <div className="relative rounded-3xl bg-[#0B3D2E] text-white px-8 py-16 sm:px-16 sm:py-20 overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#16A34A]/25 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#165641]/40 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#165641] text-[#DCFCE7] border border-[#16A34A]/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Launch Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-heading)] leading-tight">
              Ready to start selling?
            </h2>

            <p className="text-lg sm:text-xl text-[#D1D5DB] max-w-xl mx-auto font-normal">
              Build your store. Find products. Make your first sale.
            </p>

            {/* Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-base font-bold shadow-lg shadow-black/25 transition-all duration-200 group"
              >
                <span>Get Started — It&apos;s Free</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Secondary Text */}
            <p className="text-sm text-[#A7F3D0] font-medium pt-1">
              No inventory required.
            </p>

            {/* Micro Trust Points */}
            <div className="pt-6 border-t border-[#165641] flex flex-wrap items-center justify-center gap-6 text-xs text-[#D1D5DB]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Instant store creation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Free forever starter plan</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Direct bank account settlements</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
