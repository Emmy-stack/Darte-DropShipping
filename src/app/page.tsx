import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductShowcase from "@/components/landing/ProductShowcase";
import SellerSection from "@/components/landing/SellerSection";
import SupplierSection from "@/components/landing/SupplierSection";
import Features from "@/components/landing/Features";
import StatementSection from "@/components/landing/StatementSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#111827]">
      {/* 1. Sticky Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Social Proof / Trust Strip */}
      <TrustStrip />

      {/* 4. How Darté Works */}
      <HowItWorks />

      {/* 5. Product Discovery Showcase */}
      <ProductShowcase />

      {/* 6. Seller Section */}
      <SellerSection />

      {/* 7. Supplier Section */}
      <SupplierSection />

      {/* 8. Features Section */}
      <Features />

      {/* 9. Big Statement Section */}
      <StatementSection />

      {/* 10. Final Call To Action */}
      <CTA />

      {/* 11. Footer */}
      <Footer />
    </main>
  );
}
