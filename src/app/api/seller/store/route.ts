import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getSellerStoreProfile,
  saveSellerStoreProfile,
  StoreProfileInput,
} from "@/lib/db/storeProfile";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/store
 * Retrieves the current authenticated seller's store profile and profile completeness.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to manage your store." },
        { status: 401 }
      );
    }

    const { profile, completeness } = await getSellerStoreProfile(userId);

    return NextResponse.json({
      success: true,
      profile,
      completeness,
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/seller/store:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store profile." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seller/store
 * Creates or updates the authenticated seller's store profile.
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to update your store." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as StoreProfileInput;

    const result = await saveSellerStoreProfile(userId, body);

    return NextResponse.json({
      success: true,
      message: "Store profile saved successfully.",
      profile: result.profile,
      completeness: result.completeness,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update store profile.";
    const status = message.includes("already taken") || message.includes("reserved") ? 409 : 400;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

/**
 * POST /api/seller/store
 * Alias for PUT to handle forms or clients submitting with POST.
 */
export async function POST(req: NextRequest) {
  return PUT(req);
}

/**
 * PATCH /api/seller/store
 * Handles partial updates (e.g. visibility toggles, single tab saves) cleanly.
 */
export async function PATCH(req: NextRequest) {
  return PUT(req);
}
