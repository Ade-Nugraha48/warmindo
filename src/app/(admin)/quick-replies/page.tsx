import * as React from "react";
import { connection } from "next/server";
import { getQuickReplies } from "@/app/(admin)/quick-replies/actions";
import {
  getCampaignLogs,
  getPassiveCustomers,
} from "@/app/(admin)/promo/actions";
import { QuickRepliesView } from "@/components/features/QuickRepliesView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function QuickRepliesContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const [{ q }, initialTemplates, passiveCustomers, campaignLogs] =
    await Promise.all([
      searchParams,
      getQuickReplies(),
      getPassiveCustomers(0),
      getCampaignLogs(),
    ]);

  return (
    <QuickRepliesView
      initialTemplates={initialTemplates}
      passiveCustomers={passiveCustomers}
      campaignLogs={campaignLogs}
      initialSearchQuery={q || ""}
    />
  );
}

export default function QuickRepliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <QuickRepliesContent searchParams={searchParams} />
    </React.Suspense>
  );
}
