"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { SupplierOrderItem } from "@/types/supplier";

interface SupplierOrdersViewProps {
  initialItems: SupplierOrderItem[];
}

export default function SupplierOrdersView({
  initialItems,
}: SupplierOrdersViewProps) {
  const [items, setItems] = useState<SupplierOrderItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deliveryCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || item.fulfillmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    orderItemId: string,
    targetStatus: string,
    isPaid: boolean
  ) => {
    if (!isPaid) {
      alert("Cannot fulfill an unpaid order. Payment must be confirmed first.");
      return;
    }

    setUpdatingId(orderItemId);
    try {
      const res = await fetch(`/api/supplier/orders/${orderItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update fulfillment status.");
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === orderItemId ? { ...i, fulfillmentStatus: targetStatus } : i
        )
      );
    } catch {
      alert("Network error updating fulfillment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] font-[family-name:var(--font-heading)]">
          Orders &amp; Fulfilment Queue
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
          View customer orders for your products, print dispatch slips, and mark items as shipped.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Orders", val: "ALL" },
            { label: "Pending", val: "PENDING" },
            { label: "Processing", val: "PROCESSING" },
            { label: "Shipped", val: "SHIPPED" },
            { label: "Delivered", val: "DELIVERED" },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.val
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order #, product, or city..."
          className="w-full sm:w-72 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs sm:text-sm text-[#111827] focus:border-[#16A34A] focus:outline-none shadow-2xs"
        />
      </div>

      {/* Fulfillment Items List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <Truck className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base font-bold text-[#111827]">
            {items.length === 0 ? "No fulfillment orders yet" : "No matching orders found"}
          </h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            {items.length === 0
              ? "When customers purchase your products through seller storefronts and payments are verified, items will appear here for packing and dispatch."
              : "Try switching your status filter or clearing your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isPaid = item.paymentStatus === "SUCCESS";
            const isUpdating = updatingId === item.id;
            const orderDate = new Date(item.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#16A34A]/40 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#111827]">
                      Order #{item.orderNumber}
                    </span>
                    <span className="text-[#9CA3AF]">•</span>
                    <span className="text-xs text-[#6B7280] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{orderDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment badge */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Paid &amp; Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Payment Pending</span>
                      </span>
                    )}

                    {/* Fulfillment status pill */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.fulfillmentStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.fulfillmentStatus === "SHIPPED"
                          ? "bg-blue-100 text-blue-800"
                          : item.fulfillmentStatus === "PROCESSING"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Item info */}
                  <div className="md:col-span-2 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-[#E5E7EB] overflow-hidden shrink-0 relative">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#111827]">
                        {item.productName}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
                        <span>Qty: <strong className="text-[#111827]">{item.quantity}</strong></span>
                        <span>•</span>
                        <span>Wholesale Cost: <strong>₦{item.wholesaleUnitPrice.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Line Total: <strong className="text-[#0B3D2E]">₦{item.wholesaleLineTotal.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs text-[#374151] space-y-1.5">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Delivery Recipient</span>
                    </div>
                    <div className="font-semibold">{item.recipientName}</div>
                    <div className="text-[#6B7280]">{item.deliveryAddress}</div>
                    <div className="font-medium text-[#111827]">{item.deliveryCity}, {item.deliveryState}</div>
                    {item.deliveryInstructions && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                        Note: {item.deliveryInstructions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Footer */}
                <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#6B7280]">
                    {isPaid ? (
                      <span>Advance fulfillment status as you pack and dispatch this order.</span>
                    ) : (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Fulfillment actions are locked until payment is verified.</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isUpdating && <Loader2 className="w-4 h-4 text-[#16A34A] animate-spin" />}

                    {item.fulfillmentStatus === "PENDING" && (
                      <button
                        type="button"
                        disabled={!isPaid || isUpdating}
                        onClick={() => handleUpdateStatus(item.id, "PROCESSING", isPaid)}
                        className="px-3 py-1.5 rounded-xl bg-[#0B3D2E] hover:bg-[#0E4736] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                      >
                        Start Packing (Processing)
                      </button>
                    )}

                    {item.fulfillmentStatus === "PROCESSING" && (
                      <button
                        type="button"
                        disabled={!isPaid || isUpdating}
                        onClick={() => handleUpdateStatus(item.id, "SHIPPED", isPaid)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                      >
                        Mark as Dispatched (Shipped)
                      </button>
                    )}

                    {item.fulfillmentStatus === "SHIPPED" && (
                      <button
                        type="button"
                        disabled={!isPaid || isUpdating}
                        onClick={() => handleUpdateStatus(item.id, "DELIVERED", isPaid)}
                        className="px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                      >
                        Confirm Delivered
                      </button>
                    )}

                    {item.fulfillmentStatus === "DELIVERED" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Fulfilled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
