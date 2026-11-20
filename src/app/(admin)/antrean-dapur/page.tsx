import * as React from "react";
import { connection } from "next/server";
import { getTodayTransactions } from "@/app/(admin)/transaksi/actions";
import { INITIAL_DEMO_CHEFS } from "@/lib/demo-data";
import { getServerNowMs } from "@/lib/server-time";
import { KitchenQueueView } from "@/components/features/KitchenQueueView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function AntreanDapurContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const [{ q }, initialOrders, initialNowMs] = await Promise.all([
    searchParams,
    getTodayTransactions(),
    getServerNowMs(),
  ]);

  return (
    <KitchenQueueView
      initialOrders={initialOrders}
      chefs={INITIAL_DEMO_CHEFS}
      initialNowMs={initialNowMs}
      initialSearchQuery={q || ""}
    />
  );
}

export default function AntreanDapurPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <AntreanDapurContent searchParams={searchParams} />
    </React.Suspense>
  );
}
