import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  ClipboardList,
  Package,
  Wallet,
  Search,
  PlusCircle,
  Store as StoreIcon,
  Sparkles,
} from "lucide-react";
import { getFullUserContext } from "@/lib/db/profileStore";
import { Role } from "@/lib/types/profile";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import GettingStarted from "@/components/dashboard/GettingStarted";
import RecentOrders from "@/components/dashboard/RecentOrders";
import ProductsPreview from "@/components/dashboard/ProductsPreview";
import StorePreview from "@/components/dashboard/StorePreview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let context = null;
  let firstName = "";

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured =
    publishableKey &&
    !publishableKey.includes("REPLACE_WITH_YOUR") &&
    publishableKey.startsWith("pk_");

  let userId: string | null = null;
  let clerkUser = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (userId) {
      clerkUser = await currentUser();
      context = await getFullUserContext(userId);
    }
  } catch (err) {
    // Graceful fallback for local preview if auth is not yet established
    console.warn("Clerk auth or profile read note:", err);
  }

  if (isKeyConfigured && !userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  if (userId) {
    if (clerkUser?.firstName) {
      firstName = clerkUser.firstName;
    } else if (clerkUser?.fullName) {
      firstName = clerkUser.fullName.split(" ")[0];
    }

    // Route based on role & onboarding status
    if (context?.profile?.role === Role.SUPPLIER && context.profile.onboardingCompleted) {
      redirect("/dashboard/supplier");
    }

    if (!context?.profile || !context.profile.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  const storeName =
    context?.sellerProfile?.storeName || context?.store?.name || undefined;
  const storeSlug = context?.store?.slug || undefined;
  const storeCategory =
    context?.sellerProfile?.storeCategory || context?.store?.category || undefined;
  const hasStore = Boolean(storeName && storeSlug);

  const displayName = firstName || storeName || "there";

  return (
    <DashboardLayout
      pageTitle="Overview"
      storeName={storeName}
      storeSlug={storeSlug}
    >
      {/* 1. Welcome Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Commerce Operating System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-[family-name:var(--font-heading)]">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-[#6B7280] mt-1.5">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {hasStore && storeSlug && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-[#F8FAF9] border border-[#E5E7EB] px-3.5 py-2 rounded-xl text-xs font-mono text-[#374151] flex items-center gap-2">
              <span className="text-[#16A34A]">🔗</span>
              <span>darte.shop/{storeSlug}</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Four Primary Summary Cards */}
      <section aria-label="Business Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            label="Total Sales"
            value="₦0"
            supportingText="No sales yet"
            icon={TrendingUp}
          />
          <StatCard
            label="Orders"
            value="0"
            supportingText="No orders yet"
            icon={ClipboardList}
          />
          <StatCard
            label="Products"
            value="0"
            supportingText="Start adding products"
            icon={Package}
          />
          <StatCard
            label="Profit"
            value="₦0"
            supportingText="No profit recorded yet"
            icon={Wallet}
          />
        </div>
      </section>

      {/* 3. Getting Started / Launch Guide */}
      <section aria-label="Store Setup Progress">
        <GettingStarted hasStore={hasStore} />
      </section>

      {/* 4. Quick Actions: Start Building Your Business */}
      <section aria-label="Quick Actions">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#111827] font-[family-name:var(--font-heading)]">
            Start building your business
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Essential actions to take your dropshipping brand from zero to your first order.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <QuickActionCard
            title="Find Products"
            description="Discover products you can sell."
            ctaText="Find Products"
            href="/dashboard/products/find"
            icon={Search}
            badge="Catalog"
            isPrimary
          />

          <QuickActionCard
            title="Add Product"
            description="Add a product to your store."
            ctaText="Add Product"
            href="/dashboard/products"
            icon={PlusCircle}
          />

          <QuickActionCard
            title="Build Your Store"
            description="Customize your storefront."
            ctaText="Build Store"
            href="/dashboard/store"
            icon={StoreIcon}
          />

          <QuickActionCard
            title="View Orders"
            description="Track your customer orders."
            ctaText="View Orders"
            href="/dashboard/orders"
            icon={ClipboardList}
          />
        </div>
      </section>

      {/* 5. Products Preview & Store Preview (2 Columns) */}
      <section aria-label="Catalog and Storefront Preview">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductsPreview />
          <StorePreview
            storeName={storeName}
            storeSlug={storeSlug}
            category={storeCategory}
            hasStore={hasStore}
          />
        </div>
      </section>

      {/* 6. Recent Orders Empty State */}
      <section aria-label="Recent Orders">
        <RecentOrders />
      </section>
    </DashboardLayout>
  );
}
