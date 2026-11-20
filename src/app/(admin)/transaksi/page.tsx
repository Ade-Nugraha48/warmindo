import * as React from "react";
import { connection } from "next/server";
import {
  getMenuCatalog,
  getTodayTransactions,
} from "@/app/(admin)/transaksi/actions";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { getQuickReplies } from "@/app/(admin)/quick-replies/actions";
import { getServerNowMs } from "@/lib/server-time";
import { TransactionManagementView } from "@/components/features/TransactionManagementView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function TransaksiContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const [
    { q },
    initialTransactions,
    menuCatalog,
    initialCustomers,
    quickReplies,
    initialNowMs,
  ] = await Promise.all([
    searchParams,
    getTodayTransactions(),
    getMenuCatalog(),
    getCustomers(),
    getQuickReplies(),
    getServerNowMs(),
  ]);

  return (
    <TransactionManagementView
      initialTransactions={initialTransactions}
      menuCatalog={menuCatalog}
      initialCustomers={initialCustomers}
      quickReplies={quickReplies}
      initialNowMs={initialNowMs}
      initialSearchQuery={q || ""}
    />
  );
}

export default function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <TransaksiContent searchParams={searchParams} />
    </React.Suspense>
  );
}
