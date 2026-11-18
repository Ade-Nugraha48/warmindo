"use client";

import * as React from "react";
import { Receipt, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { SlaDelayAlert } from "@/components/features/SlaDelayAlert";
import { TransactionForm } from "@/components/features/TransactionForm";
import { TodayTransactionsTable } from "@/components/features/TodayTransactionsTable";
import { formatRupiah } from "@/lib/formatters";
import type { TransactionRecord } from "@/types/transaction.record";

interface TransactionManagementViewProps {
  initialTransactions: TransactionRecord[];
}

export function TransactionManagementView({
  initialTransactions,
}: TransactionManagementViewProps) {
  const [transactions, setTransactions] =
    React.useState<TransactionRecord[]>(initialTransactions);

  const handleTransactionCreated = (newTrx: TransactionRecord) => {
    setTransactions((prev) => [newTrx, ...prev]);
  };

  const handleTransactionUpdated = (updated: TransactionRecord) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const [nowTime, setNowTime] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Metrics
  const totalOmzet = transactions.reduce((acc, curr) => acc + curr.total_harga, 0);
  const totalPorsi = transactions.reduce((acc, curr) => acc + curr.jumlah_porsi, 0);

  const delayedOrdersCount = React.useMemo(() => {
    if (!nowTime) return 0;
    return transactions.filter((t) => {
      if (t.waktu_saji) return false;
      const diff = (nowTime - new Date(t.waktu_pesan).getTime()) / (1000 * 60);
      return diff > 20;
    }).length;
  }, [transactions, nowTime]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Receipt className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Transaksi Kasir & Sistem Stempel Loyalitas
          </h1>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pencatatan nota kasir, kalkulasi otomatis stempel member, dan pemantauan SLA waktu saji pesanan (FR 3.1 - FR 3.5).
        </p>
      </div>

      {/* SLA Delay Alert Component (Peringatan Merah Otomatis jika > 20 Menit) */}
      <SlaDelayAlert
        transactions={transactions}
        onTransactionUpdated={handleTransactionUpdated}
      />

      {/* Quick KPI Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Receipt className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Transaksi Hari Ini</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {transactions.length} Nota ({totalPorsi} Porsi)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <DollarSign className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Total Omzet Hari Ini</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(totalOmzet)}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl border p-3.5 shadow-xs transition-colors ${
            delayedOrdersCount > 0
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          }`}
        >
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${
              delayedOrdersCount > 0
                ? "bg-red-600 text-white animate-pulse"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
            }`}
          >
            {delayedOrdersCount > 0 ? (
              <AlertTriangle className="size-4.5" />
            ) : (
              <Clock className="size-4.5" />
            )}
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Peringatan Keterlambatan (&gt;20 Mnt)</div>
            <div
              className={`text-lg font-bold ${
                delayedOrdersCount > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {delayedOrdersCount > 0
                ? `${delayedOrdersCount} Pesanan Tertunda`
                : "Semua Pesanan Lancar (<15 mnt)"}
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Order Entry Form */}
      <TransactionForm onTransactionCreated={handleTransactionCreated} />

      {/* Today's Transactions Table */}
      <TodayTransactionsTable
        transactions={transactions}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </div>
  );
}
