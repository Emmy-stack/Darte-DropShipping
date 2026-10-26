import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isSlugAvailable } from "@/lib/db/storeProfile";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/store/check-slug?slug=...
 * Checks whether a given slug is available and valid for the authenticated seller.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";

    if (!slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          error: "Slug query parameter is required.",
        },
        { status: 400 }
      );
    }

    const result = await isSlugAvailable(slug, userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error("Error checking slug availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check slug availability." },
      { status: 500 }
    );
  }
}
