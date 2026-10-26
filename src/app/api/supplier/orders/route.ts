import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getSupplierByClerkId,
  getSupplierOrderItems,
} from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

/**
 * GET /api/supplier/orders
 * Retrieves fulfillment items owned by the authenticated supplier.
 * Zero data leakage across suppliers.
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can access fulfillment." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const items = await getSupplierOrderItems(supplier.id, status);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: unknown) {
    console.error("GET /api/supplier/orders error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve supplier orders" },
      { status: 500 }
    );
  }
}
