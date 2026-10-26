import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SupplierDashboardShell from "@/components/supplier/SupplierDashboardShell";
import SupplierOverviewView from "@/components/supplier/SupplierOverviewView";
import {
  getSupplierByClerkId,
  getSupplierDashboardMetrics,
} from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
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
    // Demo fallback
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/supplier/dashboard");
  }

  if (!userId) {
    redirect("/supplier/register");
  }

  const supplier = await getSupplierByClerkId(userId);

  if (!supplier) {
    redirect("/supplier/register");
  }

  const metrics = await getSupplierDashboardMetrics(supplier.id);

  return (
    <SupplierDashboardShell supplier={supplier}>
      <SupplierOverviewView supplier={supplier} metrics={metrics} />
    </SupplierDashboardShell>
  );
}
