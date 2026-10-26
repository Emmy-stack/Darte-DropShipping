import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  uploadStoreLogo,
  deleteStoreLogo,
} from "@/lib/storage/storeLogoService";

export const dynamic = "force-dynamic";

/**
 * POST /api/seller/store/logo
 * Securely uploads a store logo to Supabase Storage and updates the StoreProfile record.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Sign in required." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/octet-stream";
    const fileSize = file.size;
    const originalFilename = file instanceof File ? file.name : undefined;

    const result = await uploadStoreLogo({
      sellerId: userId,
      fileBuffer,
      mimeType,
      fileSize,
      originalFilename,
    });

    return NextResponse.json({
      success: true,
      logoUrl: result.logoUrl,
      storagePath: result.storagePath,
      message: "Store logo uploaded and saved successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload store logo.";
    const isValidation =
      message.includes("Invalid") ||
      message.includes("exceeds") ||
      message.includes("Unsupported") ||
      message.includes("empty") ||
      message.includes("mismatch") ||
      message.includes("SVG");

    return NextResponse.json(
      { success: false, error: message },
      { status: isValidation ? 400 : 500 }
    );
  }
}

/**
 * DELETE /api/seller/store/logo
 * Removes the seller's store logo from Supabase Storage and clears the database record.
 */
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Sign in required." },
        { status: 401 }
      );
    }

    const result = await deleteStoreLogo({ sellerId: userId });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to remove store logo.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
