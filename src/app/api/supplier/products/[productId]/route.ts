import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getSupplierByClerkId,
  getSupplierProductById,
  updateSupplierProduct,
  deleteOrDeactivateSupplierProduct,
} from "@/lib/db/supplier";
import { SupplierProductInput } from "@/types/supplier";

export const dynamic = "force-dynamic";

/**
 * GET /api/supplier/products/[productId]
 * Fetches a single product owned by the authenticated supplier.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can access this resource." },
        { status: 403 }
      );
    }

    const { productId } = await params;
    const product = await getSupplierProductById(supplier.id, productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or not owned by your company." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err: unknown) {
    console.error("GET /api/supplier/products/[productId] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve product" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/supplier/products/[productId]
 * Updates product details, wholesale price, stock, or status.
 * Enforces ownership.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can edit products." },
        { status: 403 }
      );
    }

    const { productId } = await params;
    const body = (await req.json()) as Partial<SupplierProductInput>;

    const result = await updateSupplierProduct(supplier.id, productId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      product: result.product,
    });
  } catch (err: unknown) {
    console.error("PATCH /api/supplier/products/[productId] error:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/supplier/products/[productId]
 * Deactivates or removes a product owned by the supplier.
 * Preserves purchase history by archiving rather than hard-deleting when orders exist.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can manage products." },
        { status: 403 }
      );
    }

    const { productId } = await params;
    const result = await deleteOrDeactivateSupplierProduct(supplier.id, productId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action: result.action,
      message:
        result.action === "archived"
          ? "Product was deactivated to preserve order history."
          : "Product was successfully deleted.",
    });
  } catch (err: unknown) {
    console.error("DELETE /api/supplier/products/[productId] error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
