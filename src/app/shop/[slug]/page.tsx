import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicStoreProducts,
  getPublicStoreBySlug,
} from "@/lib/db/storefront";
import StorefrontCatalogueView from "@/components/storefront/StorefrontCatalogueView";

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

/**
 * Generate SEO and social share metadata dynamically for the public storefront.
 */
export async function generateMetadata({
  params,
}: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await getPublicStoreBySlug(slug);

  if (!resolution) {
    return {
      title: "Store Not Found | Darté",
      description: "The requested storefront does not exist or is currently unavailable.",
      robots: { index: false, follow: false },
    };
  }

  const { store } = resolution;
  const title = `${store.name} | Official Storefront — Darté`;
  const description =
    store.description ||
    `Browse quality curated products from ${store.name} with fast nationwide delivery across Nigeria.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: store.logoUrl ? [{ url: store.logoUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: store.logoUrl ? [store.logoUrl] : undefined,
    },
    robots: {
      index: store.isPublished,
      follow: store.isPublished,
    },
  };
}

/**
 * Public Storefront Page: /shop/[slug]
 * Publicly browsable by customers without authentication.
 */
export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const data = await getPublicStoreProducts(slug);

  if (!data) {
    notFound();
  }

  return (
    <StorefrontCatalogueView
      store={data.store}
      initialProducts={data.products}
      categories={data.categories}
    />
  );
}
