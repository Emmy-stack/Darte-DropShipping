"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  RotateCcw,
  Clock,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { PublicStoreProfile } from "@/types/store";

interface StorefrontPoliciesModalProps {
  store: PublicStoreProfile;
  isOpen: boolean;
  onClose: () => void;
}

type PolicyTab = "shipping" | "returns" | "processing" | "support";

export default function StorefrontPoliciesModal({
  store,
  isOpen,
  onClose,
}: StorefrontPoliciesModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>("shipping");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policies-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#0B3D2E] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div>
              <h2 id="policies-modal-title" className="text-base font-bold text-[#111827]">
                {store.name} — Store Policies &amp; Info
              </h2>
              <p className="text-xs text-[#6B7280]">
                Customer fulfillment standards, delivery timelines, and returns.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#111827] hover:bg-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E7EB] px-5 bg-white overflow-x-auto gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "shipping"
                ? "bg-[#0B3D2E] text-white"
                : "text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipping &amp; Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("returns")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "returns"
                ? "bg-[#0B3D2E] text-white"
                : "text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return &amp; Refund</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("processing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "processing"
                ? "bg-[#0B3D2E] text-white"
                : "text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Order Processing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "support"
                ? "bg-[#0B3D2E] text-white"
                : "text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Customer Support</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-[#374151] leading-relaxed">
          {activeTab === "shipping" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#16A34A]" />
                <span>Shipping Guidelines &amp; Timelines</span>
              </h3>
              {store.shippingPolicy ? (
                <div className="whitespace-pre-line p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  {store.shippingPolicy}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-[#6B7280] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Standard dispatch nationwide across Nigeria within 2–5 business days.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "returns" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#16A34A]" />
                <span>Return &amp; Refund Policy</span>
              </h3>
              {store.returnPolicy ? (
                <div className="whitespace-pre-line p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  {store.returnPolicy}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-[#6B7280] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Returns accepted within 72 hours for defective or mismatched items. Contact merchant support.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "processing" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#16A34A]" />
                <span>Order Processing Information</span>
              </h3>
              {store.orderProcessingInfo ? (
                <div className="whitespace-pre-line p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  {store.orderProcessingInfo}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-[#6B7280] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Orders are confirmed within 24 hours of placement. Tracking details provided via SMS/WhatsApp.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                <span>Customer Support Instructions</span>
              </h3>
              {store.customerSupportInstructions ? (
                <div className="whitespace-pre-line p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  {store.customerSupportInstructions}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-[#6B7280] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Please direct all order questions to the contact information listed on the store header.</span>
                </div>
              )}

              {(store.contactPhone || store.contactEmail) && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1">
                  <div className="font-semibold text-emerald-950">Direct Contact Details:</div>
                  {store.contactPhone && (
                    <div className="text-emerald-800">Phone / WhatsApp: {store.contactPhone}</div>
                  )}
                  {store.contactEmail && (
                    <div className="text-emerald-800">Email: {store.contactEmail}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F3F4F6] bg-[#F8FAF9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0B3D2E] hover:bg-[#114B39] text-white transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
