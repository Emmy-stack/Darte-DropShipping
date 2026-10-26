import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RoleSelector from "@/components/onboarding/RoleSelector";
import { getUserProfile } from "@/lib/db/profileStore";
import { Role } from "@/lib/types/profile";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  let userId: string | null = null;
  let profile = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (userId) {
      profile = await getUserProfile(userId);
    }
  } catch {
    // If Clerk keys are pending or unconfigured, allow rendering for review
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  if (profile && profile.onboardingCompleted) {
    if (profile.role === Role.SUPPLIER) {
      redirect("/dashboard/supplier");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#DCFCE7]/60 via-[#16A34A]/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-[#E5E7EB]/80">
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none rounded-lg"
        >
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
        <div className="text-xs font-medium text-[#6B7280]">
          Step 1: Account Type
        </div>
      </div>

      {/* Main Content */}
      <main className="my-auto py-6">
        <RoleSelector />
      </main>

      {/* Bottom info */}
      <div className="text-center text-xs text-[#9CA3AF]">
        Darté Technologies • Modern African Dropshipping Infrastructure
      </div>
    </div>
  );
}
