import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SupplierDashboardShell from "@/components/supplier/SupplierDashboardShell";
import SupplierOrdersView from "@/components/supplier/SupplierOrdersView";
import {
  getSupplierByClerkId,
  getSupplierOrderItems,
} from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function SupplierOrdersPage() {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Demo fallback
  }

  if (!userId) {
    redirect("/supplier/register");
  }

  const supplier = await getSupplierByClerkId(userId);

  if (!supplier) {
    redirect("/supplier/register");
  }

  const items = await getSupplierOrderItems(supplier.id);

  return (
    <SupplierDashboardShell supplier={supplier}>
      <SupplierOrdersView initialItems={items} />
    </SupplierDashboardShell>
  );
}
