import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeSupplierOnboarding } from "@/lib/db/profileStore";
import { SupplierOnboardingInput } from "@/lib/types/profile";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SupplierOnboardingInput;

    if (!body.businessName || !body.businessCategory) {
      return NextResponse.json(
        { error: "Business name and category are required." },
        { status: 400 }
      );
    }

    const result = await completeSupplierOnboarding(userId, body);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error("API /api/onboarding/supplier error:", err);
    return NextResponse.json(
      { error: "Failed to complete supplier onboarding" },
      { status: 500 }
    );
  }
}
