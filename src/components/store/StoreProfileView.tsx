"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  Sparkles,
  Settings,
  ExternalLink,
} from "lucide-react";
import StoreLogoUpload from "./StoreLogoUpload";
import StoreCompletenessBar from "./StoreCompletenessBar";
import StorefrontPreviewCard from "./StorefrontPreviewCard";
import {
  StoreProfileData,
  StoreProfileInput,
  ProfileCompleteness,
  normalizeSlug,
} from "@/types/store";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Anambra",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Nasarawa",
  "Niger",
  "Ondo",
  "Osun",
  "Plateau",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty",
  "Home & Living",
  "Health & Wellness",
  "Sports",
  "Accessories",
  "Groceries & Food",
  "Phones & Tablets",
  "Other",
];

export default function StoreProfileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Saved baseline state for dirty check
  const [savedData, setSavedData] = useState<StoreProfileData | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness>({
    status: "not_configured",
    percentage: 0,
    completedFields: [],
    missingFields: [],
  });

  // Working form state
  const [formData, setFormData] = useState<StoreProfileInput & { name: string; slug: string }>({
    name: "",
    slug: "",
    description: "",
    category: "Electronics",
    logoUrl: null,
    contactEmail: "",
    contactPhone: "",
    country: "Nigeria 🇳🇬",
    state: "Lagos",
    city: "Ikeja",
  });

  // Slug availability check state
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    error?: string;
  }>({ checking: false });

  // 1. Fetch initial profile on mount
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/seller/store");
        if (!res.ok) {
          throw new Error("Failed to load store profile");
        }
        const data = await res.json();
        if (isMounted && data.success) {
          if (data.profile) {
            setSavedData(data.profile);
            setFormData({
              name: data.profile.name || "",
              slug: data.profile.slug || "",
              description: data.profile.description || "",
              category: data.profile.category || "Electronics",
              logoUrl: data.profile.logoUrl || null,
              contactEmail: data.profile.contactEmail || "",
              contactPhone: data.profile.contactPhone || "",
              country: data.profile.country || "Nigeria 🇳🇬",
              state: data.profile.state || "Lagos",
              city: data.profile.city || "Ikeja",
            });
          }
          if (data.completeness) {
            setCompleteness(data.completeness);
          }
        }
      } catch (err) {
        console.error("Error loading store profile:", err);
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "Could not load store profile. Please check your network connection.",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Debounced Slug Availability Check
  const checkSlugAvailability = useCallback(
    async (slugToCheck: string) => {
      if (!slugToCheck || slugToCheck.length < 3) {
        setSlugStatus({ checking: false });
        return;
      }

      setSlugStatus({ checking: true });
      try {
        const res = await fetch(
          `/api/seller/store/check-slug?slug=${encodeURIComponent(slugToCheck)}`
        );
        const data = await res.json();
        if (data.success) {
          setSlugStatus({
            checking: false,
            available: data.available,
            error: data.reason,
          });
        } else {
          setSlugStatus({
            checking: false,
            available: false,
            error: data.error,
          });
        }
      } catch {
        setSlugStatus({ checking: false });
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug && formData.slug !== savedData?.slug) {
        checkSlugAvailability(formData.slug);
      } else {
        setSlugStatus({ checking: false, available: true });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.slug, savedData?.slug, checkSlugAvailability]);

  // Dirty state tracking
  const isDirty =
    Boolean(savedData && (
      formData.name !== (savedData.name || "") ||
      formData.slug !== (savedData.slug || "") ||
      formData.description !== (savedData.description || "") ||
      formData.category !== (savedData.category || "Electronics") ||
      formData.logoUrl !== (savedData.logoUrl || null) ||
      formData.contactEmail !== (savedData.contactEmail || "") ||
      formData.contactPhone !== (savedData.contactPhone || "") ||
      formData.state !== (savedData.state || "Lagos") ||
      formData.city !== (savedData.city || "Ikeja")
    )) || (!savedData && formData.name.trim().length > 0);

  // Handle auto-slug sync when editing name for the first time
  const handleNameChange = (newName: string) => {
    setFormData((prev) => {
      // Auto-update slug if user hasn't customized slug yet
      if (!savedData?.slug || prev.slug === normalizeSlug(prev.name)) {
        return {
          ...prev,
          name: newName,
          slug: normalizeSlug(newName),
        };
      }
      return { ...prev, name: newName };
    });
  };

  const handleSlugChange = (rawSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      slug: normalizeSlug(rawSlug),
    }));
  };

  const handleReset = () => {
    if (savedData) {
      setFormData({
        name: savedData.name || "",
        slug: savedData.slug || "",
        description: savedData.description || "",
        category: savedData.category || "Electronics",
        logoUrl: savedData.logoUrl || null,
        contactEmail: savedData.contactEmail || "",
        contactPhone: savedData.contactPhone || "",
        country: savedData.country || "Nigeria 🇳🇬",
        state: savedData.state || "Lagos",
        city: savedData.city || "Ikeja",
      });
      setFeedback(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.name.trim()) {
      setFeedback({ type: "error", message: "Store name is required." });
      return;
    }

    if (!formData.slug.trim()) {
      setFeedback({ type: "error", message: "Store slug is required." });
      return;
    }

    if (slugStatus.available === false) {
      setFeedback({
        type: "error",
        message: slugStatus.error || "Please choose an available store slug.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save store profile");
      }

      setSavedData(data.profile);
      if (data.completeness) {
        setCompleteness(data.completeness);
      }
      setFeedback({
        type: "success",
        message: "Store profile successfully saved and updated in PostgreSQL.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#6B7280]">Loading your store profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>Store Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Store Profile
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure your brand identity, storefront URL, and customer-facing contact details.
          </p>
        </div>

        {/* Action Link to Store Settings */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/store/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAF9] hover:border-[#D1D5DB] transition-all shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Store Settings &amp; Policies</span>
          </Link>
        </div>
      </div>

      {/* Profile Readiness Bar */}
      <StoreCompletenessBar completeness={completeness} />

      {/* Live Storefront Access Banner (Stage D) */}
      {savedData?.slug && (
        <div
          className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs border ${
            savedData.isPublished
              ? "bg-gradient-to-r from-[#DCFCE7]/70 via-[#F0FDF4] to-white border-[#86EFAC]"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                savedData.isPublished ? "bg-[#0B3D2E]" : "bg-gray-600"
              }`}
            >
              <Store className="w-5 h-5 text-[#DCFCE7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    savedData.isPublished ? "text-[#0B3D2E]" : "text-gray-700"
                  }`}
                >
                  {savedData.isPublished
                    ? "Your Public Storefront is Live"
                    : "Your Storefront is in Draft / Private Mode"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                    savedData.isPublished ? "bg-[#16A34A]" : "bg-gray-500"
                  }`}
                >
                  {savedData.isPublished ? "Active" : "Private"}
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 font-mono ${
                  savedData.isPublished ? "text-[#166534]" : "text-gray-500"
                }`}
              >
                /shop/{savedData.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {savedData.isPublished ? (
              <Link
                href={`/shop/${savedData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Visit Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/store/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Manage Visibility</span>
                <Settings className="w-3.5 h-3.5 text-gray-500" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Status Feedback Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] text-[#0B3D2E] border border-[#BBF7D0]"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-current opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Store Identity */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="border-b border-[#F3F4F6] pb-3">
              <h2 className="text-base font-bold text-[#111827]">Store Identity</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                How your dropshipping brand presents to customers across Nigeria.
              </p>
            </div>

            {/* Logo / Brand Avatar */}
            <StoreLogoUpload
              storeName={formData.name || "Darté Store"}
              logoUrl={formData.logoUrl}
              onChange={(newLogo) => setFormData((prev) => ({ ...prev, logoUrl: newLogo }))}
              onLogoPersisted={(newLogo) => {
                setFormData((prev) => ({ ...prev, logoUrl: newLogo }));
                setSavedData((prev) => (prev ? { ...prev, logoUrl: newLogo } : null));
              }}
              disabled={isSaving}
            />

            {/* Store Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="store-name" className="block text-xs font-semibold text-[#374151]">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="store-name"
                type="text"
                required
                disabled={isSaving}
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Emmy Gadgets & Accessories"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Store Slug Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="store-slug" className="block text-xs font-semibold text-[#374151]">
                  Store Slug (URL Identifier) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#6B7280]">Lowercase, numbers, and hyphens</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-mono text-[#9CA3AF]">
                  darte.shop/
                </div>
                <input
                  id="store-slug"
                  type="text"
                  required
                  disabled={isSaving}
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="emmy-gadgets"
                  className="w-full pl-23 pr-9 py-2.5 rounded-xl border border-[#D1D5DB] text-sm font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {slugStatus.checking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#9CA3AF]" />
                  ) : slugStatus.available === true ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : slugStatus.available === false ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : null}
                </div>
              </div>

              {slugStatus.error && (
                <p className="text-[11px] text-rose-600 mt-1">{slugStatus.error}</p>
              )}
            </div>

            {/* Business Category */}
            <div className="space-y-1.5">
              <label htmlFor="store-category" className="block text-xs font-semibold text-[#374151]">
                Business Category
              </label>
              <select
                id="store-category"
                disabled={isSaving}
                value={formData.category || "Electronics"}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="store-desc" className="block text-xs font-semibold text-[#374151]">
                  Store Bio &amp; Description
                </label>
                <span className="text-[11px] text-[#9CA3AF]">
                  {(formData.description || "").length} / 500
                </span>
              </div>
              <textarea
                id="store-desc"
                rows={3}
                maxLength={500}
                disabled={isSaving}
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Share what makes your store unique, shipping guarantees, or return policies..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-[#9CA3AF] resize-none"
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="border-b border-[#F3F4F6] pb-3">
              <h2 className="text-base font-bold text-[#111827]">Contact &amp; Location</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Customer support communication details and business dispatch jurisdiction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Email */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#374151]">
                  Customer Support Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="contact-email"
                    type="email"
                    disabled={isSaving}
                    value={formData.contactEmail || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    placeholder="support@yourstore.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#374151]">
                  Contact Phone (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="contact-phone"
                    type="tel"
                    disabled={isSaving}
                    value={formData.contactPhone || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    placeholder="+234 801 234 5678"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Country */}
              <div className="space-y-1.5">
                <label htmlFor="country" className="block text-xs font-semibold text-[#374151]">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  disabled={isSaving}
                  value={formData.country || "Nigeria 🇳🇬"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] bg-[#F8FAF9] focus:outline-none"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label htmlFor="state" className="block text-xs font-semibold text-[#374151]">
                  State
                </label>
                <select
                  id="state"
                  disabled={isSaving}
                  value={formData.state || "Lagos"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label htmlFor="city" className="block text-xs font-semibold text-[#374151]">
                  City / Area
                </label>
                <input
                  id="city"
                  type="text"
                  disabled={isSaving}
                  value={formData.city || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Ikeja, Lekki, Yaba"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Toolbar */}
          <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E5E7EB] shadow-lg flex items-center justify-between gap-3 z-10">
            <div className="text-xs text-[#6B7280]">
              {isDirty ? (
                <span className="text-amber-700 font-medium">● You have unsaved changes</span>
              ) : (
                <span className="text-[#16A34A] font-medium">✓ All changes saved to database</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {isDirty && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  isDirty && !isSaving
                    ? "bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white shadow-[#16A34A]/25 cursor-pointer"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Store Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Mockup Card & Fast Nav (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Storefront Preview */}
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Customer Storefront
              </span>
              <span className="text-[11px] text-[#16A34A] font-medium">Live Updates</span>
            </div>

            <StorefrontPreviewCard
              name={formData.name}
              slug={formData.slug}
              savedSlug={savedData?.slug}
              description={formData.description}
              category={formData.category}
              city={formData.city}
              state={formData.state}
              country={formData.country}
              logoUrl={formData.logoUrl}
              isPublished={savedData?.isPublished ?? true}
              missingFields={completeness?.missingFields}
            />

            {/* Quick Context Card */}
            <div className="bg-[#F8FAF9] rounded-2xl p-5 border border-[#E5E7EB] text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#111827]">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                <span>Next Steps: Store Policies</span>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Add your delivery timeframes, exchange policies, and WhatsApp ordering guidelines
                to build trust with shoppers across Nigeria.
              </p>
              <Link
                href="/dashboard/store/settings"
                className="inline-flex items-center gap-1.5 font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline"
              >
                <span>Edit store policies in Store Settings</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
