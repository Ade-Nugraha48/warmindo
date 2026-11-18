"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Coffee,
  AlertTriangle,
  Flame,
  Check,
} from "lucide-react";
import {
  markOrderServed,
  grantCompensation,
} from "@/app/(admin)/transaksi/actions";
import type { TransactionRecord } from "@/types/transaction.record";
import { maskPhoneNumber, formatRupiah } from "@/lib/formatters";

interface TodayTransactionsTableProps {
  transactions: TransactionRecord[];
  onTransactionUpdated?: (updated: TransactionRecord) => void;
}

export function TodayTransactionsTable({
  transactions,
  onTransactionUpdated,
}: TodayTransactionsTableProps) {
  const [currentTime, setCurrentTime] = React.useState(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkServed = async (trx: TransactionRecord) => {
    const res = await markOrderServed(trx.id);
    if (onTransactionUpdated) {
      onTransactionUpdated({ ...trx, waktu_saji: res.waktu_saji });
    }
  };

  const handleGrantCompensation = async (trx: TransactionRecord) => {
    await grantCompensation(trx.id);
    if (onTransactionUpdated) {
      onTransactionUpdated({ ...trx, kompensasi_diberikan: true });
    }
  };

  const formatTimeOnly = (isoString: string | null) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-950 font-sans">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Riwayat Transaksi Hari Ini
          </span>
          <Badge variant="secondary" className="text-xs">
            {transactions.length} Pesanan
          </Badge>
        </div>
        <span className="text-xs text-zinc-400">
          Target SLA Saji: &lt; 15 menit (Kompensasi jika &gt; 20 menit)
        </span>
      </div>

      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[90px] text-xs font-semibold uppercase text-zinc-500">
              Nota
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Pelanggan
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Menu Pesanan
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Porsi
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Total Bayar
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Waktu Pesan
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Status Waktu Saji (SLA)
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Stempel
            </TableHead>
            <TableHead className="text-right text-xs font-semibold uppercase text-zinc-500">
              Aksi Kasir
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-xs text-zinc-400">
                Belum ada transaksi diinput hari ini.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((trx) => {
              const orderDate = new Date(trx.waktu_pesan);
              let diffMinutes = 0;
              let isServed = false;

              if (trx.waktu_saji) {
                isServed = true;
                const servedDate = new Date(trx.waktu_saji);
                diffMinutes = Math.floor(
                  (servedDate.getTime() - orderDate.getTime()) / (1000 * 60)
                );
              } else {
                diffMinutes = Math.floor(
                  (currentTime.getTime() - orderDate.getTime()) / (1000 * 60)
                );
              }

              const isOver20 = diffMinutes > 20;

              return (
                <TableRow
                  key={trx.id}
                  className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors ${
                    !isServed && isOver20
                      ? "bg-red-50/60 dark:bg-red-950/20"
                      : ""
                  }`}
                >
                  {/* ID */}
                  <TableCell className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    #{trx.id.slice(-6)}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {trx.customer_nama}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        {maskPhoneNumber(trx.customer_wa)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Menu */}
                  <TableCell className="text-xs font-medium text-zinc-800 dark:text-zinc-200 max-w-[200px] truncate">
                    {trx.menu_pesanan}
                  </TableCell>

                  {/* Porsi */}
                  <TableCell className="text-xs font-semibold">
                    {trx.jumlah_porsi}x
                  </TableCell>

                  {/* Total */}
                  <TableCell className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(trx.total_harga)}
                  </TableCell>

                  {/* Waktu Pesan */}
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-1">
                      <span>{formatTimeOnly(trx.waktu_pesan)}</span>
                      {trx.is_jam_sibuk && (
                        <span title="Jam Sibuk">
                          <Flame className="size-3 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* SLA Status */}
                  <TableCell>
                    {isServed ? (
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            diffMinutes <= 15
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40"
                              : diffMinutes <= 20
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40"
                              : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40"
                          }`}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Tersaji ({diffMinutes} mnt)
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isOver20 ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] font-bold animate-pulse flex items-center gap-1"
                          >
                            <AlertTriangle className="size-3" />
                            Terlambat ({diffMinutes} mnt)
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                          >
                            <Clock className="size-3 mr-1" />
                            Dimasak ({diffMinutes} mnt)
                          </Badge>
                        )}

                        {trx.kompensasi_diberikan && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5">
                            +Kompensasi OK
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Stempel */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold text-amber-600 border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
                    >
                      {trx.stempel_saat_ini}/5
                    </Badge>
                  </TableCell>

                  {/* Aksi Kasir */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isServed && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-[11px] h-7 border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300"
                          onClick={() => handleMarkServed(trx)}
                        >
                          <Check className="size-3 mr-1" />
                          Saji
                        </Button>
                      )}

                      {!isServed && isOver20 && !trx.kompensasi_diberikan && (
                        <Button
                          size="xs"
                          className="text-[11px] h-7 bg-red-600 hover:bg-red-700 text-white gap-1"
                          onClick={() => handleGrantCompensation(trx)}
                        >
                          <Coffee className="size-3" />
                          Kompensasi
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
