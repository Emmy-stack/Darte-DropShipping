import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import SellerOrdersView from "@/components/orders/SellerOrdersView";
import { getSellerOrders } from "@/lib/db/orders";
import { getSellerStoreProfile } from "@/lib/db/storeProfile";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Auth context unavailable in test / offline mode
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/dashboard/orders");
  }

  const effectiveUserId = userId || "demo_seller";
  const orders = await getSellerOrders(effectiveUserId);
  const storeData = await getSellerStoreProfile(effectiveUserId);

  return (
    <DashboardLayout pageTitle="Orders">
      <SellerOrdersView
        initialOrders={orders}
        storeSlug={storeData.profile?.slug || undefined}
      />
    </DashboardLayout>
  );
}
