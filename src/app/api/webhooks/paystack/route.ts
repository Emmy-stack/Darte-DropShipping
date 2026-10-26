import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { handlePaystackWebhookChargeSuccess } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.success" && payload.data) {
      await handlePaystackWebhookChargeSuccess({
        reference: payload.data.reference,
        amount: payload.data.amount,
        currency: payload.data.currency,
        paid_at: payload.data.paid_at,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unhandled error in Paystack webhook handler:", err);
    return NextResponse.json(
      { error: "Webhook processing error." },
      { status: 500 }
    );
  }
}
