import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Users,
  Wallet,
  ShieldCheck,
  Truck,
  Upload,
  Clock,
  MapPin,
} from "lucide-react";
import { getFullUserContext } from "@/lib/db/profileStore";
import { Role } from "@/lib/types/profile";

export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
  let context = null;

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (userId) {
      context = await getFullUserContext(userId);
    }
  } catch {
    // Demo fallback context
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/dashboard/supplier");
  }

  if (userId) {
    if (!context?.profile || !context.profile.onboardingCompleted) {
      redirect("/onboarding");
    }
    if (context.profile.role === Role.SELLER) {
      redirect("/dashboard");
    }
  }

  const businessName =
    context?.supplierProfile?.businessName || "Horizon Import Ltd";
  const category =
    context?.supplierProfile?.businessCategory || "Electronics";
  const city = context?.supplierProfile?.city || "Trade Fair, Ojo";
  const state = context?.supplierProfile?.state || "Lagos";

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
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

            <div className="hidden md:flex items-center gap-1.5 text-xs">
              <span className="bg-[#0B3D2E] text-[#DCFCE7] font-bold px-2 py-0.5 rounded">
                Supplier Hub
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span className="text-[#6B7280] font-medium">{businessName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Pending</span>
            </div>

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

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Status Banner */}
        <div className="p-6 rounded-2xl bg-[#0B3D2E] text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DCFCE7] bg-[#165641] px-2.5 py-0.5 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{category} Wholesale Partner Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-heading)]">
              Welcome, {businessName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#D1D5DB] mt-1 max-w-xl">
              Your supplier profile has been submitted. Our team is verifying
              your business details and warehouse at {city}, {state}.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV Catalog</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Connected Sellers</span>
              <Users className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-2xl font-black text-[#111827] mt-2">
              0
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-1">
              Active sellers listing your products
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Pending Dispatches</span>
              <Truck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-[#111827] mt-2">
              0
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-1">
              Orders waiting for pickup
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Escrow Settlement</span>
              <Wallet className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="text-2xl font-black text-[#16A34A] mt-2">
              ₦0.00
            </div>
            <span className="text-[11px] text-[#6B7280] block mt-1">
              Direct bank account payout
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Warehouse Location</span>
              <MapPin className="w-4 h-4 text-[#0B3D2E]" />
            </div>
            <div className="text-base font-bold text-[#111827] mt-2 truncate">
              {city}, {state}
            </div>
            <span className="text-[11px] text-[#16A34A] font-semibold block mt-1">
              Nigeria 🇳🇬
            </span>
          </div>
        </div>

        {/* Supplier Next Steps */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#111827]">
            How supplier fulfillment works on Darté:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
                1
              </div>
              <h3 className="text-sm font-bold text-[#111827]">
                List Products &amp; Wholesale Price
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Upload your inventory. Sellers import items to their stores and add their retail margin.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
                2
              </div>
              <h3 className="text-sm font-bold text-[#111827]">
                Receive Automated Dispatch Labels
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                When a seller makes a sale, order details and shipping labels are sent to your dashboard.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
                3
              </div>
              <h3 className="text-sm font-bold text-[#111827]">
                Instant Escrow Bank Settlement
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Upon delivery to the customer, wholesale funds are released directly to your account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
