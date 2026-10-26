"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowRight, Plus } from "lucide-react";
import EmptyState from "./EmptyState";
import { useStoreProducts } from "@/context/StoreProductsContext";
import { formatNaira } from "@/lib/utils/formatCurrency";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23F3F4F6'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='sans-serif' font-size='10'%3EDart%C3%A9%3C/text%3E%3C/svg%3E";

export default function ProductsPreview() {
  const { getStoreProducts, isHydrated } = useStoreProducts();
  const products = isHydrated ? getStoreProducts() : [];
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827] font-[family-name:var(--font-heading)]">
                Your Products
              </h2>
              {products.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B3D2E]">
                  {products.length} added
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Curate and manage products you sell to customers
            </p>
          </div>
          <Link
            href="/dashboard/products"
            className="text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E] flex items-center gap-1 transition-colors"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="You haven't added any products yet."
            description="Find winning products and add them to your store to start selling."
            primaryCta={{
              label: "Find Products",
              href: "/dashboard/products/find",
            }}
            secondaryCta={{
              label: "Add Product",
              href: "/dashboard/products/find",
            }}
            className="py-10 border-dashed border-[#E5E7EB] bg-[#F8FAF9]/50"
          />
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
              {products.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAF9] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative aspect-square w-12 rounded-lg overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                      <Image
                        src={imageErrors[item.id] ? FALLBACK_IMAGE : item.images[0]}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover object-center"
                        onError={() =>
                          setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/products/${item.id}`}
                        className="text-xs font-bold text-[#111827] hover:text-[#16A34A] block truncate transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Selling: {formatNaira(item.storeSellingPrice)} •{" "}
                        <span className="text-[#16A34A] font-bold">
                          +{formatNaira(item.storeProfit)} profit
                        </span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/products/${item.id}`}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-lg hover:bg-white"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#6B7280]">
                {products.length > 3
                  ? `+${products.length - 3} more in your store catalog`
                  : "All added products shown"}
              </span>
              <Link
                href="/dashboard/products/find"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] hover:text-[#0B3D2E]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
