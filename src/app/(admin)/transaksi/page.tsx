import * as React from "react";
import { connection } from "next/server";
import { getTodayTransactions } from "@/app/(admin)/transaksi/actions";
import { TransactionManagementView } from "@/components/features/TransactionManagementView";

export const instant = false;

export default async function TransaksiPage() {
  await connection();
  const initialTransactions = await getTodayTransactions();

  return <TransactionManagementView initialTransactions={initialTransactions} />;
}
