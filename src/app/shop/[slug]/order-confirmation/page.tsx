import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicStoreBySlug } from "@/lib/db/storefront";
import { verifyAndFulfillOrder, getPublicOrderByReference } from "@/lib/db/orders";
import StorefrontOrderConfirmationView from "@/components/storefront/StorefrontOrderConfirmationView";
import { StoreCartProvider } from "@/context/StoreCartContext";

interface OrderConfirmationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: OrderConfirmationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await getPublicStoreBySlug(slug);

  if (!resolution) {
    return { title: "Store Not Found | Darté" };
  }

  return {
    title: `Order Status | ${resolution.store.name} — Darté`,
    description: `Order confirmation and verification status for ${resolution.store.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { slug } = await params;
  const { reference, trxref } = await searchParams;

  const resolution = await getPublicStoreBySlug(slug);
  if (!resolution || !resolution.store.isPublished) {
    notFound();
  }

  const txRef = reference || trxref;

  if (!txRef) {
    return (
      <StoreCartProvider storeSlug={resolution.store.slug}>
        <StorefrontOrderConfirmationView
          store={resolution.store}
          order={null}
          verifyStatus="missing_reference"
          verifyError="No payment reference was provided in the return URL."
        />
      </StoreCartProvider>
    );
  }

  // Authoritatively verify the order with Paystack
  const verifyResult = await verifyAndFulfillOrder(txRef);

  let displayOrder = verifyResult.order || null;
  if (!displayOrder) {
    displayOrder = await getPublicOrderByReference(txRef);
  }

  return (
    <StoreCartProvider storeSlug={resolution.store.slug}>
      <StorefrontOrderConfirmationView
        store={resolution.store}
        order={displayOrder}
        verifyStatus={verifyResult.status}
        verifyError={verifyResult.error}
        alreadyPaid={verifyResult.alreadyPaid}
      />
    </StoreCartProvider>
  );
}
