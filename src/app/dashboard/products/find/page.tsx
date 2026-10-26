import React from "react";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import FindProductsView from "@/components/products/FindProductsView";

export const metadata: Metadata = {
  title: "Find Products — Darté Catalog",
  description: "Discover high-margin verified dropshipping products you can sell with Darté across Nigeria.",
};

export default function FindProductsPage() {
  return (
    <DashboardLayout pageTitle="Find Products">
      <FindProductsView />
    </DashboardLayout>
  );
}
