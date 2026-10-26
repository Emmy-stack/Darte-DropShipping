"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  User,
  MapPin,
  Phone,
  Mail,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { SellerOrder, OrderStatus, PaymentStatus } from "@/types/order";
import { formatNaira } from "@/lib/utils/formatCurrency";

interface SellerOrdersViewProps {
  initialOrders: SellerOrder[];
  storeSlug?: string;
}

export default function SellerOrdersView({
  initialOrders,
  storeSlug,
}: SellerOrdersViewProps) {
  const [orders, setOrders] = useState<SellerOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Compute metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === PaymentStatus.SUCCESS || o.orderStatus === OrderStatus.PAID
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const inProgress = orders.filter(
      (o) =>
        o.orderStatus === OrderStatus.PAID ||
        o.orderStatus === OrderStatus.PROCESSING ||
        o.orderStatus === OrderStatus.SHIPPED
    ).length;
    const completed = orders.filter((o) => o.orderStatus === OrderStatus.DELIVERED).length;

    return { totalOrders, totalRevenue, inProgress, completed };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.deliveryCity.toLowerCase().includes(q) ||
          o.deliveryState.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/seller/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUpdateError(data.error || "Failed to update order status.");
        setUpdatingStatus(false);
        return;
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === selectedOrder.id ? { ...ord, orderStatus: newStatus } : ord
        )
      );

      setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error updating order.";
      setUpdateError(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.PAID:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#0B3D2E] border border-[#16A34A]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Paid</span>
          </span>
        );
      case OrderStatus.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Processing</span>
          </span>
        );
      case OrderStatus.SHIPPED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Shipped</span>
          </span>
        );
      case OrderStatus.DELIVERED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Payment</span>
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return (
          <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7]/70 px-2 py-0.5 rounded-md">
            Verified Success
          </span>
        );
      case PaymentStatus.FAILED:
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            Payment Failed
          </span>
        );
      case PaymentStatus.ABANDONED:
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Abandoned
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
          Customer Orders
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Track and manage verified customer orders received through your public storefront.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] block">Total Orders</span>
          <span className="text-2xl font-black text-[#111827] mt-1 block">
            {metrics.totalOrders}
          </span>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">Lifetime storefront orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] block">Verified Revenue</span>
          <span className="text-2xl font-black text-[#16A34A] mt-1 block">
            {formatNaira(metrics.totalRevenue)}
          </span>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">Paid via Paystack</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] block">In Progress</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {metrics.inProgress}
          </span>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">Awaiting dispatch/delivery</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] block">Completed Orders</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {metrics.completed}
          </span>
          <span className="text-[11px] text-[#9CA3AF] mt-1 block">Successfully delivered</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, state, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D1D5DB] text-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 hidden sm:inline" />
          {["ALL", OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-[#0B3D2E] text-white"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
              >
                {status === "ALL" ? "All Orders" : status.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E5E7EB] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] text-[#0B3D2E] flex items-center justify-center mx-auto">
            <ClipboardList className="w-8 h-8 text-[#16A34A]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#111827]">No Orders Found</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {orders.length === 0
                ? "You haven't received any customer orders yet. Share your storefront link to start receiving sales!"
                : "No orders match your active search or filter criteria."}
            </p>
          </div>
          {orders.length === 0 && storeSlug && (
            <div className="pt-2">
              <a
                href={`/shop/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-semibold transition-colors"
              >
                <span>View Your Storefront</span>
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-[#6B7280] uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3.5">Order Info</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Destination</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Order Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F8FAF9]/80 transition-colors">
                    {/* Order Number & Date */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#111827] block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF]">
                        {new Date(ord.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#111827] block">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-[#6B7280] block">
                        {ord.customerPhone}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#374151] block truncate max-w-[140px]">
                        {ord.deliveryCity}, {ord.deliveryState}
                      </span>
                    </td>

                    {/* Items Count */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#111827]">
                        {ord.items.length} item{ord.items.length === 1 ? "" : "s"}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-[#111827]">
                        {formatNaira(ord.totalAmount)}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      {getPaymentStatusBadge(ord.paymentStatus)}
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-4">
                      {getOrderStatusBadge(ord.orderStatus)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D1D5DB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5E7EB] bg-[#F8FAF9] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                  Order Details
                </span>
                <h3 className="text-base font-extrabold text-[#111827] font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg border border-[#E5E7EB] hover:bg-white text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Status Update Banner */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-[#6B7280]">Current Fulfillment Status</span>
                    <div>{getOrderStatusBadge(selectedOrder.orderStatus)}</div>
                  </div>

                  {/* Change Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">Update Status:</span>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      disabled={updatingStatus}
                      className="px-3 py-1.5 rounded-xl border border-[#D1D5DB] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    >
                      <option value={OrderStatus.PAID}>Paid</option>
                      <option value={OrderStatus.PROCESSING}>Processing</option>
                      <option value={OrderStatus.SHIPPED}>Shipped</option>
                      <option value={OrderStatus.DELIVERED}>Delivered</option>
                      <option value={OrderStatus.CANCELLED}>Cancelled</option>
                    </select>

                    {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />}
                  </div>
                </div>

                {updateSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Order status updated successfully!</span>
                  </div>
                )}

                {updateError && (
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-medium">
                    {updateError}
                  </div>
                )}
              </div>

              {/* Customer & Delivery Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <User className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Customer Details</span>
                  </div>
                  <p className="font-semibold text-[#111827]">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-1 text-[#6B7280]">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                  <p className="flex items-center gap-1 text-[#6B7280]">
                    <Mail className="w-3 h-3" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline">
                      {selectedOrder.customerEmail}
                    </a>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#111827]">
                    <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-[#374151]">{selectedOrder.deliveryAddress}</p>
                  <p className="font-medium text-[#111827]">
                    {selectedOrder.deliveryCity}, {selectedOrder.deliveryState}
                  </p>
                  {selectedOrder.deliveryInstructions && (
                    <p className="text-[11px] text-[#6B7280] italic">
                      &ldquo;{selectedOrder.deliveryInstructions}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="font-bold text-[#111827] block">Purchased Items</span>
                <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden divide-y divide-[#E5E7EB]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.productImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-[#111827] block truncate">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">
                            {item.quantity} × {formatNaira(item.unitPrice)}
                          </span>
                        </div>
                      </div>

                      <span className="font-extrabold text-[#111827] shrink-0">
                        {formatNaira(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] space-y-2">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111827]">{formatNaira(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Shipping</span>
                  <span className="text-[#16A34A] font-semibold">Included / Standard</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-bold">
                  <span>Total Amount</span>
                  <span className="text-base font-black text-[#0B3D2E]">
                    {formatNaira(selectedOrder.totalAmount)}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-[#9CA3AF] flex items-center justify-between">
                  <span>Payment Reference:</span>
                  <span className="font-mono">{selectedOrder.paymentReference}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAF9] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
