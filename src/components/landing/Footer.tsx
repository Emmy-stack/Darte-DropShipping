"use client";

import React from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    darte: [
      { name: "About", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    sellers: [
      { name: "Start Selling", href: "#sellers" },
      { name: "Product Marketplace", href: "#products" },
      { name: "Storefronts", href: "#sellers" },
      { name: "Pricing", href: "#" },
    ],
    suppliers: [
      { name: "Become a Supplier", href: "#suppliers" },
      { name: "Supplier Dashboard", href: "#suppliers" },
      { name: "Fulfillment", href: "#how-it-works" },
    ],
    resources: [
      { name: "Help Center", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Guides", href: "#" },
    ],
  };

  return (
    <footer className="bg-[#F8FAF9] border-t border-[#E5E7EB] pt-16 pb-12 text-[#4B5563]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-[#E5E7EB]">
          {/* Brand Column (Span 2 on mobile/tablet) */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2.5">
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
            </a>

            <p className="mt-4 text-sm text-[#6B7280] max-w-sm leading-relaxed">
              The modern African dropshipping and commerce platform. Discover
              products, launch your storefront, and grow your business without
              holding inventory.
            </p>

            {/* Social Icons with Clean Inline SVGs */}
            <div className="mt-6 flex items-center gap-3">
              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Darté on X"
                className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#16A34A] flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Darté on Instagram"
                className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#16A34A] flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Darté on LinkedIn"
                className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#16A34A] flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Darté on WhatsApp"
                className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#16A34A] hover:border-[#16A34A] flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Darté */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Darté
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.darte.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Sellers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Sellers
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.sellers.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Suppliers & Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Suppliers
            </h4>
            <ul className="space-y-2.5 text-sm mb-6">
              {footerLinks.suppliers.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <div>
            <p>© 2026 Darté. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#111827] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#111827] transition-colors">
              Terms of Service
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#16A34A] hover:text-[#0B3D2E] font-medium"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
