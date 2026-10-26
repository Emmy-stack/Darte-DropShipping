import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateSellerStoreProductPrice,
  removeSellerStoreProduct,
} from "@/lib/db/sellerProducts";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

/**
 * PATCH /api/seller/products/[productId]
 * Updates the seller's custom selling price for a product in their store.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to update store products" },
        { status: 401 }
      );
    }

    const { productId } = await params;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID parameter is required" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { customSellingPrice } = body;

    if (
      customSellingPrice === undefined ||
      typeof customSellingPrice !== "number" ||
      !Number.isFinite(customSellingPrice) ||
      customSellingPrice <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "A valid positive customSellingPrice number is required" },
        { status: 400 }
      );
    }

    const result = await updateSellerStoreProductPrice(userId, productId, customSellingPrice);

    return NextResponse.json({
      success: true,
      record: result.record,
      message: "Selling price updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error in PATCH /api/seller/products/[productId]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update product price";

    if (msg.includes("not found")) {
      return NextResponse.json({ success: false, error: msg }, { status: 404 });
    }

    if (msg.includes("cannot be lower") || msg.includes("valid positive")) {
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to update product price" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seller/products/[productId]
 * Removes a product from the authenticated seller's store.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to remove store products" },
        { status: 401 }
      );
    }

    const { productId } = await params;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID parameter is required" },
        { status: 400 }
      );
    }

    await removeSellerStoreProduct(userId, productId);

    return NextResponse.json({
      success: true,
      message: "Product removed from your store",
    });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/seller/products/[productId]:", error);
    const msg = error instanceof Error ? error.message : "Failed to remove product from store";

    if (msg.includes("not found")) {
      return NextResponse.json({ success: false, error: msg }, { status: 404 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove product from store" },
      { status: 500 }
    );
  }
}
