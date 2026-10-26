import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SupplierRegistrationView from "@/components/supplier/SupplierRegistrationView";
import { getSupplierByClerkId } from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function SupplierRegisterPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Demo fallback
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/supplier/register");
  }

  if (userId) {
    const existing = await getSupplierByClerkId(userId);
    if (existing) {
      redirect("/supplier/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden">
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2 group">
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

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B3D2E] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
          <span>Supplier Partner Portal</span>
        </div>
      </div>

      {/* Main Registration Content */}
      <main className="my-auto py-6">
        <SupplierRegistrationView />
      </main>

      {/* Footer */}
      <div className="text-center text-xs text-[#9CA3AF]">
        Darté Technologies • Nigeria&apos;s Dropshipping Infrastructure
      </div>
    </div>
  );
}
