import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PackageX, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { getProductById, getAllProducts } from "@/data/products";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapPrismaProductToProduct } from "@/lib/types/productMapper";
import ProductDetails from "@/components/products/ProductDetails";
import { Product } from "@/lib/types/product";

interface PageProps {
  params: Promise<{ productId: string }>;
}

async function resolveProduct(productId: string): Promise<Product | null> {
  if (isDatabaseConfigured()) {
    try {
      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [{ id: productId }, { slug: productId }],
        },
      });
      if (dbProduct) {
        return mapPrismaProductToProduct(dbProduct);
      }
    } catch {
      // Fallback to static catalogue if DB query fails
    }
  }
  return getProductById(productId) || null;
}

export async function generateStaticParams() {
  if (isDatabaseConfigured()) {
    try {
      const dbProducts = await prisma.product.findMany({ select: { id: true } });
      if (dbProducts.length > 0) {
        return dbProducts.map((p) => ({ productId: p.id }));
      }
    } catch {
      // Fallback
    }
  }
  const products = getAllProducts();
  return products.map((product) => ({
    productId: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await resolveProduct(productId);

  if (!product) {
    return {
      title: "Product Not Found — Darté",
    };
  }

  return {
    title: `${product.name} — Darté Product Discovery`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const product = await resolveProduct(productId);

  if (!product) {
    return (
      <DashboardLayout pageTitle="Product Details">
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7]/70 text-[#16A34A] flex items-center justify-center mb-4 shadow-xs">
            <PackageX className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Product Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
            The product you are looking for may have been removed or does not exist in the catalog.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/products/find"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Find Products</span>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={product.name}>
      <ProductDetails product={product} />
    </DashboardLayout>
  );
}
