"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Lock,
  ShoppingBag,
  AlertCircle,
  Truck,
  Check,
  Loader2,
} from "lucide-react";
import { PublicStoreProfile } from "@/types/store";
import { useStoreCart } from "@/context/StoreCartContext";
import { formatNaira } from "@/lib/utils/formatCurrency";

interface StorefrontCheckoutViewProps {
  store: PublicStoreProfile;
}

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function StorefrontCheckoutView({
  store,
}: StorefrontCheckoutViewProps) {
  const { items, subtotal, isLoaded } = useStoreCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: store.state || "Lagos",
    instructions: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      errors.email = "Please enter a valid email address for receipt delivery.";
    }

    const cleanPhone = form.phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = "Please enter a valid contact phone number for delivery dispatch.";
    }

    if (!form.address.trim() || form.address.trim().length < 5) {
      errors.address = "Please enter your detailed street delivery address.";
    }

    if (!form.city.trim() || form.city.trim().length < 2) {
      errors.city = "Please specify your city or town.";
    }

    if (!form.state) {
      errors.state = "Please select your state.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (items.length === 0) {
      setServerError("Your shopping cart is empty. Please add items before checking out.");
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        storeSlug: store.slug,
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          instructions: form.instructions.trim() || undefined,
        },
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      };

      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.authorizationUrl) {
        setServerError(
          data.error || "Unable to initialize Paystack checkout. Please try again."
        );
        setSubmitting(false);
        return;
      }

      // Redirect directly to Paystack hosted payment page
      window.location.href = data.authorizationUrl;
    } catch (err: unknown) {
      console.error("Checkout submission error:", err);
      const message = err instanceof Error ? err.message : "Network error during checkout initialization.";
      setServerError(message);
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-[#0B3D2E] font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-[#16A34A]" />
          <span>Loading checkout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827] flex flex-col">
      {/* Checkout Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href={`/shop/${store.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B3D2E] hover:text-[#16A34A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {store.name}</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#0B3D2E] font-medium">
            <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Page Title & Store Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] block">
              Secure Direct Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
              Complete Your Order
            </h1>
          </div>

          <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-[#E5E7EB] shadow-2xs self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span className="text-xs font-bold text-[#111827]">
              Merchant: {store.name}
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Checkout Error</span>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer & Delivery Details Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#16A34A]" />
                <span>Delivery &amp; Customer Information</span>
              </h2>
              <p className="text-xs text-[#6B7280]">
                Enter where your items should be dispatched across Nigeria.
              </p>
            </div>

            <form onSubmit={handlePayNow} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chukwuma Adebayo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.name
                      ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                      : "border-[#D1D5DB] focus:ring-[#16A34A]"
                  }`}
                />
                {fieldErrors.name && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email
                        ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                        : "border-[#D1D5DB] focus:ring-[#16A34A]"
                    }`}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] text-rose-600 mt-1 block">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.phone
                        ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                        : "border-[#D1D5DB] focus:ring-[#16A34A]"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-rose-600 mt-1 block">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Street Address */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House number, street name, apartment or landmark"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.address
                      ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                      : "border-[#D1D5DB] focus:ring-[#16A34A]"
                  }`}
                />
                {fieldErrors.address && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {fieldErrors.address}
                  </span>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Lekki, or Wuse II"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.city
                        ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                        : "border-[#D1D5DB] focus:ring-[#16A34A]"
                    }`}
                  />
                  {fieldErrors.city && (
                    <span className="text-[11px] text-rose-600 mt-1 block">
                      {fieldErrors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1">
                  Optional Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for the courier, e.g. call before delivery"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all"
                />
              </div>

              {/* Pay Now Button (desktop form submit) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-[#0B3D2E] hover:bg-[#114B39] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Paystack...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 text-[#DCFCE7]" />
                      <span>Pay Now • {formatNaira(subtotal)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Item Review (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#16A34A]" />
                <span>Order Summary ({items.length})</span>
              </h2>
              <Link
                href={`/shop/${store.slug}`}
                className="text-xs font-semibold text-[#16A34A] hover:underline"
              >
                Edit Cart
              </Link>
            </div>

            {/* Itemized List */}
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                Your shopping cart is empty.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#111827] truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-[#6B7280]">
                        Qty: {item.quantity} × {formatNaira(item.price)}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#111827] shrink-0">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5 text-xs text-[#374151]">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-bold text-[#111827]">{formatNaira(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#6B7280] block">Nationwide Shipping</span>
                  <span className="text-[10px] text-[#9CA3AF]">
                    Fulfilled per {store.name} shipping policy
                  </span>
                </div>
                <span className="font-semibold text-[#16A34A]">Included / Standard</span>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-baseline justify-between text-sm">
                <span className="font-extrabold text-[#111827]">Total Payable</span>
                <div className="text-right">
                  <span className="text-xl font-black text-[#0B3D2E] block">
                    {formatNaira(subtotal)}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">
                    All amounts in Nigerian Naira (₦)
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-4 rounded-2xl bg-[#DCFCE7]/40 border border-[#16A34A]/20 space-y-2 text-xs text-[#0B3D2E]">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Darté Buyer Protection</span>
              </div>
              <ul className="text-[11px] text-[#374151] space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Real-time payment authorization via Paystack hosted checkout</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Instant order reference generated and confirmed</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Doorstep delivery coordination directly with {store.name}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="font-medium text-[#111827]">
            {store.name} • Official Darté Storefront Checkout
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Paystack processes all card and bank transfers under PCI-DSS Level 1 compliance.
          </p>
        </div>
      </footer>
    </div>
  );
}
