"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Truck,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Store,
} from "lucide-react";
import { SupplierProfileData } from "@/types/supplier";

interface SupplierDashboardShellProps {
  supplier: SupplierProfileData;
  children: ReactNode;
}

export default function SupplierDashboardShell({
  supplier,
  children,
}: SupplierDashboardShellProps) {
  const pathname = usePathname();

  const isPending = supplier.verificationStatus === "PENDING";
  const isApproved = supplier.verificationStatus === "APPROVED";
  const isSuspended = supplier.verificationStatus === "SUSPENDED" || supplier.verificationStatus === "REJECTED";

  const navItems = [
    {
      label: "Overview",
      href: "/supplier/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/supplier/dashboard",
    },
    {
      label: "My Products",
      href: "/supplier/dashboard/products",
      icon: Boxes,
      active: pathname === "/supplier/dashboard/products",
    },
    {
      label: "Add Product",
      href: "/supplier/dashboard/products/new",
      icon: PlusCircle,
      active: pathname === "/supplier/dashboard/products/new",
    },
    {
      label: "Orders & Fulfilment",
      href: "/supplier/dashboard/orders",
      icon: Truck,
      active: pathname === "/supplier/dashboard/orders",
    },
    {
      label: "Company Profile",
      href: "/supplier/dashboard/profile",
      icon: Building2,
      active: pathname === "/supplier/dashboard/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-[family-name:var(--font-sans)] text-[#111827]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/supplier/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] flex items-center justify-center text-white shadow-xs">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 4.5H12C16.1421 4.5 19.5 7.85786 19.5 12C19.5 16.1421 16.1421 19.5 12 19.5H6V4.5Z"
                    stroke="#DCFCE7"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="12" r="2.5" fill="#16A34A" />
                </svg>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold tracking-tight text-[#111827] font-[family-name:var(--font-heading)]">
                  Darté
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] ml-0.5 mb-1" />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="bg-[#0B3D2E] text-[#DCFCE7] font-bold px-2 py-0.5 rounded">
                Supplier Hub
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span className="text-[#6B7280] font-semibold">{supplier.companyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Verification Status Pill */}
            {isApproved && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Supplier</span>
              </div>
            )}
            {isPending && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Verification Pending</span>
              </div>
            )}
            {isSuspended && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>{supplier.verificationStatus}</span>
              </div>
            )}

            {/* Switch to Seller Store Link */}
            <Link
              href="/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#0B3D2E] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
              title="Go to Seller Dashboard"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller Dashboard</span>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 border border-[#E5E7EB]",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-xs space-y-1 sticky top-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-[#0B3D2E] text-white shadow-xs font-semibold"
                      : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.active ? "text-[#DCFCE7]" : "text-[#9CA3AF]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Help Box */}
          <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs text-xs text-[#6B7280] space-y-2 hidden md:block">
            <div className="font-bold text-[#111827] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Supplier Support</span>
            </div>
            <p className="leading-relaxed">
              Wholesale inquiries and fulfillment logistics:
            </p>
            <div className="font-semibold text-[#0B3D2E]">
              suppliers@darte.shop
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Verification Status Banner if Pending */}
          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">Account Verification Pending: </span>
                Your wholesale application is under review by Darté administrators. You can configure your company profile and prepare draft products. Products will become visible to sellers once your account is verified.
              </div>
            </div>
          )}

          {isSuspended && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">Account Under Review: </span>
                {supplier.adminNotes || "Your supplier account is currently restricted. Please contact Darté support for assistance."}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
