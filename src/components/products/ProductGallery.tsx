"use client";

import React, { useState } from "react";
import Image from "next/image";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450' fill='%23F3F4F6'%3E%3Crect width='600' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='sans-serif' font-size='20' font-weight='600'%3EDart%C3%A9 Product Photo%3C/text%3E%3C/svg%3E";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});

  const currentImage = images[selectedIndex] || images[0];
  const displayImage = errorMap[selectedIndex] ? FALLBACK_IMAGE : currentImage;

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-4/3 w-full bg-[#F3F4F6] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs">
        {!loadedMap[selectedIndex] && !errorMap[selectedIndex] && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        )}
        <Image
          src={displayImage}
          alt={`${productName} - View ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={`object-cover object-center transition-opacity duration-300 ${
            loadedMap[selectedIndex] || errorMap[selectedIndex] ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoadedMap((prev) => ({ ...prev, [selectedIndex]: true }))}
          onError={() => setErrorMap((prev) => ({ ...prev, [selectedIndex]: true }))}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            const thumbSrc = errorMap[idx] ? FALLBACK_IMAGE : img;

            return (
              <button
                key={img + idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square w-20 sm:w-24 rounded-xl overflow-hidden bg-[#F3F4F6] border-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "border-[#16A34A] ring-2 ring-[#DCFCE7]"
                    : "border-[#E5E7EB] hover:border-[#BBF7D0]"
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover object-center"
                  onError={() => setErrorMap((prev) => ({ ...prev, [idx]: true }))}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
