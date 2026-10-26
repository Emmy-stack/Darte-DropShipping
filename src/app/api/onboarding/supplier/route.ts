import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeSupplierOnboarding } from "@/lib/db/profileStore";
import { registerSupplier } from "@/lib/db/supplier";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const companyName = body.companyName || body.businessName;
    if (!companyName) {
      return NextResponse.json(
        { error: "Business name is required." },
        { status: 400 }
      );
    }

    const businessEmail = body.businessEmail || `${userId.slice(0, 10)}@darte.shop`;
    const phone = body.phone || "+2348000000000";
    const state = body.state || "Lagos";
    const city = body.city || "Lagos";

    await completeSupplierOnboarding(userId, body);
    const regResult = await registerSupplier(userId, {
      companyName,
      businessEmail,
      phone,
      state,
      city,
      address: body.businessAddress || body.address,
      description: body.businessDescription || body.description,
      categoriesSupplied: body.productsSupplied || [body.businessCategory || "Electronics"],
    });

    return NextResponse.json(regResult);
  } catch (err: unknown) {
    console.error("API /api/onboarding/supplier error:", err);
    return NextResponse.json(
      { error: "Failed to complete supplier onboarding" },
      { status: 500 }
    );
  }
}
