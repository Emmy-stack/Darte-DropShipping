import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryCta,
  secondaryCta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-[#E5E7EB] bg-white p-8 sm:p-10 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              onClick={primaryCta.onClick}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-semibold shadow-xs shadow-[#16A34A]/20 transition-colors"
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAF9] text-[#374151] text-xs sm:text-sm font-semibold transition-colors"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
