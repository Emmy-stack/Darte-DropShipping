import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowLeft, Clock } from "lucide-react";

interface ComingSoonPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

export default function ComingSoonPlaceholder({
  title,
  description,
  icon: Icon,
  features = [],
}: ComingSoonPlaceholderProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-12 shadow-xs text-center max-w-3xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mx-auto mb-5 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E] text-xs font-bold mb-3">
        <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
        <span>Coming soon</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
        {title}
      </h2>

      <p className="text-sm text-[#6B7280] max-w-lg mx-auto mt-2 leading-relaxed">
        {description}
      </p>

      {features.length > 0 && (
        <div className="mt-8 text-left bg-[#F8FAF9] rounded-xl p-5 border border-[#E5E7EB] max-w-md mx-auto">
          <span className="text-xs font-bold text-[#111827] block mb-3 uppercase tracking-wider">
            What to expect here:
          </span>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li
                key={idx}
                className="text-xs text-[#4B5563] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#165641] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
      </div>
    </div>
  );
}
