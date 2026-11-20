"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileDown,
  Headset,
  MessageSquare,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  Timer,
  UserCheck,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BroadcastModal } from "@/components/features/BroadcastModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupiah } from "@/lib/formatters";
import type { DashboardAnalyticsData } from "@/types/dashboard.record";

interface DashboardViewProps {
  analytics: DashboardAnalyticsData;
}

const hourlyChartConfig = {
  rushCount: {
    label: "Jumat Malam",
    color: "#dc2626",
  },
  normalCount: {
    label: "Hari Biasa",
    color: "#5750f1",
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  totalTransaksi: {
    label: "Total Struk",
    color: "#5750f1",
  },
  transaksiMember: {
    label: "Member CRM",
    color: "#16a34a",
  },
} satisfies ChartConfig;

export function DashboardView({ analytics }: DashboardViewProps) {
  const router = useRouter();
  const [periodFilter, setPeriodFilter] = React.useState<"7d" | "shift">("7d");
  const [chartTab, setChartTab] = React.useState<"hourly" | "weekly">("hourly");
  const [activeShiftRow, setActiveShiftRow] = React.useState<
    "pagi" | "sore" | "malam"
  >("malam");
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [slaModalOpen, setSlaModalOpen] = React.useState(false);
  const [slaTargetMinutes, setSlaTargetMinutes] = React.useState(20);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const {
    kpi,
    hourlyRush,
    weeklyTrends,
    topMenus,
    segmentBreakdown,
    recentActivities,
    reactivationStats,
  } = analytics;

  const periodFactor = periodFilter === "shift" ? 0.34 : 1;
  const displayOmzet = Math.round((kpi.totalOmzet || 18450000) * periodFactor);
  const displayTrx = Math.round((kpi.totalTransaksi || 942) * periodFactor);

  const handleExportCsv = () => {
    const rows = [
      ["Metrik", "Nilai", "Target SLA", "Status"],
      ["Total Omzet", String(displayOmzet), "-", "Aktif"],
      ["Total Transaksi", String(displayTrx), "-", "Aktif"],
      [
        "Rata-rata Masak Jam Normal",
        `${kpi.waktuSajiNormal.rataRata} menit`,
        `< ${kpi.waktuSajiNormal.target} menit`,
        kpi.waktuSajiNormal.statusSla ? "Aman" : "Perhatian",
      ],
      [
        "Rata-rata Masak Jam Sibuk",
        `${kpi.waktuSajiSibuk.rataRata} menit`,
        `< ${slaTargetMinutes} menit`,
        kpi.waktuSajiSibuk.statusSla ? "Aman" : "Perhatian",
      ],
      [
        "FCR Komplain WA",
        `${kpi.fcr.persentase}%`,
        `>= ${kpi.fcr.target}%`,
        kpi.fcr.statusSla ? "Tercapai" : "Belum",
      ],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sumber-rizki-kpi-${periodFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Laporan KPI diekspor ke CSV.");
  };

  const handleSendOwnerWaSummary = () => {
    const summary =
      `*RINGKASAN SUMBER RIZKI SETURAN*\n` +
      `Omzet (${periodFilter === "shift" ? "Shift Malam" : "7 Hari"}): ${formatRupiah(displayOmzet)} (${displayTrx} struk)\n` +
      `SLA Masak Normal: ${kpi.waktuSajiNormal.rataRata} mnt | Sibuk: ${kpi.waktuSajiSibuk.rataRata} mnt\n` +
      `FCR Komplain WA: ${kpi.fcr.persentase}%\n` +
      `Win-Back CRM: ${reactivationStats.totalReaktivasi} pelanggan (${reactivationStats.konversiKeseluruhan}%)\n` +
      `Menu Terlaris: ${topMenus[0]?.nama} (${topMenus[0]?.porsi} porsi)`;
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(summary)}`,
      "_blank"
    );
    showToast("Membuka WhatsApp ringkasan pemilik.");
  };

  const maxPorsi = Math.max(1, ...topMenus.map((m) => m.porsi));

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium tracking-tight text-foreground">
            Dashboard Operasional
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan omzet, kecepatan dapur, dan konversi CRM Seturan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={periodFilter}
            onValueChange={(v) => setPeriodFilter(v as "7d" | "shift")}
          >
            <TabsList>
              <TabsTrigger value="7d">7 Hari</TabsTrigger>
              <TabsTrigger value="shift">Shift Malam</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" onClick={handleExportCsv}>
            <FileDown data-icon="inline-start" />
            Export CSV
          </Button>

          <Button onClick={handleSendOwnerWaSummary}>
            <MessageSquare data-icon="inline-start" />
            Ringkasan WA
          </Button>
        </div>
      </div>

      {/* NextAdmin Asymmetric 2fr / 1fr Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 items-start">
        {/* LEFT COLUMN (2fr): 2x2 KPI Matrix + Spline AreaChart + Tables */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Unified 2x2 Hairline KPI Matrix */}
          <Card className="overflow-hidden p-0 gap-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Cell 1: Merah (#dc2626) */}
              <div className="p-5 border-b md:border-r flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] shrink-0">
                      <Wallet className="size-4.5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Omzet
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {periodFilter === "shift" ? "Shift Malam" : "7 Hari"}
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
                    {formatRupiah(displayOmzet)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <span className="inline-flex items-center gap-0.5 text-[#15803d]">
                      <ArrowUpRight className="size-3.5" />
                      {displayTrx} struk
                    </span>
                    <span className="text-muted-foreground font-normal text-xs tabular-nums">
                      · AOV {formatRupiah(kpi.avgOrderValue || 19585)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cell 2: Hijau (#16a34a) */}
              <div className="p-5 border-b flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#15803d] shrink-0">
                      <Timer className="size-4.5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Waktu Saji Dapur
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Target &lt;{slaTargetMinutes}m
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
                    {kpi.waktuSajiNormal.rataRata} mnt
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <span
                      className={
                        kpi.waktuSajiNormal.statusSla
                          ? "text-[#15803d]"
                          : "text-[#b45309]"
                      }
                    >
                      {kpi.waktuSajiNormal.statusSla
                        ? "Dalam batas SLA"
                        : "Perlu evaluasi"}
                    </span>
                    <span className="text-muted-foreground font-normal text-xs tabular-nums">
                      · Jam sibuk {kpi.waktuSajiSibuk.rataRata} mnt
                    </span>
                  </div>
                </div>
              </div>

              {/* Cell 3: Kuning (#f59e0b) */}
              <div className="p-5 border-b md:border-b-0 md:border-r flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#fffbeb] text-[#b45309] shrink-0">
                      <Headset className="size-4.5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      First Contact Resolution
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Target &gt;=90%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
                    {kpi.fcr.persentase}%
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <span className="inline-flex items-center gap-0.5 text-[#b45309]">
                      <ArrowUpRight className="size-3.5" />
                      {kpi.fcr.totalSelesaiDiTempat} tiket
                    </span>
                    <span className="text-muted-foreground font-normal text-xs tabular-nums">
                      dari {kpi.fcr.totalKeluhan} keluhan tuntas di tempat
                    </span>
                  </div>
                </div>
              </div>

              {/* Cell 4: Ungu/Biru NextAdmin (#5750f1) */}
              <div className="p-5 flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#eff3ff] text-[#5750f1] shrink-0">
                      <UserCheck className="size-4.5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Win-Back Pelanggan Pasif
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {reactivationStats.konversiKeseluruhan}% CR
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground tabular-nums tracking-tight">
                    {reactivationStats.totalReaktivasi} orang
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <span className="text-[#3758f9]">
                      {reactivationStats.totalTerkirim} pesan promo WA
                    </span>
                    <span className="text-muted-foreground font-normal text-xs tabular-nums">
                      · {formatRupiah(reactivationStats.totalOmsetReaktivasi)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Smooth Spline AreaChart Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>
                {chartTab === "hourly"
                  ? "Pertumbuhan Pesanan per Jam (14:00 - 03:00)"
                  : "Tren Transaksi Mingguan"}
              </CardTitle>
              <CardDescription>
                {chartTab === "hourly"
                  ? "Perbandingan ritme pesanan Jumat Malam vs Hari Biasa."
                  : `Perbandingan total struk & pelanggan member ${weeklyTrends.length} minggu terakhir.`}
              </CardDescription>
              <CardAction>
                <Tabs
                  value={chartTab}
                  onValueChange={(v) => setChartTab(v as "hourly" | "weekly")}
                >
                  <TabsList>
                    <TabsTrigger value="hourly">Per Jam</TabsTrigger>
                    <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardAction>
            </CardHeader>

            <CardContent className="pt-2">
              {chartTab === "hourly" ? (
                <ChartContainer
                  config={hourlyChartConfig}
                  className="aspect-auto h-[265px] w-full"
                >
                  <AreaChart data={hourlyRush} margin={{ left: -16, right: 8 }}>
                    <defs>
                      <linearGradient id="fillRush" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="fillNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5750f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#5750f1" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#E5E7EB"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="jam"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={42}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="normalCount"
                      stroke="var(--color-normalCount)"
                      fill="url(#fillNormal)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="rushCount"
                      stroke="var(--color-rushCount)"
                      fill="url(#fillRush)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <ChartContainer
                  config={weeklyChartConfig}
                  className="aspect-auto h-[265px] w-full"
                >
                  <AreaChart
                    data={weeklyTrends}
                    margin={{ left: -12, right: 8 }}
                  >
                    <defs>
                      <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5750f1" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#5750f1" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient
                        id="fillMember"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#E5E7EB"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="minggu"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={44}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="transaksiMember"
                      stroke="var(--color-transaksiMember)"
                      fill="url(#fillMember)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalTransaksi"
                      stroke="var(--color-totalTransaksi)"
                      fill="url(#fillTotal)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>

            <CardFooter className="justify-between text-xs text-muted-foreground">
              <span>Shift Siang: 27.7% omzet</span>
              <span className="font-medium text-foreground">
                Shift Malam: 72.3% omzet
              </span>
            </CardFooter>
          </Card>

          {/* Menu Terlaris Table */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Menu Terlaris</CardTitle>
              <CardDescription>
                Kontribusi penjualan menu 7 hari terakhir.
              </CardDescription>
              <CardAction>
                <Button
                  variant="ghost"
                  size="xs"
                  render={<Link href="/transaksi" />}
                  nativeButton={false}
                >
                  <span>Buka Kasir</span>
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <div className="rounded-lg overflow-hidden border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4 w-10">#</TableHead>
                      <TableHead>Menu &amp; Kategori</TableHead>
                      <TableHead className="text-right">Terjual</TableHead>
                      <TableHead className="text-right">Omzet</TableHead>
                      <TableHead className="pr-4 text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMenus.map((menu) => {
                      const ratioPct = Math.round(
                        (menu.porsi / maxPorsi) * 100
                      );
                      return (
                        <TableRow key={menu.rank}>
                          <TableCell className="pl-4 text-xs tabular-nums">
                            {menu.rank === 1 ? (
                              <span className="inline-flex h-5 items-center justify-center rounded-full bg-[#fef2f2] px-2 text-xs font-semibold text-[#b91c1c]">
                                #1
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-medium">
                                {menu.rank}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-xs text-foreground">
                              {menu.nama}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#dc2626]"
                                  style={{ width: `${ratioPct}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {menu.kategori}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {menu.porsi}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium tabular-nums">
                            {formatRupiah(menu.totalOmset)}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                                menu.kontribusiPersen >= 20
                                  ? "bg-[#f0fdf4] text-[#15803d]"
                                  : menu.kontribusiPersen >= 12
                                  ? "bg-[#eff3ff] text-[#3758f9]"
                                  : "bg-[#fffbeb] text-[#b45309]"
                              }`}
                            >
                              {menu.kontribusiPersen}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Efektivitas Kampanye WA */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Efektivitas Kampanye WA</CardTitle>
              <CardDescription>
                Penerima, tingkat baca, dan klaim transaksi di kasir.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBroadcastOpen(true)}
                >
                  <Plus data-icon="inline-start" />
                  Buat Broadcast
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <div className="rounded-lg overflow-hidden border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Kampanye</TableHead>
                      <TableHead className="text-right">Terkirim</TableHead>
                      <TableHead className="text-right">Dibaca</TableHead>
                      <TableHead className="text-right">Kembali</TableHead>
                      <TableHead className="pr-4 text-right">
                        Omzet Balik
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reactivationStats.items.map((camp) => {
                      const openRate = camp.openRate ?? 84.5;
                      return (
                        <TableRow key={camp.namaKampanye}>
                          <TableCell className="pl-4">
                            <div className="font-medium text-xs">
                              {camp.namaKampanye}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {camp.pemicu || camp.jenis}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {camp.totalSent}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-medium text-[#15803d] tabular-nums">
                              {openRate}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium tabular-nums">
                            {camp.totalWinBack}
                          </TableCell>
                          <TableCell className="pr-4 text-right text-xs font-semibold tabular-nums">
                            {formatRupiah(camp.estimasiOmset)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT RAIL (1fr): Operational Schedule + Activity Timeline + Segment Bar + SLA Audit */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Operational Shifts & Active Focus */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Ritme Shift &amp; Promo</CardTitle>
              <CardDescription>
                Operasional harian Warmindo Seturan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 pt-2">
              {(
                [
                  {
                    id: "pagi",
                    name: "Shift Pagi · Sarapan & Kuliah",
                    hours: "10:00 - 17:00 WIB",
                    note: "Fokus waktu saji cepat < 12 mnt untuk jam makan siang.",
                    tag: "Normal",
                  },
                  {
                    id: "sore",
                    name: "Shift Sore · Jam Pulang Kampus",
                    hours: "17:00 - 22:00 WIB",
                    note: "Validasi kupon stempel pelanggan UPN & Atma Jaya.",
                    tag: "Ramai",
                  },
                  {
                    id: "malam",
                    name: "Shift Begadang Nugas",
                    hours: "22:00 - 04:00 WIB",
                    note: "Diskon otomatis 10% member malam & monitor SLA ketat.",
                    tag: "Puncak",
                  },
                ] as const
              ).map((shift) => {
                const isSelected = activeShiftRow === shift.id;
                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setActiveShiftRow(shift.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-muted/70 border-border"
                        : "bg-card border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {shift.name}
                      </span>
                      <Badge
                        variant={
                          shift.id === "malam"
                            ? "destructive"
                            : shift.id === "sore"
                            ? "warning"
                            : "info"
                        }
                      >
                        {shift.tag}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                      <Clock className="size-3" />
                      <span>{shift.hours}</span>
                    </div>
                    {isSelected && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {shift.note}
                      </p>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activities Vertical Timeline */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>
                Transaksi POS dan tiket layanan terbaru.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="relative pl-5 flex flex-col gap-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {recentActivities.slice(0, 4).map((act) => (
                  <div key={act.id} className="relative flex flex-col gap-1.5">
                    <span
                      className={`absolute -left-5 top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-card ${
                        act.kind === "sla"
                          ? "bg-[#16a34a]"
                          : act.kind === "ticket"
                          ? "bg-[#f59e0b]"
                          : "bg-[#dc2626]"
                      }`}
                    >
                      {act.kind === "sla" ? (
                        <CheckCircle2 className="size-2.5 text-white" />
                      ) : act.kind === "order" ? (
                        <ShoppingBag className="size-2 text-white" />
                      ) : null}
                    </span>

                    <div className="text-xs leading-snug text-foreground">
                      <span className="font-semibold">{act.actor}</span>{" "}
                      <span className="text-muted-foreground">{act.action}</span>{" "}
                      <span className="font-medium">{act.target}</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {act.timeLabel}
                    </div>

                    {act.quote && (
                      <div className="rounded-lg bg-muted/75 px-3 py-2 text-xs text-muted-foreground line-clamp-2">
                        {act.quote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                render={<Link href="/keluhan" />}
                nativeButton={false}
              >
                <span>Lihat Semua Tiket</span>
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>

          {/* Segmen Pelanggan (Horizontal Proportion Bar ala NextAdmin Lead Sources) */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Segmen Pelanggan</CardTitle>
              <CardDescription>
                Komposisi member kampus &amp; umum terdaftar.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 flex flex-col gap-4">
              <div className="flex h-7 w-full gap-1.5">
                {segmentBreakdown.map((seg) => (
                  <div
                    key={seg.label}
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${Math.max(8, seg.percent)}%`,
                      backgroundColor: seg.color,
                    }}
                    title={`${seg.label}: ${seg.percent}% (${seg.count})`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {segmentBreakdown.map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-[3px] shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-muted-foreground truncate">
                        {seg.label}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">
                      {seg.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SLA Compensation Audit Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Audit Kompensasi SLA</CardTitle>
              <CardDescription>
                Es Teh Jumbo gratis untuk pesanan terlambat.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-xs pt-2">
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Batas toleransi KDS</span>
                <span className="font-semibold tabular-nums">
                  {slaTargetMinutes} menit
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Kompensasi keluar</span>
                <span className="font-semibold text-[#dc2626] tabular-nums">
                  {kpi.kompensasiQty ?? 20} porsi
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Total biaya HPP</span>
                <span className="font-semibold tabular-nums">
                  {formatRupiah(kpi.kompensasiBiaya ?? 100000)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Breach rate</span>
                <span className="font-semibold tabular-nums">
                  {kpi.breachRate ?? 2.1}%
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSlaModalOpen(true)}
              >
                <SlidersHorizontal data-icon="inline-start" />
                Ubah Batas Waktu SLA
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Adjust SLA Tolerance Dialog */}
      <Dialog open={slaModalOpen} onOpenChange={setSlaModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Batas Waktu SLA Dapur</DialogTitle>
            <DialogDescription>
              Ambang menit masak sebelum memicu kompensasi Es Teh gratis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="sla-limit-input">Maksimal waktu masak (menit)</Label>
            <Input
              id="sla-limit-input"
              type="number"
              min={10}
              max={45}
              value={slaTargetMinutes}
              onChange={(e) =>
                setSlaTargetMinutes(Number(e.target.value) || 20)
              }
              className="font-semibold tabular-nums"
            />
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setSlaModalOpen(false);
                showToast(
                  `Batas SLA diperbarui menjadi ${slaTargetMinutes} menit.`
                );
              }}
            >
              Simpan Pengaturan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BroadcastModal
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        onBroadcastSuccess={() => router.refresh()}
      />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-md">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
