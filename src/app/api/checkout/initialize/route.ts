import { NextRequest, NextResponse } from "next/server";
import { createPendingOrder } from "@/lib/db/orders";
import { CheckoutInitializeInput } from "@/types/order";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutInitializeInput;

    if (!body || !body.storeSlug || !body.customer || !body.items) {
      return NextResponse.json(
        { success: false, error: "Missing required checkout parameters." },
        { status: 400 }
      );
    }

    // Determine canonical base URL for the callback
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const callbackBaseUrl = origin.startsWith("http")
      ? origin.replace(/\/$/, "")
      : `http://${origin}`;

    const result = await createPendingOrder(body, { callbackBaseUrl });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to initialize checkout." },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("Unhandled error in /api/checkout/initialize:", err);
    const message = err instanceof Error ? err.message : "Internal server error during checkout.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
