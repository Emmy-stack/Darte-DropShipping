"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  SupplierProductInput,
  SupplierProductItem,
} from "@/types/supplier";

const CATEGORIES = [
  "Electronics",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Health & Wellness",
  "Sports & Fitness",
  "Mobile Accessories",
  "Computers & Tech",
  "Other",
];

interface SupplierProductFormViewProps {
  initialProduct?: SupplierProductItem;
  supplierLocation: string;
  isVerified: boolean;
}

export default function SupplierProductFormView({
  initialProduct,
  supplierLocation,
  isVerified,
}: SupplierProductFormViewProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [formData, setFormData] = useState<
    Omit<SupplierProductInput, "images"> & { images: string[] }
  >({
    name: initialProduct?.name || "",
    category: initialProduct?.category || "Electronics",
    shortDescription: initialProduct?.shortDescription || "",
    description: initialProduct?.description || "",
    images: initialProduct?.images?.length ? initialProduct.images : [""],
    supplierCost: initialProduct?.supplierCost || 0,
    suggestedSellingPrice: initialProduct?.suggestedSellingPrice || 0,
    stock: initialProduct?.stock ?? 10,
    supplierFulfillmentDays: initialProduct?.supplierFulfillmentDays || "1-3 business days",
    supplierDispatchRate: initialProduct?.supplierDispatchRate || "98%",
    supplierLocation: initialProduct?.supplierLocation || supplierLocation || "Lagos, Nigeria",
    supplierMinOrderQty: initialProduct?.supplierMinOrderQty || 1,
    status: initialProduct?.status || (isVerified ? "ACTIVE" : "DRAFT"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formData.images];
    updated[index] = val;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    if (formData.images.length === 1) {
      setFormData({ ...formData, images: [""] });
    } else {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }
    if (formData.supplierCost <= 0) {
      setErrorMessage("Wholesale price must be a positive integer in Naira (₦).");
      return;
    }
    if (formData.stock < 0) {
      setErrorMessage("Available stock cannot be negative.");
      return;
    }

    // Clean image URLs
    const cleanImages = formData.images
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    const payload = {
      ...formData,
      images: cleanImages.length > 0 ? cleanImages : ["/placeholder-product.png"],
      supplierCost: Math.round(Number(formData.supplierCost)),
      suggestedSellingPrice: Math.round(
        Number(formData.suggestedSellingPrice || Math.round(formData.supplierCost * 1.35))
      ),
      stock: Math.round(Number(formData.stock)),
    };

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/supplier/products/${initialProduct!.id}`
        : "/api/supplier/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product.");
      }

      setSuccessMessage(
        isEditing
          ? "Product listing updated successfully!"
          : "Product created successfully!"
      );

      setTimeout(() => {
        router.push("/supplier/dashboard/products");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred while saving."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrDeactivate = async () => {
    if (!initialProduct) return;
    const confirmAction = confirm(
      "Are you sure you want to remove or deactivate this product? If historical orders reference it, it will be safely deactivated to preserve customer receipts."
    );
    if (!confirmAction) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/supplier/products/${initialProduct.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product.");
      }

      router.push("/supplier/dashboard/products");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/supplier/dashboard/products"
            className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 flex items-center justify-center text-[#4B5563] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-heading)]">
              {isEditing ? "Edit Wholesale Product" : "Add New Wholesale Product"}
            </h1>
            <p className="text-xs text-[#6B7280]">
              {isEditing
                ? "Update pricing, inventory, and dispatch terms."
                : "List a new product for sellers across Darté to discover."}
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDeleteOrDeactivate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Deactivate</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pending Banner Info */}
      {!isVerified && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Your supplier account is awaiting verification. This product will be saved as a <strong>Draft</strong> and can be activated once Darté administrators approve your account.
          </span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Core Product Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
            Product Identification
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Product Title / Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ultra-Slim 20,000mAh Power Bank with Fast Charging"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                disabled={!isVerified && formData.status === "DRAFT"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {isVerified && <option value="ACTIVE">Active (Available for Sellers)</option>}
                <option value="DRAFT">Draft (Under Review)</option>
                <option value="INACTIVE">Inactive (Archived)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Short Description / Highlight
            </label>
            <input
              type="text"
              value={formData.shortDescription || ""}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              placeholder="Key specifications or selling point (e.g. 22.5W PD Fast Charge, Dual USB-C)"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Full technical details, packaging, warranty, and compatibility info..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
            Wholesale Pricing &amp; Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Wholesale Cost (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#6B7280]">
                  ₦
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={formData.supplierCost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplierCost: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="e.g. 15000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm font-semibold text-[#111827] focus:border-[#16A34A] focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-[#6B7280] block mt-1">
                Your fixed wholesale price per unit
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Suggested Retail Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#6B7280]">
                  ₦
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.suggestedSellingPrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suggestedSellingPrice: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="e.g. 22000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm font-semibold text-[#111827] focus:border-[#16A34A] focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-[#6B7280] block mt-1">
                Recommended end-customer price
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="e.g. 50"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm font-semibold text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
              <span className="text-[11px] text-[#6B7280] block mt-1">
                Units ready for immediate dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Dispatch Terms & Logistics */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
            Fulfilment &amp; Logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Dispatch Estimate *
              </label>
              <select
                value={formData.supplierFulfillmentDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierFulfillmentDays: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              >
                <option value="Same day dispatch">Same day dispatch</option>
                <option value="1-2 business days">1-2 business days</option>
                <option value="2-3 business days">2-3 business days</option>
                <option value="3-5 business days">3-5 business days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Dispatch Location
              </label>
              <input
                type="text"
                value={formData.supplierLocation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, supplierLocation: e.target.value })
                }
                placeholder="e.g. Alaba International, Lagos"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Historical Dispatch Rate
              </label>
              <input
                type="text"
                value={formData.supplierDispatchRate || "98%"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierDispatchRate: e.target.value,
                  })
                }
                placeholder="e.g. 98%"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
              Product Images
            </h3>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs font-semibold text-[#16A34A] hover:underline"
            >
              + Add Image URL
            </button>
          </div>

          <div className="space-y-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/... or public image URL"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF9] text-xs sm:text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImageField(idx)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
          <Link
            href="/supplier/dashboard/products"
            className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Save Changes" : "Create Product"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
