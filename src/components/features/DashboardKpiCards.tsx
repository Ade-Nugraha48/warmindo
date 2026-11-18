"use client";

import * as React from "react";
import {
  Clock,
  Flame,
  MessageCircle,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardKpiSummary } from "@/types/dashboard.record";

interface DashboardKpiCardsProps {
  kpi: DashboardKpiSummary;
}

export function DashboardKpiCards({ kpi }: DashboardKpiCardsProps) {
  const { waktuSajiNormal, waktuSajiSibuk, responseTimeWa, fcr } = kpi;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-sans">
      {/* KPI 1: Waktu Saji Jam Normal */}
      <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Waktu Saji (Jam Normal)
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Clock className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {waktuSajiNormal.rataRata}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              mnt / porsi
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-semibold gap-1"
            >
              <CheckCircle2 className="size-3 text-emerald-600" />
              SLA Terpenuhi (&lt; {waktuSajiNormal.target} mnt)
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Target SLA operasional normal (&lt;15 menit)
          </p>
        </CardContent>
      </Card>

      {/* KPI 2: Waktu Saji Jam Sibuk */}
      <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Waktu Saji (Jam Sibuk)
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Flame className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {waktuSajiSibuk.rataRata}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              mnt / porsi
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-semibold gap-1"
            >
              <CheckCircle2 className="size-3 text-amber-600" />
              Terkendali (&lt; {waktuSajiSibuk.target} mnt)
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Peringatan kompensasi otomatis jika &gt;20 menit
          </p>
        </CardContent>
      </Card>

      {/* KPI 3: Response Time WA Admin */}
      <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Response Time WA Admin
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <MessageCircle className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {responseTimeWa.rataRata}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              menit
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-semibold gap-1"
            >
              <TrendingDown className="size-3 text-blue-600" />
              Sangat Cepat (&lt; {responseTimeWa.target} mnt)
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Target SLA respon chat pelanggan (&lt;5 menit)
          </p>
        </CardContent>
      </Card>

      {/* KPI 4: First Call Resolution (FCR) */}
      <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            First Call Resolution (FCR)
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <ShieldCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {fcr.persentase}%
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              terselesaikan
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300 text-[11px] font-semibold gap-1"
            >
              <CheckCircle2 className="size-3 text-purple-600" />
              Target Tercapai (&ge; {fcr.target}%)
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            Komplain diselesaikan langsung di tempat oleh staf
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
