import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getSupplierByClerkId,
  updateSupplierItemFulfillment,
} from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/supplier/orders/[orderItemId]
 * Updates fulfillment status of an order item owned by the supplier.
 * Strictly verifies parent order is PAID.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderItemId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can update fulfillment." },
        { status: 403 }
      );
    }

    const { orderItemId } = await params;
    const body = await req.json();
    const { fulfillmentStatus } = body;

    if (!fulfillmentStatus) {
      return NextResponse.json(
        { error: "fulfillmentStatus is required" },
        { status: 400 }
      );
    }

    const result = await updateSupplierItemFulfillment(
      supplier.id,
      orderItemId,
      fulfillmentStatus
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      item: result.item,
    });
  } catch (err: unknown) {
    console.error("PATCH /api/supplier/orders/[orderItemId] error:", err);
    return NextResponse.json(
      { error: "Failed to update item fulfillment" },
      { status: 500 }
    );
  }
}
