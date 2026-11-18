"use client";

import * as React from "react";
import { Sparkles, MessageSquare, CheckCircle2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/formatters";
import type { DashboardAnalyticsData } from "@/types/dashboard.record";

interface ReactivationStatsCardProps {
  stats: DashboardAnalyticsData["reactivationStats"];
}

export function ReactivationStatsCard({ stats }: ReactivationStatsCardProps) {
  return (
    <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800 font-sans">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Efektivitas Klaim Promo Reaktivasi (Win-Back)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Metrik keberhasilan menarik kembali pelanggan pasif via WhatsApp Marketing
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-semibold text-xs gap-1">
            <Sparkles className="size-3" />
            {stats.konversiKeseluruhan}% Konversi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Summary stats */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Terkirim</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {stats.totalTerkirim} pesan
            </div>
          </div>
          <div className="border-x border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Win-Back Sukses</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.totalReaktivasi} pelanggan
            </div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Omset Tambahan</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5 font-mono">
              {formatRupiah(stats.totalOmsetReaktivasi)}
            </div>
          </div>
        </div>

        {/* Campaign Breakdown List */}
        <div className="space-y-2.5">
          {stats.items.map((camp) => (
            <div
              key={camp.namaKampanye}
              className="rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50/70 transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <MessageSquare className="size-3" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {camp.namaKampanye}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {camp.totalSent} dihubungi · {camp.totalWinBack} kembali transaksi
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[11px] gap-1"
                  >
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    {camp.konversiRate}%
                  </Badge>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {formatRupiah(camp.estimasiOmset)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
