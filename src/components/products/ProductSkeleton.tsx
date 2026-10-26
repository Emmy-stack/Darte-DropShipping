import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden animate-pulse flex flex-col">
      <div className="aspect-4/3 w-full bg-[#E5E7EB]" />
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-1/4 bg-[#E5E7EB] rounded-md" />
            <div className="h-3 w-1/6 bg-[#E5E7EB] rounded-md" />
          </div>
          <div className="h-4 w-3/4 bg-[#E5E7EB] rounded-md" />
          <div className="h-3 w-1/2 bg-[#E5E7EB] rounded-md" />
        </div>

        <div className="bg-[#F8FAF9] rounded-xl p-3 border border-[#E5E7EB] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-4 bg-[#E5E7EB] rounded-md" />
            <div className="h-4 bg-[#E5E7EB] rounded-md" />
          </div>
          <div className="h-5 bg-[#E5E7EB] rounded-md" />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="h-8 flex-1 bg-[#E5E7EB] rounded-xl" />
          <div className="h-8 w-16 bg-[#E5E7EB] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-[#E5E7EB] rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-4/3 w-full bg-[#E5E7EB] rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-square bg-[#E5E7EB] rounded-xl" />
            <div className="aspect-square bg-[#E5E7EB] rounded-xl" />
            <div className="aspect-square bg-[#E5E7EB] rounded-xl" />
            <div className="aspect-square bg-[#E5E7EB] rounded-xl" />
          </div>
        </div>

        {/* Info skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-[#E5E7EB] rounded-md" />
            <div className="h-8 w-3/4 bg-[#E5E7EB] rounded-md" />
            <div className="h-4 w-1/3 bg-[#E5E7EB] rounded-md" />
          </div>

          <div className="h-40 bg-[#E5E7EB] rounded-2xl" />
          <div className="h-12 bg-[#E5E7EB] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
