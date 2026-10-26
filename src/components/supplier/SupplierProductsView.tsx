"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Boxes,
  PlusCircle,
  Search,
  Edit3,
  Power,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { SupplierProductItem } from "@/types/supplier";

interface SupplierProductsViewProps {
  initialProducts: SupplierProductItem[];
  isVerified: boolean;
}

export default function SupplierProductsView({
  initialProducts,
  isVerified,
}: SupplierProductsViewProps) {
  const [products, setProducts] = useState<SupplierProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || p.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = async (product: SupplierProductItem) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    if (nextStatus === "ACTIVE" && !isVerified) {
      alert("Cannot publish active products while your supplier account is pending verification.");
      return;
    }

    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/supplier/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update product status.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
      );
    } catch {
      alert("Network error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-heading)]">
            Wholesale Products
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Manage your inventory, wholesale prices, and stock levels.
          </p>
        </div>

        <Link
          href="/supplier/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs sm:text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "ACTIVE", "DRAFT", "INACTIVE"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <Boxes className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base font-bold text-[#111827]">
            {products.length === 0 ? "No wholesale products listed yet" : "No matching products found"}
          </h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            {products.length === 0
              ? "List your warehouse products so online merchants on Darté can import and sell them."
              : "Try clearing your search query or switching your status filter."}
          </p>
          {products.length === 0 && (
            <Link
              href="/supplier/dashboard/products/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3D2E] text-white text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Your First Product</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-[#E5E7EB]">
            {filtered.map((prod) => {
              const isLowStock = prod.stock > 0 && prod.stock <= 5;
              const isOutOfStock = prod.stock <= 0;
              const isUpdating = updatingId === prod.id;

              return (
                <div
                  key={prod.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAF9] transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-[#E5E7EB] overflow-hidden shrink-0 relative">
                      {prod.images && prod.images[0] ? (
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                          <Boxes className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>

                        {prod.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        )}
                        {prod.status === "DRAFT" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </span>
                        )}
                        {prod.status === "INACTIVE" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-gray-500" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#111827] mt-1 truncate">
                        {prod.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#6B7280]">
                        <div>
                          Wholesale: <strong className="text-[#0B3D2E]">₦{prod.supplierCost.toLocaleString()}</strong>
                        </div>
                        <span>•</span>
                        <div>
                          Stock:{" "}
                          <span
                            className={
                              isOutOfStock
                                ? "text-red-600 font-bold"
                                : isLowStock
                                ? "text-amber-600 font-bold"
                                : "text-[#111827] font-semibold"
                            }
                          >
                            {prod.stock} units
                          </span>
                        </div>
                        {prod.connectedSellersCount !== undefined && (
                          <>
                            <span>•</span>
                            <div className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#16A34A]" />
                              <span>{prod.connectedSellersCount} sellers listing</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => toggleStatus(prod)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        prod.status === "ACTIVE"
                          ? "border-[#E5E7EB] text-[#4B5563] hover:bg-gray-100"
                          : "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                      title={prod.status === "ACTIVE" ? "Deactivate listing" : "Activate listing"}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      <span>{prod.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
                    </button>

                    <Link
                      href={`/supplier/dashboard/products/${prod.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#111827] transition-colors shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
