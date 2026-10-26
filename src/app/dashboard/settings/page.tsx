import React from "react";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard";
import StoreSettingsView from "@/components/store/StoreSettingsView";

export const metadata: Metadata = {
  title: "Settings — Darté Seller Store",
  description: "Configure store policies, Nigerian Naira pricing, and contact settings on Darté.",
};

export default function SettingsPage() {
  return (
    <DashboardLayout pageTitle="Settings">
      <StoreSettingsView />
    </DashboardLayout>
  );
}

