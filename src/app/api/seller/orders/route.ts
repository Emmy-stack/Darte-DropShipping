import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSellerOrders } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/orders
 * Retrieves all orders belonging strictly to the authenticated seller.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view your orders." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const orders = await getSellerOrders(userId, { status, search });

    return NextResponse.json({
      success: true,
      orders,
      totalCount: orders.length,
    });
  } catch (err: unknown) {
    console.error("Error in GET /api/seller/orders:", err);
    const message = err instanceof Error ? err.message : "Failed to retrieve seller orders.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
