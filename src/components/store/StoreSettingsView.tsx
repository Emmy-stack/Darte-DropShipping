"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  Banknote,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  StoreProfileData,
  StoreProfileInput,
  ProfileCompleteness,
} from "@/types/store";

const POLICY_TEMPLATES = {
  shipping: `🚚 Shipping & Delivery Guidelines
• Lagos Deliveries: Dispatched within 24–48 hours via trusted local courier services (₦2,000–₦3,500 depending on location).
• Interstate Deliveries: Delivered within 3–5 business days to Abuja, Port Harcourt, Ibadan, Kano, and nationwide cities.
• Tracking & Updates: Tracking information and courier dispatch details are sent via SMS & WhatsApp immediately upon dispatch.`,

  returns: `🔄 Return & Refund Policy
• 72-Hour Inspection Window: Customers can report damaged, defective, or incorrect items within 72 hours of delivery.
• Eligibility: Items must be unused, in original packaging, and with all accessories and seals intact.
• Resolution: Replacement or full refund issued promptly once the returned item is verified at our logistics hub.`,

  orderProcessing: `📦 Order Processing Information
• Operating Hours: Orders are processed Monday through Saturday between 8:00 AM and 6:00 PM (WAT).
• Verification: Orders placed before 2:00 PM are verified and dispatched the same day.
• Security: All transactions are protected by escrow; payment is confirmed prior to dispatch.`,

  support: `💬 Customer Support Instructions
• WhatsApp Support: Direct chat available Monday–Saturday, 9:00 AM – 7:00 PM.
• Email Enquiries: Support responses provided within 24 business hours.
• Escalations: For urgent delivery inquiries, please reference your Darté order number.`,
};

export default function StoreSettingsView() {
  const [activeTab, setActiveTab] = useState<
    "store_info" | "policies" | "currency" | "visibility"
  >("store_info");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const [savedProfile, setSavedProfile] = useState<StoreProfileData | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);

  const [formData, setFormData] = useState<StoreProfileInput>({
    name: "",
    slug: "",
    description: "",
    logoUrl: null,
    category: "",
    contactEmail: "",
    contactPhone: "",
    country: "Nigeria",
    state: "",
    city: "",
    shippingPolicy: "",
    returnPolicy: "",
    orderProcessingInfo: "",
    customerSupportInstructions: "",
    isPublished: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/seller/store");
        if (!res.ok) throw new Error("Failed to load store settings");
        const data = await res.json();
        if (isMounted && data.success && data.profile) {
          setSavedProfile(data.profile);
          setCompleteness(data.completeness);
          setFormData({
            name: data.profile.name || "",
            slug: data.profile.slug || "",
            description: data.profile.description || "",
            logoUrl: data.profile.logoUrl || null,
            category: data.profile.category || "Electronics",
            contactEmail: data.profile.contactEmail || "",
            contactPhone: data.profile.contactPhone || "",
            country: data.profile.country || "Nigeria",
            state: data.profile.state || "",
            city: data.profile.city || "",
            shippingPolicy: data.profile.shippingPolicy || "",
            returnPolicy: data.profile.returnPolicy || "",
            orderProcessingInfo: data.profile.orderProcessingInfo || "",
            customerSupportInstructions: data.profile.customerSupportInstructions || "",
            isPublished: data.profile.isPublished ?? true,
          });
        }
      } catch (err) {
        console.error("Error loading store settings:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const isDirty = Boolean(
    savedProfile && (
      formData.shippingPolicy !== (savedProfile.shippingPolicy || "") ||
      formData.returnPolicy !== (savedProfile.returnPolicy || "") ||
      formData.orderProcessingInfo !== (savedProfile.orderProcessingInfo || "") ||
      formData.customerSupportInstructions !== (savedProfile.customerSupportInstructions || "") ||
      formData.name !== (savedProfile.name || "") ||
      formData.description !== (savedProfile.description || "") ||
      formData.contactEmail !== (savedProfile.contactEmail || "") ||
      formData.contactPhone !== (savedProfile.contactPhone || "") ||
      formData.isPublished !== (savedProfile.isPublished ?? true)
    )
  );

  const handleApplyTemplate = (
    field: "shippingPolicy" | "returnPolicy" | "orderProcessingInfo" | "customerSupportInstructions",
    templateKey: keyof typeof POLICY_TEMPLATES
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: POLICY_TEMPLATES[templateKey],
    }));
  };

  /**
   * Safely toggle store visibility without modifying or losing any other store settings.
   */
  const handleToggleVisibility = async (newVisibility: boolean) => {
    // Optimistically update the UI toggle state
    setFormData((prev) => ({ ...prev, isPublished: newVisibility }));
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/seller/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newVisibility }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update store visibility");
      }

      // Synchronize with authoritative server profile
      setSavedProfile(data.profile);
      if (data.completeness) setCompleteness(data.completeness);
      // Synchronize form visibility with the authoritative server profile without touching any other fields
      setFormData((prev) => ({
        ...prev,
        isPublished: data.profile.isPublished ?? newVisibility,
      }));
      setFeedback({
        type: "success",
        message: newVisibility
          ? "Storefront is now live and publicly accessible."
          : "Storefront is now private (draft mode). Visitors will see a 404 page.",
      });
    } catch (err: unknown) {
      // Revert to saved state if request failed
      const msg = err instanceof Error ? err.message : "Failed to update store visibility";
      setFormData((prev) => ({
        ...prev,
        isPublished: savedProfile ? savedProfile.isPublished : !newVisibility,
      }));
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSavedProfile(data.profile);
      if (data.completeness) setCompleteness(data.completeness);
      // Synchronize form with the authoritative server profile without losing values
      setFormData((prev) => ({
        ...prev,
        name: data.profile.name || prev.name,
        slug: data.profile.slug || prev.slug,
        description: data.profile.description ?? prev.description,
        logoUrl: data.profile.logoUrl ?? prev.logoUrl,
        category: data.profile.category ?? prev.category,
        contactEmail: data.profile.contactEmail ?? prev.contactEmail,
        contactPhone: data.profile.contactPhone ?? prev.contactPhone,
        country: data.profile.country ?? prev.country,
        state: data.profile.state ?? prev.state,
        city: data.profile.city ?? prev.city,
        shippingPolicy: data.profile.shippingPolicy ?? prev.shippingPolicy,
        returnPolicy: data.profile.returnPolicy ?? prev.returnPolicy,
        orderProcessingInfo: data.profile.orderProcessingInfo ?? prev.orderProcessingInfo,
        customerSupportInstructions: data.profile.customerSupportInstructions ?? prev.customerSupportInstructions,
        isPublished: data.profile.isPublished ?? prev.isPublished,
      }));
      setFeedback({
        type: "success",
        message: "Store settings and customer policies successfully saved to PostgreSQL.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update settings";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#6B7280]">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Store Settings
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Configure customer delivery policies, order terms, Nigerian Naira pricing, and storefront readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/store"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAF9] transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Edit Store Profile</span>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Horizontal Settings Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("store_info")}
          className={`px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "store_info"
              ? "bg-[#DCFCE7] text-[#0B3D2E]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>General &amp; Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("policies")}
          className={`px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "policies"
              ? "bg-[#DCFCE7] text-[#0B3D2E]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Customer Policies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("currency")}
          className={`px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "currency"
              ? "bg-[#DCFCE7] text-[#0B3D2E]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Currency &amp; Pricing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visibility")}
          className={`px-4 py-2.5 font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "visibility"
              ? "bg-[#DCFCE7] text-[#0B3D2E]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Storefront Visibility</span>
        </button>
      </div>

      {/* Tab 1: General & Contact Information */}
      {activeTab === "store_info" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Store Summary</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Core identity registered for your seller account.
                </p>
              </div>

              <Link
                href="/dashboard/store"
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline inline-flex items-center gap-1"
              >
                <span>Edit Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                <span className="text-[#6B7280] font-medium">Storefront Name</span>
                <div className="text-sm font-bold text-[#111827]">{formData.name || "Not set"}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                <span className="text-[#6B7280] font-medium">Storefront URL</span>
                <div className="text-sm font-mono font-bold text-[#0B3D2E]">
                  darte.shop/{formData.slug || "not-set"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                <span className="text-[#6B7280] font-medium">Business Category</span>
                <div className="text-sm font-bold text-[#111827]">{formData.category || "General"}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-1">
                <span className="text-[#6B7280] font-medium">Readiness Status</span>
                <div className="text-sm font-bold text-[#16A34A]">
                  {completeness?.status === "complete" ? "100% Complete" : `${completeness?.percentage || 0}% Configured`}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Support Contact */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="border-b border-[#F3F4F6] pb-3">
              <h2 className="text-base font-bold text-[#111827]">Customer Contact Details</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                These contact details are displayed to buyers on your order receipts and invoices, separate from your private Clerk account credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#374151]">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                  placeholder="support@yourbrand.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#374151]">
                  WhatsApp Support Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                  }
                  placeholder="+234 801 234 5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={isSaving || !isDirty}
                onClick={() => handleSave()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white disabled:opacity-50 transition-colors shadow-2xs"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Contact Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customer-Facing Policies */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-3 text-xs text-[#0B3D2E]">
            <Sparkles className="w-4 h-4 shrink-0 text-[#16A34A] mt-0.5" />
            <div className="leading-relaxed">
              <strong>Nigerian Dropshipping Policy Templates:</strong> Clear policies significantly boost customer conversion and reduce WhatsApp support questions. Click <em>&quot;Insert Nigerian Retail Template&quot;</em> to customize proven guidelines for nationwide delivery and returns.
            </div>
          </div>

          {/* 1. Shipping Policy */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Shipping &amp; Delivery Information</h3>
                <p className="text-xs text-[#6B7280]">
                  Timeframes, courier partners, and fee structures for Lagos and interstate delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("shippingPolicy", "shipping")}
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline shrink-0"
              >
                ⚡ Insert Nigerian Shipping Template
              </button>
            </div>

            <textarea
              rows={4}
              value={formData.shippingPolicy || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, shippingPolicy: e.target.value }))}
              placeholder="Outline your delivery windows, local dispatch couriers, and tracking guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] leading-relaxed resize-y"
            />
          </div>

          {/* 2. Return & Refund Policy */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Return &amp; Refund Policy</h3>
                <p className="text-xs text-[#6B7280]">
                  Inspection window and conditions for defective or damaged goods.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("returnPolicy", "returns")}
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline shrink-0"
              >
                ⚡ Insert 72-Hour Return Template
              </button>
            </div>

            <textarea
              rows={4}
              value={formData.returnPolicy || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))}
              placeholder="Explain how buyers can report defects, eligibility, and refund timeframes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] leading-relaxed resize-y"
            />
          </div>

          {/* 3. Order Processing Information */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Order Processing Terms</h3>
                <p className="text-xs text-[#6B7280]">
                  Daily cutoff times, order verification, and dispatch hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("orderProcessingInfo", "orderProcessing")}
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline shrink-0"
              >
                ⚡ Insert Processing Template
              </button>
            </div>

            <textarea
              rows={3}
              value={formData.orderProcessingInfo || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderProcessingInfo: e.target.value }))
              }
              placeholder="State cutoff times for same-day dispatch and order verification steps..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] leading-relaxed resize-y"
            />
          </div>

          {/* 4. Customer Support Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Customer Support Instructions</h3>
                <p className="text-xs text-[#6B7280]">
                  How buyers can reach your team on WhatsApp and expected response time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate("customerSupportInstructions", "support")}
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] hover:underline shrink-0"
              >
                ⚡ Insert Support Template
              </button>
            </div>

            <textarea
              rows={3}
              value={formData.customerSupportInstructions || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customerSupportInstructions: e.target.value }))
              }
              placeholder="Guide customers on how to message your support line..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A] leading-relaxed resize-y"
            />
          </div>

          {/* Save Policies Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSaving || !isDirty}
              onClick={() => handleSave()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Customer Policies</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Currency & Pricing */}
      {activeTab === "currency" && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
          <div className="border-b border-[#F3F4F6] pb-3">
            <h2 className="text-base font-bold text-[#111827]">Currency &amp; Pricing Standards</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Financial and currency presentation rules applied to your Darté store.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] space-y-1">
              <span className="text-xs font-semibold text-[#6B7280]">Default Store Currency</span>
              <div className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span>Nigerian Naira (₦ / NGN)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B3D2E] font-semibold">
                  Standard
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                All catalog wholesale prices, custom retail prices, and profit calculations are stored in exact integer Naira.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] space-y-1">
              <span className="text-xs font-semibold text-[#6B7280]">Currency Formatting</span>
              <div className="text-lg font-mono font-bold text-[#111827]">
                ₦25,000
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1">
                Prices are formatted using Nigerian standard locale with standard comma grouping.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 space-y-1 leading-relaxed">
            <strong>Architecture Notice:</strong> Multi-currency and real-time foreign exchange conversions are scheduled for later regional West African expansion. Stage C strictly preserves your integer-Naira profit margins.
          </div>
        </div>
      )}

      {/* Tab 4: Storefront Visibility */}
      {activeTab === "visibility" && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="border-b border-[#F3F4F6] pb-3">
            <h2 className="text-base font-bold text-[#111827]">Storefront Deployment &amp; Visibility</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Control your public storefront status and customer accessibility.
            </p>
          </div>

          {/* Visibility Status Card */}
          <div className="p-5 rounded-2xl border border-[#86EFAC] bg-gradient-to-r from-[#DCFCE7]/60 to-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${formData.isPublished ? "bg-[#16A34A] animate-pulse" : "bg-gray-400"}`} />
                <span className="text-sm font-bold text-[#0B3D2E]">
                  Status: {formData.isPublished ? "Publicly Live on Web" : "Private / Draft Mode"}
                </span>
              </div>

              {formData.slug && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/shop/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <p className="text-xs text-[#166534] leading-relaxed">
              Your public storefront is hosted at{" "}
              <code className="font-mono bg-white px-2 py-0.5 rounded-md border border-[#86EFAC] font-semibold">
                /shop/{formData.slug || "your-slug"}
              </code>
              . Customers can browse your products, view seller retail prices, and read your policies without signing in.
            </p>
          </div>

          {/* Toggle Publish Control */}
          <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#111827]">Enable Public Storefront</span>
              <p className="text-[11px] text-[#6B7280]">
                When turned on, your store page is accessible to anyone on the web. Turn off to take your store offline for maintenance.
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleToggleVisibility(!formData.isPublished)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2 disabled:opacity-50 ${
                formData.isPublished ? "bg-[#16A34A]" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={formData.isPublished}
              title={formData.isPublished ? "Click to make store private (draft mode)" : "Click to publish store"}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.isPublished ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSaving || !isDirty}
              onClick={() => handleSave()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Visibility Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
