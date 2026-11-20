import * as React from "react";
import { connection } from "next/server";
import {
  getPassiveCustomers,
  getCampaignLogs,
} from "@/app/(admin)/promo/actions";
import { PromoManagementView } from "@/components/features/PromoManagementView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function PromoContent() {
  await connection();
  const [initialPassiveCustomers, initialCampaignLogs] = await Promise.all([
    getPassiveCustomers(0),
    getCampaignLogs(),
  ]);

  return (
    <PromoManagementView
      initialPassiveCustomers={initialPassiveCustomers}
      initialCampaignLogs={initialCampaignLogs}
    />
  );
}

export default function PromoPage() {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <PromoContent />
    </React.Suspense>
  );
}
