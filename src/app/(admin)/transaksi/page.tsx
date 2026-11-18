import * as React from "react";
import { getTodayTransactions } from "@/app/(admin)/transaksi/actions";
import { TransactionManagementView } from "@/components/features/TransactionManagementView";

export default async function TransaksiPage() {
  const initialTransactions = await getTodayTransactions();

  return <TransactionManagementView initialTransactions={initialTransactions} />;
}
