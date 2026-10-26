import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getSellerStoreProducts,
  addProductToSellerStore,
} from "@/lib/db/sellerProducts";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/products
 * Retrieves all products saved in the authenticated seller's store.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to view your store products" },
        { status: 401 }
      );
    }

    const products = await getSellerStoreProducts(userId);

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/seller/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/products
 * Adds a catalogue product to the authenticated seller's store with optional custom selling price.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to add products to your store" },
        { status: 401 }
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

    const { productId, customSellingPrice } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid productId string is required" },
        { status: 400 }
      );
    }

    if (customSellingPrice !== undefined) {
      if (typeof customSellingPrice !== "number" || !Number.isFinite(customSellingPrice) || customSellingPrice <= 0) {
        return NextResponse.json(
          { success: false, error: "customSellingPrice must be a valid positive number" },
          { status: 400 }
        );
      }
    }

    const result = await addProductToSellerStore(userId, productId, customSellingPrice);

    return NextResponse.json(
      {
        success: true,
        isNew: result.isNew,
        record: result.record,
        message: result.isNew
          ? "Product added to your store"
          : "Product already in store; price updated",
      },
      { status: result.isNew ? 201 : 200 }
    );
  } catch (error: unknown) {
    console.error("Error in POST /api/seller/products:", error);
    const msg = error instanceof Error ? error.message : "Failed to add product to store";

    if (msg.includes("not found")) {
      return NextResponse.json({ success: false, error: msg }, { status: 404 });
    }

    if (msg.includes("cannot be lower") || msg.includes("valid positive")) {
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: "Failed to add product to store" },
      { status: 500 }
    );
  }
}
