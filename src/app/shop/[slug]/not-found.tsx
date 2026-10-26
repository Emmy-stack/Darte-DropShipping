import React from "react";
import Link from "next/link";
import { Store, ArrowLeft, Home, Sparkles } from "lucide-react";

export default function ShopNotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between text-[#111827]">
      {/* Header Bar */}
      <header className="p-4 sm:p-6 border-b border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg tracking-tight text-[#0B3D2E]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-[#DCFCE7] flex items-center justify-center font-bold">
              D
            </div>
            <span>Darté</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E]">
            Storefront Gateway
          </span>
        </div>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
          <Store className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
            Storefront Inactive or Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Store Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-sm mx-auto">
            The storefront you are trying to visit does not exist, has an invalid URL, or is currently set to private setup mode by the seller.
          </p>
        </div>

        {/* Helpful instructions */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-left text-xs text-[#4B5563] space-y-2 shadow-2xs">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Are you the store owner?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#6B7280]">
            Log in to your <strong>Darté Seller Dashboard</strong> to verify your store name, configure your store slug, and check that your store visibility is set to <strong>Published</strong>.
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Darté Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-[#374151] text-xs font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Seller Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#9CA3AF] border-t border-[#E5E7EB] bg-white">
        Darté Commerce • Nigerian Dropshipping Platform
      </footer>
    </div>
  );
}
