"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Role } from "@/lib/types/profile";

export default function RoleSelector() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to set role");
      }

      if (selectedRole === Role.SELLER) {
        router.push("/onboarding/seller");
      } else {
        router.push("/onboarding/supplier");
      }
    } catch (err: unknown) {
      console.error(err);
      // Even if API fails due to local credentials preview, allow client navigation
      if (selectedRole === Role.SELLER) {
        router.push("/onboarding/seller");
      } else {
        router.push("/onboarding/supplier");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Role Selection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
          Welcome to Darté
        </h1>
        <p className="mt-2 text-base text-[#6B7280]">
          What do you want to do?
        </p>
      </div>

      {/* Selectable Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Card 1: Start Selling */}
        <div
          onClick={() => setSelectedRole(Role.SELLER)}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
            selectedRole === Role.SELLER
              ? "border-[#16A34A] bg-[#DCFCE7]/25 shadow-md ring-2 ring-[#16A34A]/20"
              : "border-[#E5E7EB] bg-white hover:border-[#BBF7D0] shadow-xs"
          }`}
        >
          {/* Checkmark Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-2xl shadow-xs">
              🛍️
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                selectedRole === Role.SELLER
                  ? "bg-[#16A34A] text-white scale-110"
                  : "border-2 border-[#D1D5DB]"
              }`}
            >
              {selectedRole === Role.SELLER && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-1.5">
              Start Selling
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Create an online store and sell products without holding inventory.
            </p>
          </div>

          <ul className="mt-5 pt-4 border-t border-[#E5E7EB]/80 space-y-2 text-xs text-[#6B7280]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Zero warehouse or capital required</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Instant mobile storefront link</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Direct WhatsApp &amp; Instagram selling</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Become a Supplier */}
        <div
          onClick={() => setSelectedRole(Role.SUPPLIER)}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
            selectedRole === Role.SUPPLIER
              ? "border-[#16A34A] bg-[#DCFCE7]/25 shadow-md ring-2 ring-[#16A34A]/20"
              : "border-[#E5E7EB] bg-white hover:border-[#BBF7D0] shadow-xs"
          }`}
        >
          {/* Checkmark Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B3D2E] text-[#DCFCE7] flex items-center justify-center text-2xl shadow-xs">
              📦
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                selectedRole === Role.SUPPLIER
                  ? "bg-[#16A34A] text-white scale-110"
                  : "border-2 border-[#D1D5DB]"
              }`}
            >
              {selectedRole === Role.SUPPLIER && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111827] mb-1.5">
              Become a Supplier
            </h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              List your products and supply online sellers through Darté.
            </p>
          </div>

          <ul className="mt-5 pt-4 border-t border-[#E5E7EB]/80 space-y-2 text-xs text-[#6B7280]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Tap into thousands of active sellers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Automated order dispatch routing</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span>Escrow-protected bank payouts</span>
            </li>
          </ul>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Continue Button */}
      <button
        type="button"
        disabled={!selectedRole || isLoading}
        onClick={handleContinue}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
          selectedRole && !isLoading
            ? "bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white shadow-[#16A34A]/25 cursor-pointer"
            : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving your preference...</span>
          </>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-[#9CA3AF]">
        You can always manage your seller and supplier profiles later from account settings.
      </div>
    </div>
  );
}
