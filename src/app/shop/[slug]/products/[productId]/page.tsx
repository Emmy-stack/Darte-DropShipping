import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicStoreProduct } from "@/lib/db/storefront";
import PublicProductDetailView from "@/components/storefront/PublicProductDetailView";
import { formatNaira } from "@/lib/utils/formatCurrency";

interface ProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export const dynamic = "force-dynamic";

/**
 * Generate dynamic SEO and social graph metadata for a public product.
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug, productId } = await params;
  const data = await getPublicStoreProduct(slug, productId);

  if (!data) {
    return {
      title: "Product Not Found | Darté",
      description: "The requested product does not exist in this storefront.",
      robots: { index: false, follow: false },
    };
  }

  const { store, product } = data;
  const title = `${product.name} — ${formatNaira(product.price)} | ${store.name}`;
  const description =
    product.shortDescription ||
    `Order ${product.name} for ${formatNaira(product.price)} from ${store.name} on Darté. Fast nationwide dispatch.`;

  const primaryImage = product.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
    robots: {
      index: store.isPublished,
      follow: store.isPublished,
    },
  };
}

/**
 * Public Product Detail Page: /shop/[slug]/products/[productId]
 * Publicly browsable by customers without requiring authentication.
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug, productId } = await params;
  const data = await getPublicStoreProduct(slug, productId);

  if (!data) {
    notFound();
  }

  return (
    <PublicProductDetailView
      store={data.store}
      product={data.product}
    />
  );
}
