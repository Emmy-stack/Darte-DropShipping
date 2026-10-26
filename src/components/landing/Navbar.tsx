"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Products", href: "/#products" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Sellers", href: "/#sellers" },
    { label: "For Suppliers", href: "/#suppliers" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8FAF9]/85 backdrop-blur-md border-b border-[#E5E7EB]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0B3D2E] flex items-center justify-center text-white shadow-sm shadow-[#0B3D2E]/20 group-hover:scale-105 transition-transform duration-200">
              <svg
                width="20"
                height="20"
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-[#4B5563] hover:text-[#111827] hover:bg-black/[0.03] rounded-lg transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Actions: Show signed-in vs signed-out */}
          <div className="hidden md:flex items-center space-x-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white text-sm font-semibold tracking-wide shadow-sm shadow-[#16A34A]/25 transition-all duration-150 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#0B3D2E] bg-[#DCFCE7] hover:bg-[#BBF7D0] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#16A34A]" />
                <span>Dashboard</span>
              </Link>
              <div className="pl-1">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9 border border-[#E5E7EB]",
                    },
                  }}
                />
              </div>
            </Show>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-[#E5E7EB]",
                  },
                }}
              />
            </Show>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-black/5 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E7EB] bg-[#F8FAF9] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-[#374151] hover:bg-black/5 hover:text-[#111827] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col gap-2.5">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-[#374151] hover:text-[#111827]"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#16A34A] text-white text-sm font-semibold shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0B3D2E] text-white text-sm font-semibold shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-[#DCFCE7]" />
                <span>Go to Dashboard</span>
              </Link>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}
