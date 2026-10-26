import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateSellerOrderStatus } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * PATCH /api/seller/orders/[orderId]
 * Allows the authenticated seller to update their order's fulfillment status.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to update order status." },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const body = await req.json();

    if (!body || !body.status) {
      return NextResponse.json(
        { success: false, error: "Missing new order status in request body." },
        { status: 400 }
      );
    }

    const result = await updateSellerOrderStatus(userId, orderId, body.status);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: `Order status successfully updated to ${body.status}.`,
    });
  } catch (err: unknown) {
    console.error("Error in PATCH /api/seller/orders/[orderId]:", err);
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
