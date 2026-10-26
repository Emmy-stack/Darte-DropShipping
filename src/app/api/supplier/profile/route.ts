import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getSupplierByClerkId,
  registerSupplier,
  updateSupplierProfile,
  getSupplierDashboardMetrics,
} from "@/lib/db/supplier";
import {
  SupplierRegistrationInput,
  SupplierProfileUpdateInput,
} from "@/types/supplier";

export const dynamic = "force-dynamic";

/**
 * GET /api/supplier/profile
 * Returns authenticated supplier profile and operational metrics.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Sign-in required" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "No supplier profile found for your account.", notRegistered: true },
        { status: 404 }
      );
    }

    const metrics = await getSupplierDashboardMetrics(supplier.id);

    return NextResponse.json({
      success: true,
      supplier,
      metrics,
    });
  } catch (err: unknown) {
    console.error("GET /api/supplier/profile error:", err);
    return NextResponse.json(
      { error: "Failed to load supplier profile" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supplier/profile
 * Register as a new wholesale supplier on Darté.
 * Always initializes with PENDING status.
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
    console.error("POST /api/supplier/profile error:", err);
    return NextResponse.json(
      { error: "Failed to register supplier profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/supplier/profile
 * Updates permitted supplier company details.
 * Prevents editing verification status or admin notes.
 */
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Sign-in required" }, { status: 401 });
    }

    const body = (await req.json()) as SupplierProfileUpdateInput;
    const result = await updateSupplierProfile(userId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      supplier: result.supplier,
    });
  } catch (err: unknown) {
    console.error("PATCH /api/supplier/profile error:", err);
    return NextResponse.json(
      { error: "Failed to update supplier profile" },
      { status: 500 }
    );
  }
}
