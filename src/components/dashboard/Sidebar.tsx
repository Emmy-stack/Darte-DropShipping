"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  ShoppingBag,
  Search,
  Package,
  ClipboardList,
  Store,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
  storeSlug?: string;
}

export default function Sidebar({
  onClose,
  isMobile = false,
  storeSlug,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [productsOpen, setProductsOpen] = useState(
    pathname?.startsWith("/dashboard/products") ?? true
  );
  const [storeOpen, setStoreOpen] = useState(
    pathname?.startsWith("/dashboard/store") ?? true
  );
  const [showHelpModal, setShowHelpModal] = useState(false);

  const isRouteActive = (route: string, exact = false) => {
    if (exact) return pathname === route;
    return pathname?.startsWith(route);
  };

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ClipboardList,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      <aside
        className={`flex flex-col h-full bg-white border-r border-[#E5E7EB] ${
          isMobile ? "w-full max-w-xs" : "w-64"
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E5E7EB]/80">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
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
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#0B3D2E] ml-1">
              Seller
            </span>
          </Link>

          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Overview */}
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              isRouteActive("/dashboard", true)
                ? "bg-[#DCFCE7] text-[#0B3D2E]"
                : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAF9]"
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 ${
                isRouteActive("/dashboard", true)
                  ? "text-[#16A34A]"
                  : "text-[#6B7280]"
              }`}
            />
            <span>Overview</span>
          </Link>

          {/* Products Group */}
          <div>
            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                pathname?.startsWith("/dashboard/products")
                  ? "text-[#0B3D2E]"
                  : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAF9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag
                  className={`w-4 h-4 ${
                    pathname?.startsWith("/dashboard/products")
                      ? "text-[#16A34A]"
                      : "text-[#6B7280]"
                  }`}
                />
                <span>Products</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${
                  productsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {productsOpen && (
              <div className="ml-5 pl-3 border-l border-[#E5E7EB] mt-1 space-y-1">
                <Link
                  href="/dashboard/products/find"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/products/find"
                      ? "bg-[#DCFCE7]/70 text-[#0B3D2E] font-semibold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Products</span>
                </Link>
                <Link
                  href="/dashboard/products"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/products"
                      ? "bg-[#DCFCE7]/70 text-[#0B3D2E] font-semibold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Products</span>
                </Link>
              </div>
            )}
          </div>

          {/* Store Management Group */}
          <div>
            <button
              type="button"
              onClick={() => setStoreOpen(!storeOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                pathname?.startsWith("/dashboard/store")
                  ? "text-[#0B3D2E]"
                  : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAF9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Store
                  className={`w-4 h-4 ${
                    pathname?.startsWith("/dashboard/store")
                      ? "text-[#16A34A]"
                      : "text-[#6B7280]"
                  }`}
                />
                <span>Store</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${
                  storeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {storeOpen && (
              <div className="ml-5 pl-3 border-l border-[#E5E7EB] mt-1 space-y-1">
                <Link
                  href="/dashboard/store"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/store"
                      ? "bg-[#DCFCE7]/70 text-[#0B3D2E] font-semibold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Store Profile</span>
                </Link>
                <Link
                  href="/dashboard/store/settings"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/dashboard/store/settings"
                      ? "bg-[#DCFCE7]/70 text-[#0B3D2E] font-semibold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9]"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Store Settings</span>
                </Link>
              </div>
            )}
          </div>

          {/* Orders, Analytics, Settings */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#DCFCE7] text-[#0B3D2E]"
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAF9]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[#16A34A]" : "text-[#6B7280]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Storefront Link Callout if available */}
        {storeSlug && (
          <div className="px-3 pb-3">
            <a
              href={`https://darte.shop/${storeSlug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] hover:bg-[#DCFCE7]/30 transition-colors text-xs text-[#374151]"
            >
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="truncate font-medium text-[11px]">
                  darte.shop/{storeSlug}
                </span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#9CA3AF] shrink-0" />
            </a>
          </div>
        )}

        {/* Sidebar Footer: Help & Clerk User Button */}
        <div className="p-3 border-t border-[#E5E7EB] space-y-2">
          {/* Help & Support Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF9] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#9CA3AF]" />
            <span>Help &amp; Support</span>
          </button>

          {/* User Profile info + Clerk UserButton */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-lg border border-[#E5E7EB]",
                  },
                }}
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-[#111827] truncate">
                  {user?.fullName || user?.firstName || "My Account"}
                </p>
                <p className="text-[10px] text-[#6B7280] truncate">
                  {user?.primaryEmailAddress?.emailAddress || "Seller"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#111827]">
                  Help &amp; Support
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Need assistance setting up your storefront or have questions about how Darté works? Our team is here to support your commerce journey.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="font-semibold text-[#111827] block">Email Support</span>
                <a
                  href="mailto:support@darte.africa"
                  className="text-[#16A34A] font-medium hover:underline"
                >
                  support@darte.africa
                </a>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="font-semibold text-[#111827] block">WhatsApp Seller Community</span>
                <span className="text-[#6B7280]">
                  Get direct updates and dropshipping tips from top Nigerian sellers.
                </span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#165641] text-white text-xs font-semibold transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
