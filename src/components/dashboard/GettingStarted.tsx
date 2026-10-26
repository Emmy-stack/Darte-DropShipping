import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Store,
  Package,
  Palette,
  Share2,
} from "lucide-react";

interface GettingStartedProps {
  hasStore?: boolean;
}

export default function GettingStarted({ hasStore = false }: GettingStartedProps) {
  const steps = [
    {
      id: "step-1",
      number: 1,
      title: "Create your store",
      description: "Define your brand name, category, and online store identity.",
      completed: hasStore,
      href: "/dashboard/store",
      cta: hasStore ? "View store" : "Create store",
      icon: Store,
    },
    {
      id: "step-2",
      number: 2,
      title: "Add your first product",
      description: "Browse thousands of supplier-backed products and add them with custom margins.",
      completed: false,
      href: "/dashboard/products/find",
      cta: "Find products",
      icon: Package,
    },
    {
      id: "step-3",
      number: 3,
      title: "Set up your storefront",
      description: "Customize your store layout, social links, and brand colors.",
      completed: false,
      href: "/dashboard/store",
      cta: "Customize",
      icon: Palette,
    },
    {
      id: "step-4",
      number: 4,
      title: "Start selling",
      description: "Share your live store link on WhatsApp, Instagram, and TikTok to receive orders.",
      completed: false,
      href: "/dashboard/store",
      cta: "Share store",
      icon: Share2,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] uppercase tracking-wider mb-1">
            <span>Launch Guide</span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Get your store ready
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Complete these steps to start selling with Darté.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#111827]">
              {completedCount} of {steps.length} completed
            </span>
            <span className="block text-[11px] text-[#6B7280]">{percentage}% ready</span>
          </div>
          <div className="w-20 bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#16A34A] h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                step.completed
                  ? "bg-[#DCFCE7]/20 border-[#86EFAC]/60"
                  : "bg-[#F8FAF9] border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      step.completed
                        ? "bg-[#16A34A] text-white"
                        : "bg-[#E5E7EB] text-[#374151]"
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>
                  {step.completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF]">
                      <Circle className="w-3.5 h-3.5" />
                      <span>Not started</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#111827]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB]/60">
                <Link
                  href={step.href}
                  className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                    step.completed
                      ? "text-[#16A34A] hover:text-[#0B3D2E]"
                      : "text-[#374151] hover:text-[#16A34A]"
                  }`}
                >
                  <span>{step.cta}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
