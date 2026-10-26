import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getSupplierByClerkId,
  getSupplierProducts,
  createSupplierProduct,
} from "@/lib/db/supplier";
import { SupplierProductInput } from "@/types/supplier";

export const dynamic = "force-dynamic";

/**
 * GET /api/supplier/products
 * Retrieves products owned by the authenticated supplier.
 */
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const products = await getSupplierProducts(supplier.id, { status, search });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (err: unknown) {
    console.error("GET /api/supplier/products error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve supplier products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supplier/products
 * Creates a new product for the authenticated supplier.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await getSupplierByClerkId(userId);
    if (!supplier) {
      return NextResponse.json(
        { error: "Access denied. Only registered suppliers can add products." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as SupplierProductInput;
    const result = await createSupplierProduct(supplier.id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      product: result.product,
    });
  } catch (err: unknown) {
    console.error("POST /api/supplier/products error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
