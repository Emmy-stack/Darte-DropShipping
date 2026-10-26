"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Share2,
  Check,
  ImageIcon,
  ShoppingBag,
  Plus,
  Minus,
  CreditCard,
} from "lucide-react";
import { PublicStoreProfile, PublicStoreProduct } from "@/types/store";
import { formatNaira } from "@/lib/utils/formatCurrency";
import { StoreCartProvider, useStoreCart } from "@/context/StoreCartContext";
import StorefrontCartDrawer from "./StorefrontCartDrawer";

interface PublicProductDetailViewProps {
  store: PublicStoreProfile;
  product: PublicStoreProduct;
}

export default function PublicProductDetailView({
  store,
  product,
}: PublicProductDetailViewProps) {
  return (
    <StoreCartProvider storeSlug={store.slug}>
      <PublicProductDetailContent store={store} product={product} />
    </StoreCartProvider>
  );
}

function PublicProductDetailContent({
  store,
  product,
}: PublicProductDetailViewProps) {
  const router = useRouter();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addItem, setIsCartOpen, totalCount } = useStoreCart();

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIdx] || null;

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn("Could not copy link:", err);
    }
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addItem(product, quantity);
    router.push(`/shop/${encodeURIComponent(store.slug)}/checkout`);
  };

  // WhatsApp optional support message
  const cleanPhone = (store.contactPhone || "").replace(/[^0-9]/g, "");
  const inquiryMessage = encodeURIComponent(
    `Hello ${store.name}, I have a question about "${product.name}" (${formatNaira(product.price)}) on your Darté storefront.`
  );
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${inquiryMessage}`
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827] flex flex-col">
      {/* Navigation Top Bar */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href={`/shop/${store.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B3D2E] hover:text-[#16A34A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {store.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-colors shadow-2xs"
              title="Open Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#16A34A] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/shop/${store.slug}`} className="hover:text-[#111827] font-medium">
            {store.name}
          </Link>
          <span>/</span>
          <span className="text-[#9CA3AF] capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-[#111827] font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </div>

        {/* Product Showcase: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden flex items-center justify-center relative">
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
                  <ImageIcon className="w-16 h-16 stroke-[1.2]" />
                  <span className="text-xs mt-2 font-medium">No Image Available</span>
                </div>
              )}

              {/* Stock status overlay */}
              <div className="absolute top-4 left-4">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7]/95 text-[#0B3D2E] backdrop-blur-xs border border-[#16A34A]/30 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>In Stock</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-18 h-18 rounded-2xl border-2 overflow-hidden bg-white shrink-0 transition-all ${
                      selectedImageIdx === idx
                        ? "border-[#16A34A] ring-2 ring-[#16A34A]/30 scale-102"
                        : "border-[#E5E7EB] opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Ordering CTAs, and Guarantees (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
              {/* Category & Verified Badge */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[#16A34A] bg-[#DCFCE7]/60 px-3 py-1 rounded-full border border-[#16A34A]/20">
                  {product.category}
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-[#0B3D2E] font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Sold by {store.name}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] leading-tight">
                {product.name}
              </h1>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                    Retail Price
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#111827]">
                    {formatNaira(product.price)}
                  </span>
                </div>
                <span className="text-xs text-[#16A34A] font-semibold bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                  Nigerian Naira (₦)
                </span>
              </div>

              {/* Short Summary */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Native Checkout & Add-To-Cart Section (Replaces WhatsApp as primary checkout) */}
              <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-4">
                {product.inStock ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-[#374151]">Quantity</span>
                      <div className="inline-flex items-center border border-[#D1D5DB] rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1.5 hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#111827] min-w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="px-3 py-1.5 hover:bg-[#F3F4F6] text-[#4B5563] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`py-3 px-4 rounded-xl border border-[#0B3D2E] text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          addedAnimation
                            ? "bg-[#DCFCE7] text-[#0B3D2E] border-[#16A34A]"
                            : "bg-white text-[#0B3D2E] hover:bg-[#F8FAF9] shadow-2xs"
                        }`}
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-4 h-4 text-[#16A34A]" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="py-3 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all"
                      >
                        <CreditCard className="w-4 h-4 text-[#DCFCE7]" />
                        <span>Buy Now • {formatNaira(product.price * quantity)}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#6B7280] text-center pt-1 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Instant hosted Paystack payment. Safe &amp; verified.</span>
                    </p>
                  </>
                ) : (
                  <div className="py-4 text-center space-y-1">
                    <span className="text-xs font-bold text-rose-700 block">
                      This product is currently out of stock.
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Please contact {store.name} below to inquire about restock dates.
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Support / Contact Channels (Optional secondary, clearly separated from checkout) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Have questions before ordering? Contact {store.name}:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Seller</span>
                    </a>
                  )}

                  {store.contactPhone && (
                    <a
                      href={`tel:${store.contactPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-xs font-medium transition-colors"
                    >
                      <Phone className="w-3 h-3 text-[#16A34A]" />
                      <span>Call {store.contactPhone}</span>
                    </a>
                  )}

                  {store.contactEmail && (
                    <a
                      href={`mailto:${store.contactEmail}?subject=Inquiry: ${product.name}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-xs font-medium transition-colors"
                    >
                      <Mail className="w-3 h-3 text-[#16A34A]" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Guarantees & Policy Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#374151]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <Truck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#111827]">Nationwide Shipping</span>
                    <span className="text-[11px] text-[#6B7280]">
                      Dispatched across Nigeria via verified couriers
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                  <RotateCcw className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#111827]">72h Return Window</span>
                    <span className="text-[11px] text-[#6B7280]">
                      Standard return policy for damaged items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Detailed Specs Section */}
            {product.description && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-3">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#16A34A]" />
                  <span>Product Details</span>
                </h2>
                <div className="text-xs sm:text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <StorefrontCartDrawer
        storeSlug={store.slug}
        storeName={store.name}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-8 text-center text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-1">
          <p className="font-semibold text-[#111827]">
            {store.name} • Darté Verified Merchant
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            All prices and orders are configured in Nigerian Naira (₦).
          </p>
        </div>
      </footer>
    </div>
  );
}
