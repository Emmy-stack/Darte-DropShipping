import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SupplierDashboardShell from "@/components/supplier/SupplierDashboardShell";
import SupplierProductsView from "@/components/supplier/SupplierProductsView";
import {
  getSupplierByClerkId,
  getSupplierProducts,
} from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function SupplierProductsPage() {
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

  const products = await getSupplierProducts(supplier.id);
  const isVerified = supplier.verificationStatus === "APPROVED";

  return (
    <SupplierDashboardShell supplier={supplier}>
      <SupplierProductsView initialProducts={products} isVerified={isVerified} />
    </SupplierDashboardShell>
  );
}
