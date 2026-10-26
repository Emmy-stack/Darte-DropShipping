import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  ctaText: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isPrimary?: boolean;
}

export default function QuickActionCard({
  title,
  description,
  ctaText,
  href,
  icon: Icon,
  badge,
  isPrimary = false,
}: QuickActionCardProps) {
  return (
    <div
      className={`group relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        isPrimary
          ? "bg-[#0B3D2E] text-white border-[#0B3D2E] shadow-sm shadow-[#0B3D2E]/20"
          : "bg-white text-[#111827] border-[#E5E7EB] hover:border-[#D1D5DB] shadow-xs hover:shadow-sm"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isPrimary
                ? "bg-white/15 text-[#DCFCE7]"
                : "bg-[#DCFCE7] text-[#16A34A]"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPrimary
                  ? "bg-white/20 text-[#DCFCE7]"
                  : "bg-[#DCFCE7] text-[#0B3D2E]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        <h3
          className={`text-base font-bold tracking-tight font-[family-name:var(--font-heading)] ${
            isPrimary ? "text-white" : "text-[#111827]"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-xs mt-1 leading-relaxed ${
            isPrimary ? "text-[#DCFCE7]/80" : "text-[#6B7280]"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-dashed border-[#E5E7EB]/50 group-hover:border-[#E5E7EB]">
        <Link
          href={href}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
            isPrimary
              ? "text-white hover:text-[#DCFCE7]"
              : "text-[#16A34A] hover:text-[#0B3D2E]"
          }`}
        >
          <span>{ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
