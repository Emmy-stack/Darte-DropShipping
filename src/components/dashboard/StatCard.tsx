import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  supportingText: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
}

export default function StatCard({
  label,
  value,
  supportingText,
  icon: Icon,
  badge,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:shadow-sm hover:border-[#D1D5DB] transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#6B7280] tracking-wide uppercase">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
          {value}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {badge && (
            <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#0B3D2E]">
              {badge}
            </span>
          )}
          <span className="text-xs text-[#6B7280] font-medium">
            {supportingText}
          </span>
        </div>
      </div>
    </div>
  );
}
