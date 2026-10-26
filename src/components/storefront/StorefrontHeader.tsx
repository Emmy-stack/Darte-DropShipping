"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  Share2,
  Check,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { PublicStoreProfile } from "@/types/store";
import { useStoreCart } from "@/context/StoreCartContext";

interface StorefrontHeaderProps {
  store: PublicStoreProfile;
  onOpenPolicies?: () => void;
}

export default function StorefrontHeader({
  store,
  onOpenPolicies,
}: StorefrontHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { setIsCartOpen, totalCount } = useStoreCart();

  const locationText = [store.city, store.state, store.country].filter(Boolean).join(", ");

  const getInitials = (name: string) => {
    if (!name) return "D";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Could not copy store URL to clipboard:", err);
    }
  };

  const hasPolicies = Boolean(
    store.shippingPolicy ||
    store.returnPolicy ||
    store.orderProcessingInfo ||
    store.customerSupportInstructions
  );

  return (
    <header className="relative bg-white border-b border-[#E5E7EB] shadow-2xs">
      {/* Top Banner Branding (Hero Section) */}
      <div className="bg-gradient-to-r from-[#0B3D2E] via-[#114B39] to-[#16A34A] relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 rounded-full bg-[#22C55E]/10 blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/40 text-white text-xs font-medium backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Darté Commerce</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors shadow-2xs"
              title="View shopping cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#16A34A] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors shadow-2xs"
              title="Copy shareable store link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#DCFCE7]" />
                  <span className="text-[#DCFCE7]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Store</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Store Identity Section — Positioned cleanly below hero without negative margins */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Logo & Store Name Identity Block */}
          <div className="flex items-center sm:items-start gap-4 sm:gap-5 min-w-0">
            {/* Store Logo Avatar */}
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#E5E7EB] bg-white shadow-xs overflow-hidden flex items-center justify-center">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logoUrl}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#0B3D2E] text-[#DCFCE7] font-extrabold text-2xl sm:text-3xl flex items-center justify-center">
                  {getInitials(store.name)}
                </div>
              )}
            </div>

            {/* Store Name, Badges & Location — Completely free from hero overlap */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  {store.name}
                </h1>
                <span
                  title="Verified Darté Dropshipping Merchant"
                  className="inline-flex text-[#16A34A] shrink-0"
                >
                  <ShieldCheck className="w-5 h-5 fill-[#DCFCE7]" />
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6B7280] flex-wrap">
                {store.category && (
                  <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                    {store.category}
                  </span>
                )}
                {locationText && (
                  <span className="flex items-center gap-1 text-[#6B7280]">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    <span>{locationText}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons: Policies & Contact Info */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            {hasPolicies && onOpenPolicies && (
              <button
                type="button"
                onClick={onOpenPolicies}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-xs font-semibold text-[#374151] transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Store Policies &amp; Info</span>
              </button>
            )}

            {(store.contactPhone || store.contactEmail) && (
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280] bg-[#F8FAF9] px-3 py-2 rounded-xl border border-[#E5E7EB]">
                {store.contactPhone && (
                  <a
                    href={`tel:${store.contactPhone}`}
                    className="hover:text-[#16A34A] flex items-center gap-1"
                    title={`Call: ${store.contactPhone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="hidden md:inline">{store.contactPhone}</span>
                  </a>
                )}
                {store.contactPhone && store.contactEmail && (
                  <span className="text-[#D1D5DB]">•</span>
                )}
                {store.contactEmail && (
                  <a
                    href={`mailto:${store.contactEmail}`}
                    className="hover:text-[#16A34A] flex items-center gap-1"
                    title={`Email: ${store.contactEmail}`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="hidden md:inline">{store.contactEmail}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Store Bio / Description */}
        {store.description && (
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-3xl leading-relaxed mt-4">
            {store.description}
          </p>
        )}

        {/* Verified Merchant Trust Strip */}
        <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#0B3D2E] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Curated Catalogue ({store.productCount} product{store.productCount === 1 ? "" : "s"})</span>
            </span>
            <span className="hidden sm:inline text-[#D1D5DB]">•</span>
            <span className="hidden sm:inline text-[#6B7280]">
              All retail prices guaranteed in Nigerian Naira (₦)
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#9CA3AF]">
            darte.shop/{store.slug}
          </span>
        </div>
      </div>
    </header>
  );
}
