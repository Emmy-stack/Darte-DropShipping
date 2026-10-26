import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicStoreBySlug } from "@/lib/db/storefront";
import StorefrontCheckoutView from "@/components/storefront/StorefrontCheckoutView";
import { StoreCartProvider } from "@/context/StoreCartContext";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await getPublicStoreBySlug(slug);

  if (!resolution) {
    return {
      title: "Store Not Found | Darté",
    };
  }

  return {
    title: `Checkout | ${resolution.store.name} — Darté`,
    description: `Complete your order securely from ${resolution.store.name} on Darté.`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const resolution = await getPublicStoreBySlug(slug);

  if (!resolution || !resolution.store.isPublished) {
    notFound();
  }

  return (
    <StoreCartProvider storeSlug={resolution.store.slug}>
      <StorefrontCheckoutView store={resolution.store} />
    </StoreCartProvider>
  );
}
