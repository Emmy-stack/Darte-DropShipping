"use client";

import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Menu,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

interface TopbarProps {
  pageTitle: string;
  onOpenMobileMenu?: () => void;
  storeSlug?: string;
  storeName?: string;
}

export default function Topbar({
  pageTitle,
  onOpenMobileMenu,
  storeSlug,
  storeName,
}: TopbarProps) {
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left: Mobile Toggle + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Side: Storefront Link + Notifications + Clerk User Profile */}
      <div className="flex items-center gap-3">
        {/* Visit Storefront CTA if slug exists */}
        {storeSlug && (
          <a
            href={`https://darte.shop/${storeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7]/70 hover:bg-[#DCFCE7] text-[#0B3D2E] text-xs font-semibold border border-[#86EFAC]/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Visit Storefront</span>
            <ExternalLink className="w-3 h-3 text-[#16A34A]" />
          </a>
        )}

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold text-[#111827]">
                  Notifications
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-[#DCFCE7]/30 border border-[#86EFAC]/40 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#111827]">
                      Welcome to Darté!
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">
                      Your seller account has been initialized. Complete the launch checklist to start receiving customer orders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-[#E5E7EB]">
                <span className="text-[10px] text-[#9CA3AF]">
                  All updates will appear here
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User name on larger screens */}
        {user && (
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-[#111827]">
              {user.firstName || user.fullName || "Seller"}
            </span>
            <span className="text-[10px] text-[#6B7280]">
              {storeName || "Active"}
            </span>
          </div>
        )}

        {/* Clerk User Button */}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8 rounded-xl border border-[#E5E7EB]",
            },
          }}
        />
      </div>
    </header>
  );
}
