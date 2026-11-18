"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Users, Award, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/formatters";
import type { WeeklyTrendData } from "@/types/dashboard.record";

interface WeeklyTransactionsChartProps {
  data: WeeklyTrendData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-xs text-xs font-sans dark:border-zinc-800 dark:bg-zinc-950/95 space-y-2">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 pb-1 dark:border-zinc-800">
          Minggu: {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span
                  className="size-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {entry.name.includes("Omset")
                  ? formatRupiah(entry.value)
                  : `${entry.value} Transaksi`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

const emptySubscribe = () => () => {};

export function WeeklyTransactionsChart({ data }: WeeklyTransactionsChartProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [metricMode, setMetricMode] = React.useState<"volume" | "revenue">("volume");

  const latestWeek = data[data.length - 1];
  const firstWeek = data[0];
  const growthRate =
    firstWeek && latestWeek
      ? Math.round(
          ((latestWeek.transaksiMember - firstWeek.transaksiMember) /
            firstWeek.transaksiMember) *
            100
        )
      : 230;

  return (
    <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800 font-sans">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <TrendingUp className="size-4" />
            </div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Tren Transaksi Member per Minggu
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pertumbuhan retensi pelanggan loyal (Member Malam, Mahasiswa UPN &amp; Atma Jaya)
          </CardDescription>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300 font-semibold text-xs gap-1"
          >
            <Award className="size-3 text-purple-600" />
            +{growthRate}% Pertumbuhan Member
          </Badge>

          <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <button
              type="button"
              onClick={() => setMetricMode("volume")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                metricMode === "volume"
                  ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                Jumlah Pesanan
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("revenue")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                metricMode === "revenue"
                  ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              <span className="flex items-center gap-1">
                <DollarSign className="size-3" />
                Nominal Omset
              </span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {mounted ? (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {metricMode === "volume" ? (
                <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.6} />
                  <XAxis
                    dataKey="minggu"
                    tickLine={false}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="transaksiMember"
                    name="Transaksi Member Loyal"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#7c3aed" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalTransaksi"
                    name="Total Keseluruhan Transaksi"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: "#10b981", strokeWidth: 1, r: 3 }}
                  />
                </LineChart>
              ) : (
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.6} />
                  <XAxis
                    dataKey="minggu"
                    tickLine={false}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}jt`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="omsetMember"
                    name="Omset Transaksi Member (Rp)"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#4f46e5" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalOmset"
                    name="Total Omset Warung (Rp)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 1, r: 3 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        )}
      </CardContent>
    </Card>
  );
}
