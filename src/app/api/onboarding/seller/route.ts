import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeSellerOnboarding } from "@/lib/db/profileStore";
import { SellerOnboardingInput } from "@/lib/types/profile";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SellerOnboardingInput;

    if (!body.storeName || !body.storeCategory) {
      return NextResponse.json(
        { error: "Store name and category are required." },
        { status: 400 }
      );
    }

    const result = await completeSellerOnboarding(userId, body);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error("API /api/onboarding/seller error:", err);
    return NextResponse.json(
      { error: "Failed to complete seller onboarding" },
      { status: 500 }
    );
  }
}
