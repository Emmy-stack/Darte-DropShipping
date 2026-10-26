"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { ProfileCompleteness } from "@/types/store";

interface StoreCompletenessBarProps {
  completeness: ProfileCompleteness;
}

export default function StoreCompletenessBar({ completeness }: StoreCompletenessBarProps) {
  const { status, percentage, missingFields } = completeness;

  const getStatusBadge = () => {
    switch (status) {
      case "complete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#0B3D2E]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Profile Complete</span>
          </span>
        );
      case "incomplete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Profile Incomplete</span>
          </span>
        );
      case "not_configured":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>Not Configured</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#111827]">Store Readiness</h2>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {status === "complete"
              ? "Your store details are fully set up and ready for customer discovery."
              : "Complete your store identity and contact information to prepare your storefront."}
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold text-[#111827]">{percentage}%</span>
          <span className="text-xs text-[#6B7280] ml-1">completed</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === "complete"
              ? "bg-[#16A34A]"
              : percentage >= 50
              ? "bg-amber-500"
              : "bg-gray-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing Fields Indicator */}
      {status !== "complete" && missingFields.length > 0 && (
        <div className="pt-2 border-t border-[#F3F4F6] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6B7280] font-medium">To reach 100%, add:</span>
          {missingFields.map((field) => (
            <span
              key={field}
              className="px-2 py-0.5 bg-[#F8FAF9] border border-[#E5E7EB] rounded-md text-[11px] text-[#4B5563]"
            >
              + {field}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
