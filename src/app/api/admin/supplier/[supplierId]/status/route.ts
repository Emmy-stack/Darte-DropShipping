import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminUpdateSupplierStatus } from "@/lib/db/supplier";

export const dynamic = "force-dynamic";

/**
 * Timing-safe string comparison to protect against timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * PATCH /api/admin/supplier/[supplierId]/status
 * Protected administrative route for updating supplier verification status.
 * Requires ADMIN_SECRET_KEY environment variable and x-admin-secret request header.
 * Fails closed if ADMIN_SECRET_KEY is missing or empty.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const expectedKey = process.env.ADMIN_SECRET_KEY?.trim();

    // FAIL CLOSED: If server environment has not configured an admin key, reject access
    if (!expectedKey) {
      console.error("[Security] ADMIN_SECRET_KEY is not configured on the server. Rejecting admin request.");
      return NextResponse.json(
        { error: "Administrative endpoint is disabled. Server configuration required." },
        { status: 503 }
      );
    }

    const adminKey = req.headers.get("x-admin-secret")?.trim();

    if (!adminKey || !safeCompare(adminKey, expectedKey)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid administrative credentials." },
        { status: 403 }
      );
    }

    const { supplierId } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Verification status is required" },
        { status: 400 }
      );
    }

    const result = await adminUpdateSupplierStatus(supplierId, status, adminNotes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Supplier verification status updated to ${status}.`,
    });
  } catch (err: unknown) {
    console.error("PATCH /api/admin/supplier/[supplierId]/status error:", err);
    return NextResponse.json(
      { error: "Failed to update supplier verification status" },
      { status: 500 }
    );
  }
}
