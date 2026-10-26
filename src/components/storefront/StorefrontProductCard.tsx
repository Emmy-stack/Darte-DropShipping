"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Image as ImageIcon, ShoppingBag } from "lucide-react";
import { PublicStoreProduct } from "@/types/store";
import { formatNaira } from "@/lib/utils/formatCurrency";
import { useStoreCart } from "@/context/StoreCartContext";

interface StorefrontProductCardProps {
  product: PublicStoreProduct;
  storeSlug: string;
}

export default function StorefrontProductCard({
  product,
  storeSlug,
}: StorefrontProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem } = useStoreCart();

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const detailUrl = `/shop/${storeSlug}/products/${product.id}`;

  return (
    <article className="group bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#16A34A]/50 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Product Image Area */}
      <Link href={detailUrl} className="relative aspect-square bg-[#F8FAF9] overflow-hidden block">
        {primaryImage && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#9CA3AF] bg-[#F3F4F6]">
            <ImageIcon className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[11px] mt-1 font-medium">No Image</span>
          </div>
        )}

        {/* Stock / Badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.inStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#DCFCE7]/90 text-[#0B3D2E] backdrop-blur-xs border border-[#16A34A]/20">
              In Stock
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800">
              Sold Out
            </span>
          )}

          {product.badges && product.badges.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0B3D2E]/90 text-white backdrop-blur-xs">
              {product.badges[0]}
            </span>
          )}
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category Tag */}
          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[#16A34A]">
              {product.category || "General"}
            </span>
            <span className="flex items-center gap-1 text-[#9CA3AF]">
              <Package className="w-3 h-3" />
              <span>Verified Product</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-[#111827] line-clamp-1 group-hover:text-[#16A34A] transition-colors">
            <Link href={detailUrl} title={product.name}>
              {product.name}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Link CTA */}
        <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#9CA3AF] block font-medium">Retail Price</span>
            <span className="text-base font-extrabold text-[#111827]">
              {formatNaira(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {product.inStock && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product, 1);
                }}
                className="p-1.5 rounded-xl border border-[#D1D5DB] hover:border-[#16A34A] hover:bg-[#DCFCE7]/60 text-[#374151] hover:text-[#0B3D2E] transition-colors"
                title="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            )}
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8FAF9] hover:bg-[#0B3D2E] text-xs font-semibold text-[#0B3D2E] hover:text-white transition-all shadow-2xs group-hover:bg-[#0B3D2E] group-hover:text-white"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
