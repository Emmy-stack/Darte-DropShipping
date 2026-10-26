"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Package,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";
import { PublicStoreProfile } from "@/types/store";
import { PublicOrderSummary, PaymentStatus, OrderStatus } from "@/types/order";
import { formatNaira } from "@/lib/utils/formatCurrency";
import { useStoreCart } from "@/context/StoreCartContext";

interface StorefrontOrderConfirmationViewProps {
  store: PublicStoreProfile;
  order: PublicOrderSummary | null;
  verifyStatus?: string;
  verifyError?: string | null;
  alreadyPaid?: boolean;
}

export default function StorefrontOrderConfirmationView({
  store,
  order,
  verifyStatus,
  verifyError,
}: StorefrontOrderConfirmationViewProps) {
  const { clearCart } = useStoreCart();

  const isSuccess =
    order &&
    order.paymentStatus === PaymentStatus.SUCCESS &&
    order.orderStatus === OrderStatus.PAID;

  const isAbandoned = verifyStatus === "abandoned" || order?.paymentStatus === PaymentStatus.ABANDONED;

  // Clear customer cart when payment is successfully confirmed
  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] py-3.5 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href={`/shop/${store.slug}`}
            className="text-xs font-semibold text-[#0B3D2E] hover:text-[#16A34A] transition-colors"
          >
            ← Back to {store.name}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[#0B3D2E] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Darté Verified Payment</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
        {/* SUCCESS STATE */}
        {isSuccess && order ? (
          <div className="space-y-6">
            {/* Celebration Status Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCFCE7] shadow-xs text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A] block">
                  Payment Confirmed &amp; Verified
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                  Thank you for your order!
                </h1>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                  Your payment has been verified with Paystack. An order receipt has been recorded for <strong>{store.name}</strong>.
                </p>
              </div>

              {/* Order Number Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-xs font-mono font-bold text-[#0B3D2E] mt-2">
                <span>Order Reference:</span>
                <span className="text-sm text-[#111827]">{order.orderNumber}</span>
              </div>
            </div>

            {/* Order Details & Summary Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#16A34A]" />
                  <span>Purchased Items ({order.items.length})</span>
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#0B3D2E]">
                  Paid ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB]"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#111827] truncate">
                        {item.productName}
                      </h4>
                      <span className="text-[11px] text-[#6B7280]">
                        Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#111827] shrink-0">
                      {formatNaira(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-2 text-xs text-[#374151]">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-semibold text-[#111827]">{formatNaira(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Delivery Dispatch</span>
                  <span className="text-[#16A34A] font-semibold">Standard Shipping</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-bold">
                  <span>Total Amount Paid</span>
                  <span className="text-base font-black text-[#0B3D2E]">
                    {formatNaira(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-2 text-xs">
                <h3 className="font-bold text-[#111827]">Delivery Destination</h3>
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E5E7EB] text-[#4B5563] space-y-1">
                  <p className="font-semibold text-[#111827]">{order.customerName}</p>
                  <p>{order.deliveryAddress}</p>
                  <p>{order.deliveryCity}, {order.deliveryState}</p>
                  <p className="text-[11px] text-[#6B7280]">Contact: {order.customerPhone} • {order.customerEmail}</p>
                  {order.deliveryInstructions && (
                    <p className="text-[11px] text-[#9CA3AF] italic pt-1">
                      Note: &ldquo;{order.deliveryInstructions}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Seller Contact Support */}
              <div className="p-4 rounded-2xl bg-[#0B3D2E]/5 border border-[#0B3D2E]/10 space-y-2">
                <span className="text-xs font-bold text-[#0B3D2E] block">
                  Need assistance with your delivery?
                </span>
                <p className="text-xs text-[#4B5563]">
                  {store.name} will prepare your dispatch. For real-time updates, contact the store directly:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {store.contactPhone && (
                    <a
                      href={`tel:${store.contactPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>{store.contactPhone}</span>
                    </a>
                  )}
                  {store.contactEmail && (
                    <a
                      href={`mailto:${store.contactEmail}?subject=Order ${order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] font-semibold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>{store.contactEmail}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Return to Store CTA */}
              <div className="pt-2">
                <Link
                  href={`/shop/${store.slug}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all"
                >
                  <span>Continue Browsing {store.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : isAbandoned ? (
          /* ABANDONED / CANCELLED PAYMENT STATE */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                Checkout Abandoned
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                Payment Session Not Completed
              </h1>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                You exited or cancelled the Paystack payment session before completion. Your card was not charged.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/shop/${store.slug}/checkout`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-bold transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Payment Again</span>
              </Link>
              <Link
                href={`/shop/${store.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-all"
              >
                <span>Return to Store</span>
              </Link>
            </div>
          </div>
        ) : (
          /* FAILED / ERROR PAYMENT STATE */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                Payment Verification Failed
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                Payment Unsuccessful
              </h1>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                {verifyError ||
                  "The payment could not be verified by the gateway or was declined. Your order has not been placed."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-800 max-w-md mx-auto text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                If money was deducted from your account, Paystack automatically reconciles or reverses unfulfilled authorizations within standard banking hours.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/shop/${store.slug}/checkout`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#114B39] text-white text-xs font-bold transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment</span>
              </Link>
              <Link
                href={`/shop/${store.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] transition-all"
              >
                <span>Back to {store.name}</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
