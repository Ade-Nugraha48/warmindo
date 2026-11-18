"use client";

import * as React from "react";
import { LayoutDashboard, Shield, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardKpiCards } from "@/components/features/DashboardKpiCards";
import { WeeklyTransactionsChart } from "@/components/features/WeeklyTransactionsChart";
import { TopMenuTable } from "@/components/features/TopMenuTable";
import { ReactivationStatsCard } from "@/components/features/ReactivationStatsCard";
import type { DashboardAnalyticsData } from "@/types/dashboard.record";

interface DashboardViewProps {
  analytics: DashboardAnalyticsData;
}

export function DashboardView({ analytics }: DashboardViewProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
            <LayoutDashboard className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Dashboard Analitik KPI Pemilik
              </h1>
              <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 font-semibold text-xs gap-1 border border-amber-300">
                <Shield className="size-3 text-amber-700" />
                Khusus Pemilik (Owner)
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Rangkuman performa operasional, SLA waktu saji, penanganan keluhan (FCR), dan pertumbuhan loyalitas member.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1"
          >
            ● Realtime Analytics
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5 h-8 border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* KPI Cards (4 Cards) */}
      <DashboardKpiCards kpi={analytics.kpi} />

      {/* Weekly Transaction Trends Line Chart */}
      <WeeklyTransactionsChart data={analytics.weeklyTrends} />

      {/* Bottom Grid: 5 Top Menus & Campaign Reactivation Effectiveness */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopMenuTable menus={analytics.topMenus} />
        <ReactivationStatsCard stats={analytics.reactivationStats} />
      </div>
    </div>
  );
}
