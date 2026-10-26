import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SupplierDashboardShell from "@/components/supplier/SupplierDashboardShell";
import SupplierProductFormView from "@/components/supplier/SupplierProductFormView";
import { getSupplierByClerkId } from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

export default async function NewSupplierProductPage() {
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

  const isVerified = supplier.verificationStatus === "APPROVED";
  const location = `${supplier.city}, ${supplier.state}`;

  return (
    <SupplierDashboardShell supplier={supplier}>
      <SupplierProductFormView
        supplierLocation={location}
        isVerified={isVerified}
      />
    </SupplierDashboardShell>
  );
}
