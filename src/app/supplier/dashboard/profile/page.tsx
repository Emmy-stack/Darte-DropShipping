import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SupplierDashboardShell from "@/components/supplier/SupplierDashboardShell";
import SupplierProfileView from "@/components/supplier/SupplierProfileView";
import { getSupplierByClerkId } from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function SupplierProfilePage() {
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

  return (
    <SupplierDashboardShell supplier={supplier}>
      <SupplierProfileView initialSupplier={supplier} />
    </SupplierDashboardShell>
  );
}
