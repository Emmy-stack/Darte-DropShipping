import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/data/products";
import { mapPrismaProductToProduct } from "@/lib/types/productMapper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let products = [];

    if (isDatabaseConfigured()) {
      try {
        const conditions: Prisma.ProductWhereInput[] = [
          { status: "ACTIVE" },
          {
            OR: [
              { supplierId: null },
              {
                supplier: {
                  verificationStatus: "APPROVED",
                },
              },
            ],
          },
        ];

        if (category && category !== "All") {
          conditions.push({ category });
        }

        if (search) {
          conditions.push({
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { shortDescription: { contains: search, mode: "insensitive" } },
              { supplierName: { contains: search, mode: "insensitive" } },
            ],
          });
        }

        const whereClause: Prisma.ProductWhereInput = {
          AND: conditions,
        };

        const dbProducts = await prisma.product.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        });

        if (dbProducts.length > 0) {
          products = dbProducts.map(mapPrismaProductToProduct);
        } else {
          // If the DB is configured but empty (seed not yet run), fall back to mock products
          products = MOCK_PRODUCTS;
        }
      } catch (dbErr) {
        console.warn("Database query failed in /api/products, using mock catalogue:", dbErr);
        products = MOCK_PRODUCTS;
      }
    } else {
      products = MOCK_PRODUCTS;
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve products" },
      { status: 500 }
    );
  }
}
