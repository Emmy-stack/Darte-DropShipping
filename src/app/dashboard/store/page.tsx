import React from "react";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import StoreProfileView from "@/components/store/StoreProfileView";

export const metadata: Metadata = {
  title: "Store Profile — Darté Seller Store",
  description: "Configure and manage your dropshipping store profile, URL slug, and contact details on Darté.",
};

export default function StoreProfilePage() {
  return (
    <DashboardLayout pageTitle="Store Profile">
      <StoreProfileView />
    </DashboardLayout>
  );
}

