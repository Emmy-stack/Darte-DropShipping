import React from "react";
import { DashboardLayout, ComingSoonPlaceholder } from "@/components/dashboard";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <DashboardLayout pageTitle="Analytics">
      <ComingSoonPlaceholder
        title="Commerce Analytics & Insights"
        description="Deep financial and marketing analytics designed specifically for African social commerce. Track real gross profit, ad performance, and customer lifetime value."
        icon={BarChart3}
        features={[
          "Net profit analysis accounting for product costs & delivery fees",
          "Traffic attribution tracking WhatsApp vs Instagram vs TikTok",
          "Customer repeat purchase rate and average order value (AOV)",
          "Real-time payout forecasting into your Nigerian bank account",
        ]}
      />
    </DashboardLayout>
  );
}
