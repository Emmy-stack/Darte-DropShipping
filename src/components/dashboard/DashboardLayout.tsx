"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { StoreProductsProvider } from "@/context/StoreProductsContext";
import AddToStoreToast from "@/components/products/AddToStoreToast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  storeName?: string;
  storeSlug?: string;
}

export default function DashboardLayout({
  children,
  pageTitle,
  storeName,
  storeSlug,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <StoreProductsProvider>
      <div className="min-h-screen bg-[#F8FAF9] flex">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
          <Sidebar storeSlug={storeSlug} />
        </div>

        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
              <Sidebar
                isMobile
                onClose={() => setMobileMenuOpen(false)}
                storeSlug={storeSlug}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Topbar
            pageTitle={pageTitle}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            storeName={storeName}
            storeSlug={storeSlug}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>

        <AddToStoreToast />
      </div>
    </StoreProductsProvider>
  );
}
