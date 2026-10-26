"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store as StoreIcon,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface StorePreviewProps {
  storeName?: string;
  storeSlug?: string;
  category?: string;
  hasStore?: boolean;
}

export default function StorePreview({
  storeName,
  storeSlug,
  category,
  hasStore = true,
}: StorePreviewProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = storeSlug
    ? `https://darte.shop/${storeSlug}`
    : "https://darte.shop/my-store";

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!hasStore || !storeName) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
                Your Store
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Your branded digital commerce presence
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Not Created
            </span>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAF9]/50 p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-3">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
              Your storefront isn&apos;t ready yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-sm mt-1 leading-relaxed">
              Create your storefront and start building your online brand.
            </p>
            <Link
              href="/dashboard/store"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <span>Build Your Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
                Your Store
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B3D2E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {category || "E-commerce"} • {storeName}
            </p>
          </div>

          <Link
            href="/dashboard/store"
            className="text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E] flex items-center gap-1 transition-colors"
          >
            <span>Customize</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Store URL & Copy bar */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] mb-4">
          <div className="flex items-center gap-2 truncate text-xs font-mono text-[#374151]">
            <span className="text-[#16A34A]">🔗</span>
            <span className="truncate">darte.shop/{storeSlug}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-medium text-[#374151] transition-colors"
              title="Copy store link"
              aria-label="Copy store link"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#16A34A]" />
                  <span className="text-[#16A34A] font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#6B7280]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-lg hover:bg-white text-[#6B7280] hover:text-[#111827] transition-colors"
              title="Open store in new tab"
              aria-label="Open storefront in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Subtle Visual Storefront Mockup */}
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] overflow-hidden shadow-xs">
          {/* Mock Browser Header */}
          <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
              <span className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
              <span className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
            </div>
            <div className="bg-white rounded-md px-3 py-0.5 text-[10px] text-[#9CA3AF] font-mono border border-[#E5E7EB]/80 max-w-[160px] truncate">
              darte.shop/{storeSlug}
            </div>
            <div className="w-6" />
          </div>

          {/* Mock Storefront Body */}
          <div className="p-4 bg-white space-y-3">
            {/* Mock Hero Header */}
            <div className="rounded-lg bg-gradient-to-r from-[#0B3D2E] to-[#165641] p-3 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#DCFCE7]">
                  Welcome to
                </span>
                <h4 className="text-xs font-bold leading-tight truncate">
                  {storeName}
                </h4>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#DCFCE7]">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mock Product Grid Silhouettes */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] p-2 flex flex-col gap-1.5"
                >
                  <div className="w-full aspect-square rounded-md bg-[#E5E7EB]/50 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#9CA3AF]" />
                  </div>
                  <div className="h-1.5 w-3/4 rounded bg-[#E5E7EB]" />
                  <div className="h-1.5 w-1/2 rounded bg-[#DCFCE7]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
        <span className="text-xs text-[#6B7280]">
          Ready to showcase your brand?
        </span>
        <Link
          href="/dashboard/store"
          className="text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E] transition-colors"
        >
          Build Your Store →
        </Link>
      </div>
    </div>
  );
}
