"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";

interface StorefrontPreviewCardProps {
  name: string;
  slug: string;
  savedSlug?: string;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  isPublished?: boolean;
  missingFields?: string[];
}

export default function StorefrontPreviewCard({
  name,
  slug,
  savedSlug,
  description,
  category,
  city,
  state,
  country,
  logoUrl,
  isPublished = true,
  missingFields = [],
}: StorefrontPreviewCardProps) {
  const [copied, setCopied] = useState(false);

  // Canonical shareable slug is the saved slug in database, falling back to current input slug
  const activeSlug = savedSlug || slug;
  const displaySlug = activeSlug || "your-store";
  const displayName = name || "Your Brand Store";
  const locationText = [city, state, country || "Nigeria 🇳🇬"].filter(Boolean).join(", ");

  const relativeStoreUrl = `/shop/${displaySlug}`;

  const getInitials = (n: string) => {
    if (!n) return "D";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const handleCopyLink = async () => {
    if (!savedSlug) return;
    try {
      if (typeof window !== "undefined") {
        const fullUrl = `${window.location.origin}/shop/${savedSlug}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Failed to copy link:", err);
    }
  };

  const isEligible = Boolean(savedSlug && name && name.trim().length >= 2 && isPublished);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
      {/* Header Banner Mockup */}
      <div className="h-24 bg-gradient-to-r from-[#0B3D2E] via-[#165641] to-[#16A34A] relative px-5 py-3 flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/20">
          <Sparkles className="w-3 h-3 text-[#DCFCE7]" />
          <span>Public Storefront Preview</span>
        </span>

        <span className="text-[11px] text-[#DCFCE7] font-mono opacity-90">
          /shop/{displaySlug}
        </span>
      </div>

      {/* Profile Body */}
      <div className="px-5 pb-5 -mt-8 relative">
        <div className="flex items-end justify-between gap-3 mb-3">
          {/* Brand Logo Avatar */}
          <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden bg-[#0B3D2E] text-[#DCFCE7] font-bold text-xl flex items-center justify-center shadow-sm shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>

          {/* Category Tag */}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
            {category || "Retail Store"}
          </span>
        </div>

        {/* Store Title & Badges */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-extrabold text-[#111827] leading-tight">
              {displayName}
            </h3>
            <span
              title="Verified Darté Seller"
              className="inline-flex text-[#16A34A]"
            >
              <ShieldCheck className="w-4 h-4 fill-[#DCFCE7]" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            <span>{locationText || "Nigeria 🇳🇬"}</span>
          </div>
        </div>

        {/* Description Bio */}
        <p className="text-xs text-[#4B5563] mt-2.5 line-clamp-2 leading-relaxed">
          {description ||
            "Discover curated quality products with swift nationwide delivery across Nigeria and secure payment guarantee."}
        </p>

        {/* Status notice if not saved or missing requirements */}
        {!isEligible && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              {!savedSlug ? (
                <span>Save your store profile to activate your live public link.</span>
              ) : !isPublished ? (
                <span>Storefront is currently set to Private in Store Settings.</span>
              ) : (
                <span>Complete your required store identity fields to enable public browsing.</span>
              )}
              {missingFields.length > 0 && (
                <div className="mt-1 text-amber-800">
                  Pending: {missingFields.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Functional Actions Row */}
        <div className="mt-4 pt-3.5 border-t border-[#F3F4F6] flex flex-wrap items-center justify-between gap-2">
          {isEligible ? (
            <>
              <Link
                href={relativeStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live Store</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </Link>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-[#16A34A]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Copy Store Link</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-[11px] text-[#9CA3AF] italic">
              Live link will activate once profile is saved and published.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
