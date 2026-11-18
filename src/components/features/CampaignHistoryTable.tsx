"use client";

import * as React from "react";
import { History, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { maskPhoneNumber, formatIndonesianDate } from "@/lib/formatters";
import type { CampaignLogRecord } from "@/types/campaign.record";
import type { JenisKampanye } from "@/types/database.types";

interface CampaignHistoryTableProps {
  logs: CampaignLogRecord[];
}

export function CampaignHistoryTable({ logs }: CampaignHistoryTableProps) {
  const getJenisBadge = (jenis: JenisKampanye) => {
    switch (jenis) {
      case "Begadang Nugas":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 font-medium text-[11px]">
            Begadang Nugas
          </Badge>
        );
      case "Insentif Es Teh":
        return (
          <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium text-[11px]">
            Insentif Es Teh
          </Badge>
        );
      case "Kangen Nongkrong":
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 font-medium text-[11px]">
            Kangen Nongkrong
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Riwayat Aktivitas Kampanye &amp; Reaktivasi
          </h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {logs.length} Log Tercatat
        </span>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 dark:bg-zinc-900/40">
              <TableHead className="w-[110px] text-xs font-semibold">ID Log</TableHead>
              <TableHead className="text-xs font-semibold">Pelanggan</TableHead>
              <TableHead className="text-xs font-semibold">Jenis Kampanye</TableHead>
              <TableHead className="text-xs font-semibold">Waktu Terkirim</TableHead>
              <TableHead className="text-right text-xs font-semibold">Hasil Reaktivasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Sparkles className="size-6 text-zinc-300" />
                    <span>Belum ada riwayat kampanye yang dikirimkan.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <TableCell className="py-3 font-mono text-xs font-bold text-zinc-500">
                    #{log.id}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                      {log.customer_nama}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-400">
                      {maskPhoneNumber(log.customer_wa)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">{getJenisBadge(log.jenis_kampanye)}</TableCell>
                  <TableCell className="py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {formatIndonesianDate(log.waktu_kirim)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {log.berhasil_reaktivasi ? (
                      <Badge className="bg-emerald-500 text-white font-semibold text-[11px] gap-1 inline-flex">
                        <CheckCircle2 className="size-3" />
                        Win-back Sukses
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px] gap-1 inline-flex"
                      >
                        <Clock className="size-3" />
                        Menunggu Transaksi
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
