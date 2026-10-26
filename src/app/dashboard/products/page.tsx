import React from "react";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import MyProductsView from "@/components/products/MyProductsView";

export const metadata: Metadata = {
  title: "My Products — Darté Store",
  description: "Manage products added to your Darté store catalog, adjust retail pricing margins, and monitor fulfillment.",
};

export default function MyProductsPage() {
  return (
    <DashboardLayout pageTitle="My Products">
      <MyProductsView />
    </DashboardLayout>
  );
}
