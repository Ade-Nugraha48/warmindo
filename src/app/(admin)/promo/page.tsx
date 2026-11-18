import * as React from "react";
import { connection } from "next/server";
import { getPassiveCustomers, getCampaignLogs } from "@/app/(admin)/promo/actions";
import { PromoManagementView } from "@/components/features/PromoManagementView";

export const instant = false;

export default async function PromoPage() {
  await connection();
  const [initialPassiveCustomers, initialCampaignLogs] = await Promise.all([
    getPassiveCustomers(0), // Fetch all customers to populate KPI metrics and client filtering
    getCampaignLogs(),
  ]);

  return (
    <PromoManagementView
      initialPassiveCustomers={initialPassiveCustomers}
      initialCampaignLogs={initialCampaignLogs}
    />
  );
}
