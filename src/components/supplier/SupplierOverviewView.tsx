"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Truck,
  PlusCircle,
  AlertTriangle,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  SupplierProfileData,
  SupplierDashboardMetrics,
} from "@/types/supplier";

interface SupplierOverviewViewProps {
  supplier: SupplierProfileData;
  metrics: SupplierDashboardMetrics;
}

export default function SupplierOverviewView({
  supplier,
  metrics,
}: SupplierOverviewViewProps) {

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-[#0B3D2E] text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DCFCE7] bg-[#165641] px-2.5 py-0.5 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Supplier Partner Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-heading)]">
            Welcome, {supplier.companyName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#D1D5DB] mt-1.5 max-w-xl leading-relaxed">
            Manage your wholesale catalogue, update stock levels, and coordinate order dispatch from your warehouse at {supplier.city}, {supplier.state}.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/supplier/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            href="/supplier/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Truck className="w-4 h-4 text-[#DCFCE7]" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Total Products</span>
            <Boxes className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl font-black text-[#111827] mt-2">
            {metrics.totalProducts}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B7280]">
            <span className="text-emerald-600 font-semibold">{metrics.activeProducts} active</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{metrics.draftProducts} draft</span>
          </div>
        </div>

        {/* Pending Dispatches */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Pending Dispatches</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#111827] mt-2">
            {metrics.pendingFulfillments}
          </div>
          <span className="text-[11px] text-[#6B7280] block mt-1">
            Paid orders awaiting pack &amp; dispatch
          </span>
        </div>

        {/* In-Progress Dispatches */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Processing / In Transit</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-[#111827] mt-2">
            {metrics.inProgressFulfillments}
          </div>
          <span className="text-[11px] text-[#6B7280] block mt-1">
            {metrics.completedFulfillments} orders completed
          </span>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Stock Health</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#111827] mt-2">
            {metrics.lowStockProducts + metrics.outOfStockProducts}
          </div>
          <span className="text-[11px] text-amber-700 block mt-1">
            {metrics.lowStockProducts} low stock, {metrics.outOfStockProducts} out of stock
          </span>
        </div>
      </div>

      {/* Fulfillment Value Card (Realistic, non-misleading) */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Wholesale Value in Fulfillment
          </div>
          <div className="text-2xl font-extrabold text-[#0B3D2E] mt-1 font-[family-name:var(--font-heading)]">
            ₦{metrics.totalWholesaleInFulfillment.toLocaleString()}
          </div>
          <p className="text-xs text-[#6B7280] mt-1 max-w-lg">
            Total wholesale item value of verified paid customer orders currently awaiting or undergoing dispatch from your inventory.
          </p>
        </div>

        <Link
          href="/supplier/dashboard/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8FAF9] hover:bg-[#F1F5F3] border border-[#E5E7EB] text-xs font-semibold text-[#0B3D2E] transition-colors self-start sm:self-auto shrink-0"
        >
          <span>Fulfill Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/supplier/dashboard/products"
          className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#16A34A] shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Boxes className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0B3D2E] flex items-center justify-between">
            <span>Product Catalogue</span>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            View, edit prices, update stock, and manage your wholesale listings.
          </p>
        </Link>

        <Link
          href="/supplier/dashboard/orders"
          className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#16A34A] shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0B3D2E] flex items-center justify-between">
            <span>Orders &amp; Dispatch</span>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Check packing slips and advance fulfillment status on paid seller orders.
          </p>
        </Link>

        <Link
          href="/supplier/dashboard/profile"
          className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#16A34A] shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0B3D2E] flex items-center justify-between">
            <span>Company Profile</span>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Update warehouse address, contact numbers, and view verification status.
          </p>
        </Link>
      </div>

      {/* How It Works Explainer */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#111827]">
          Supplier Fulfillment Workflow on Darté
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
            <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h3 className="text-xs font-bold text-[#111827]">
              List Products &amp; Wholesale Cost
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Add your inventory with your fixed wholesale cost (in ₦). Sellers import items to their stores and configure their retail price.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
            <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h3 className="text-xs font-bold text-[#111827]">
              Customer Orders &amp; Paystack Payment
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Customers pay on the seller&apos;s storefront. Only confirmed, paid orders appear in your fulfillment queue with delivery details.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
            <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h3 className="text-xs font-bold text-[#111827]">
              Pack &amp; Update Fulfillment Status
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Pack items and dispatch to the customer&apos;s delivery address. Update the status to Shipped and Delivered in your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
