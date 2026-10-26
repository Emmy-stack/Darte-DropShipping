import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import EmptyState from "./EmptyState";

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Recent Orders
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor real-time customer purchases and fulfillment status
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E] flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="Your customer orders will appear here once you start selling."
        primaryCta={{
          label: "Find Products",
          href: "/dashboard/products/find",
        }}
        className="py-12 border-dashed border-[#E5E7EB] bg-[#F8FAF9]/50"
      />
    </div>
  );
}
