import { NextRequest, NextResponse } from "next/server";
import { verifyAndFulfillOrder, getPublicOrderByReference } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference || !reference.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing transaction reference query parameter." },
        { status: 400 }
      );
    }

    const cleanRef = reference.trim();

    // Verify and fulfill order
    const result = await verifyAndFulfillOrder(cleanRef);

    if (!result.success) {
      // Fetch public order anyway if it exists so UI can show details with failed status
      const existingOrder = await getPublicOrderByReference(cleanRef);
      return NextResponse.json(
        {
          success: false,
          status: result.status || "failed",
          error: result.error || "Payment verification failed.",
          order: existingOrder || null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        alreadyPaid: result.alreadyPaid || false,
        order: result.order,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unhandled error in /api/checkout/verify:", err);
    const message = err instanceof Error ? err.message : "Internal server error verifying order.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
