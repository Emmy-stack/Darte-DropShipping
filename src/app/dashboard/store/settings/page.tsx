import React from "react";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import StoreSettingsView from "@/components/store/StoreSettingsView";

export const metadata: Metadata = {
  title: "Store Settings — Darté Seller Store",
  description: "Manage your store policies, delivery guidelines, currency, and customer support rules on Darté.",
};

export default function StoreSettingsPage() {
  return (
    <DashboardLayout pageTitle="Store Settings">
      <StoreSettingsView />
    </DashboardLayout>
  );
}
