"use client";

import * as React from "react";
import { AlertTriangle, Coffee, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markOrderServed, grantCompensation } from "@/app/(admin)/transaksi/actions";
import type { TransactionRecord } from "@/types/transaction.record";

interface SlaDelayAlertProps {
  transactions: TransactionRecord[];
  onTransactionUpdated?: (updated: TransactionRecord) => void;
}

export function SlaDelayAlert({ transactions, onTransactionUpdated }: SlaDelayAlertProps) {
  const [currentTime, setCurrentTime] = React.useState(() => new Date());

  // Update current time every 10 seconds for real-time SLA tracking
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter delayed transactions:
  // Either unserved and elapsed > 20 mins, OR served with serving duration > 20 mins
  const delayedOrders = transactions.filter((t) => {
    const orderDate = new Date(t.waktu_pesan);
    if (!t.waktu_saji) {
      const diffMinutes = (currentTime.getTime() - orderDate.getTime()) / (1000 * 60);
      return diffMinutes > 20;
    }
    const servedDate = new Date(t.waktu_saji);
    const diffMinutes = (servedDate.getTime() - orderDate.getTime()) / (1000 * 60);
    return diffMinutes > 20 && !t.kompensasi_diberikan;
  });

  if (delayedOrders.length === 0) {
    return null;
  }

  const handleGrantCompensation = async (trx: TransactionRecord) => {
    await grantCompensation(trx.id);
    if (onTransactionUpdated) {
      onTransactionUpdated({ ...trx, kompensasi_diberikan: true });
    }
  };

  const handleMarkServed = async (trx: TransactionRecord) => {
    const res = await markOrderServed(trx.id);
    if (onTransactionUpdated) {
      onTransactionUpdated({ ...trx, waktu_saji: res.waktu_saji });
    }
  };

  return (
    <div className="space-y-3">
      {delayedOrders.map((order) => {
        const orderDate = new Date(order.waktu_pesan);
        const elapsedMins = Math.floor(
          (currentTime.getTime() - orderDate.getTime()) / (1000 * 60)
        );

        return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-xl border-2 border-red-500 bg-red-50 p-4 shadow-sm dark:border-red-700 dark:bg-red-950/40 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                <AlertTriangle className="size-5 animate-bounce" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-red-900 dark:text-red-100">
                    PERINGATAN WAKTU TUNGGU &gt; 20 MENIT (SLA JAM SIBUK)
                  </span>
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
                    {order.is_jam_sibuk ? "Rush Hour" : "Standar"}
                  </Badge>
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-1">
                    <Clock className="size-3" />
                    Menunggu {elapsedMins} menit
                  </span>
                </div>

                <p className="mt-1 text-xs text-red-800 dark:text-red-300">
                  Pesanan <span className="font-bold underline">{order.menu_pesanan}</span> untuk pelanggan{" "}
                  <span className="font-bold">{order.customer_nama}</span> telah melewati batas SLA (20 menit)!
                  Kasir diwajibkan memberikan kompensasi gratis <strong>Es Teh Manis</strong> atau <strong>Kerupuk Kaleng</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {!order.kompensasi_diberikan ? (
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 shadow-xs"
                  onClick={() => handleGrantCompensation(order)}
                >
                  <Coffee className="size-3.5" />
                  Beri Kompensasi (Es Teh/Kerupuk)
                </Button>
              ) : (
                <Badge className="bg-emerald-600 text-white text-xs px-2.5 py-1 flex items-center gap-1">
                  <Check className="size-3" />
                  Kompensasi Diberikan
                </Badge>
              )}

              {!order.waktu_saji && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-red-300 text-red-800 hover:bg-red-100 dark:border-red-800 dark:text-red-200"
                  onClick={() => handleMarkServed(order)}
                >
                  Tandai Selesai Saji
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
