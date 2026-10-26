import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { registerSupplier } from "@/lib/db/supplier";
import { SupplierRegistrationInput } from "@/types/supplier";

export const dynamic = "force-dynamic";

/**
 * POST /api/supplier/register
 * Direct endpoint for supplier onboarding registration.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Sign-in required" }, { status: 401 });
    }

    const body = (await req.json()) as SupplierRegistrationInput;
    const result = await registerSupplier(userId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      supplier: result.supplier,
    });
  } catch (err: unknown) {
    console.error("POST /api/supplier/register error:", err);
    return NextResponse.json(
      { error: "Failed to register supplier profile" },
      { status: 500 }
    );
  }
}
