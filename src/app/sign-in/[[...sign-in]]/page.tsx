import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#DCFCE7]/60 via-[#16A34A]/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg mb-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B3D2E] flex items-center justify-center text-white shadow-sm shadow-[#0B3D2E]/20 group-hover:scale-105 transition-transform duration-200">
            <svg
              width="22"
              height="22"
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
            <span className="text-2xl font-bold tracking-tight text-[#111827] font-[family-name:var(--font-heading)]">
              Darté
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] ml-0.5 mb-1" />
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-[#0B3D2E] font-medium bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>African Dropshipping &amp; Commerce</span>
        </div>
      </div>

      {/* Clerk Sign In Card Container */}
      <div className="my-auto flex justify-center py-6">
        <div className="w-full max-w-[440px]">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="text-center text-xs text-[#6B7280]">
        <p>© 2026 Darté Technologies. All rights reserved.</p>
        <p className="mt-1 text-[#9CA3AF]">
          Secure escrow payments • Verified suppliers • Zero inventory required
        </p>
      </div>
    </div>
  );
}
