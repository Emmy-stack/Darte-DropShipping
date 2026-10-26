import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { getProductById } from "@/data/products";
import { mapPrismaProductToProduct } from "@/lib/types/productMapper";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID parameter is required" },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured()) {
      try {
        const dbProduct = await prisma.product.findFirst({
          where: {
            OR: [{ id: productId }, { slug: productId }],
          },
        });

        if (dbProduct) {
          return NextResponse.json({
            success: true,
            product: mapPrismaProductToProduct(dbProduct),
          });
        }
      } catch (dbErr) {
        console.warn("Database query failed in /api/products/[productId]:", dbErr);
      }
    }

    // Fallback to mock catalogue
    const mockProduct = getProductById(productId);
    if (mockProduct) {
      return NextResponse.json({
        success: true,
        product: mockProduct,
      });
    }

    return NextResponse.json(
      { success: false, error: "Product not found in catalogue" },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("Error in GET /api/products/[productId]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve product" },
      { status: 500 }
    );
  }
}
