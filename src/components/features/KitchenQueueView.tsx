"use client";

import * as React from "react";
import {
  BellRing,
  CheckCheck,
  Clock,
  Download,
  FlameKindling,
  LayoutGrid,
  MessageSquare,
  TableProperties,
  X,
  Zap,
} from "lucide-react";
import {
  assignKitchenChef,
  grantCompensation,
  markOrderServed,
} from "@/app/(admin)/transaksi/actions";
import { LiveElapsedTimer } from "@/components/shared/LiveElapsedTimer";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SLA_BREACH_MINUTES, SLA_SAFE_MINUTES } from "@/lib/constants";
import { formatWaUrl } from "@/lib/formatters";
import type { ChefPerformanceRecord } from "@/types/pos.record";
import type { TransactionRecord } from "@/types/transaction.record";

interface KitchenQueueViewProps {
  initialOrders: TransactionRecord[];
  chefs: ChefPerformanceRecord[];
  initialNowMs: number;
  initialSearchQuery?: string;
}

type StationFilter = "all" | "kompor" | "nasi" | "minuman";

export function KitchenQueueView({
  initialOrders,
  chefs,
  initialNowMs,
  initialSearchQuery = "",
}: KitchenQueueViewProps) {
  const [orders, setOrders] = React.useState<TransactionRecord[]>(initialOrders);
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [stationFilter, setStationFilter] =
    React.useState<StationFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const [rushIds, setRushIds] = React.useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const playKitchenBell = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // AudioContext blocked by browser autoplay policy
    }
    showToast("Bel dapur dibunyikan.");
  };

  const activeOrders = React.useMemo(
    () => orders.filter((o) => !o.waktu_saji),
    [orders]
  );

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeOrders.filter((order) => {
      const stationOk =
        stationFilter === "all" ||
        (() => {
          const text =
            `${order.stasiun_dapur || ""} ${order.menu_pesanan}`.toLowerCase();
          if (stationFilter === "kompor") {
            return text.includes("kompor") || text.includes("indomie");
          }
          if (stationFilter === "nasi") {
            return text.includes("wajan") || text.includes("magelangan");
          }
          return (
            text.includes("bar") ||
            text.includes("teh") ||
            text.includes("pisang") ||
            text.includes("bakwan")
          );
        })();

      const searchOk =
        !q ||
        (order.nomor_meja || "").toLowerCase().includes(q) ||
        (order.kode_order || "").toLowerCase().includes(q) ||
        order.customer_nama.toLowerCase().includes(q) ||
        order.menu_pesanan.toLowerCase().includes(q);

      return stationOk && searchOk;
    });
  }, [activeOrders, stationFilter, searchQuery]);

  const warningCount = activeOrders.filter((o) => {
    const mins = (initialNowMs - new Date(o.waktu_pesan).getTime()) / 60000;
    return mins >= SLA_SAFE_MINUTES && mins <= SLA_BREACH_MINUTES;
  }).length;

  const breachOrders = activeOrders.filter((o) => {
    const mins = (initialNowMs - new Date(o.waktu_pesan).getTime()) / 60000;
    return mins > SLA_BREACH_MINUTES;
  });

  const primaryBreach = breachOrders[0];

  const toggleItemChecked = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !order.order_items) return order;
        return {
          ...order,
          order_items: order.order_items.map((item) =>
            item.id === itemId ? { ...item, selesai: !item.selesai } : item
          ),
        };
      })
    );
  };

  const handleMarkServed = async (order: TransactionRecord) => {
    const res = await markOrderServed(order.id);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, waktu_saji: res.waktu_saji, status_dapur: "Selesai" }
            : o
        )
      );
      showToast(`${order.nomor_meja || order.kode_order} selesai disajikan.`);
    }
  };

  const handleAssignChef = async (
    order: TransactionRecord,
    chefName: string
  ) => {
    const res = await assignKitchenChef(order.id, chefName);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status_dapur: "Dimasak", koki_pic: chefName }
            : o
        )
      );
      showToast(`${order.kode_order || order.id} ditangani ${chefName}.`);
    }
  };

  const handleAutoCompensate = async (order: TransactionRecord) => {
    await grantCompensation(order.id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, kompensasi_diberikan: true } : o
      )
    );
    const msg =
      `Halo Kak ${order.customer_nama} (${order.nomor_meja || "Meja"}). ` +
      `Mohon maaf pesanan menunggu lebih dari 20 menit. Kami kirimkan 1x Es Teh Manis Jumbo Solo gratis ke meja Kakak.`;
    window.open(formatWaUrl(order.customer_wa, msg), "_blank");
    showToast(`Notifikasi kompensasi dikirim ke ${order.customer_nama}.`);
  };

  const handleExportSlaCsv = () => {
    const rows = [
      ["Kode Order", "Meja", "Pelanggan", "Waktu Pesan", "Status Dapur", "Koki"],
      ...orders.map((o) => [
        o.kode_order || o.id,
        o.nomor_meja || "-",
        o.customer_nama,
        o.waktu_pesan,
        o.status_dapur || (o.waktu_saji ? "Selesai" : "Dimasak"),
        o.koki_pic || "-",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sumber-rizki-sla-dapur.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Log SLA diekspor ke CSV.");
  };

  const stationOptions = React.useMemo(
    () => [
      { value: "all", label: `Semua Stasiun (${activeOrders.length})` },
      { value: "kompor", label: "Kompor Indomie" },
      { value: "nasi", label: "Wajan Magelangan" },
      { value: "minuman", label: "Minuman & Gorengan" },
    ],
    [activeOrders.length]
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 font-sans">
      {/* Header & Summary Inline */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium text-foreground tracking-tight">
            Antrean Dapur (KDS)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
            Aktif {activeOrders.length} pesanan · Peringatan &gt;15m:{" "}
            {warningCount} · Breach &gt;20m: {breachOrders.length}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {searchQuery.trim() && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              <span>Filter: {searchQuery}</span>
              <X data-icon="inline-end" />
            </Button>
          )}

          <Select
            value={stationFilter}
            onValueChange={(v) => v && setStationFilter(v as StationFilter)}
            items={stationOptions}
          >
            <SelectTrigger className="w-48">
              <FlameKindling className="size-3.5 text-primary mr-1 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {stationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" onClick={playKitchenBell}>
            <BellRing data-icon="inline-start" className="text-primary" />
            <span>Bel Dapur</span>
          </Button>

          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "grid" | "table")}
          >
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table">
                <TableProperties className="size-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Critical Breach Strip (Only shown if active breach exists) */}
      {primaryBreach && (
        <Card className="border-destructive/40 bg-destructive/5" size="sm">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap text-xs text-foreground">
              <Badge variant="destructive">Breach SLA &gt;20m</Badge>
              <span>
                <span className="font-semibold">
                  {primaryBreach.nomor_meja || primaryBreach.kode_order} (
                  {primaryBreach.customer_nama})
                </span>{" "}
                berhak atas kompensasi 1x Es Teh Jumbo Solo gratis.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAutoCompensate(primaryBreach)}
              >
                <MessageSquare data-icon="inline-start" />
                <span>Kirim WA</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleMarkServed(primaryBreach)}
              >
                <CheckCheck data-icon="inline-start" />
                <span>Sajikan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Queue Display */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FlameKindling />
                </EmptyMedia>
                <EmptyTitle>Tidak ada antrean dapur aktif</EmptyTitle>
                <EmptyDescription>
                  Semua pesanan pada stasiun terpilih sudah selesai disajikan.
                </EmptyDescription>
              </EmptyHeader>
              {(stationFilter !== "all" || searchQuery.trim()) && (
                <EmptyContent>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStationFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Tampilkan semua stasiun
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {filteredOrders.map((order) => {
            const elapsedMin =
              (initialNowMs - new Date(order.waktu_pesan).getTime()) / 60000;
            const isNew = order.status_dapur === "Antre";
            const isBreach = elapsedMin > SLA_BREACH_MINUTES;
            const isWarning =
              !isBreach &&
              elapsedMin >= SLA_SAFE_MINUTES &&
              elapsedMin <= SLA_BREACH_MINUTES;
            const isRushed = Boolean(rushIds[order.id]);

            const items = order.order_items || [
              {
                id: `${order.id}-0`,
                nama: order.menu_pesanan,
                qty: order.jumlah_porsi,
                harga: order.total_harga,
                catatan: order.catatan_pesanan,
                stasiun: order.stasiun_dapur || "Kompor 1",
                selesai: false,
              },
            ];
            const completedCount = items.filter((i) => i.selesai).length;

            return (
              <Card
                key={order.id}
                size="sm"
                className={`border-l-4 shadow-xs ${
                  isBreach
                    ? "border-l-[#dc2626]"
                    : isWarning
                    ? "border-l-[#f59e0b]"
                    : isNew
                    ? "border-l-[#5750f1]"
                    : "border-l-[#16a34a]"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      {order.tipe_pesanan === "Takeaway WA"
                        ? order.kode_order || order.id
                        : order.nomor_meja || "Meja 01"}
                    </CardTitle>
                    <Badge variant="outline">
                      {order.tipe_pesanan || "Dine-in"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {order.customer_nama} · {order.kode_order || order.id}
                  </CardDescription>
                  <CardAction>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {new Date(order.waktu_pesan).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                      })}
                    </span>
                  </CardAction>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {/* Isolated Timer Row */}
                  <div
                    className={`rounded-lg px-3 py-2 flex items-center justify-between text-xs ${
                      isBreach
                        ? "bg-[#fef2f2] text-[#b91c1c]"
                        : isWarning
                        ? "bg-[#fffbeb] text-[#b45309]"
                        : isNew
                        ? "bg-[#eff3ff] text-[#3758f9]"
                        : "bg-[#f0fdf4] text-[#15803d]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5" />
                      <span>
                        {isBreach
                          ? "Melebihi 20 mnt"
                          : isWarning
                          ? "Mendekati 20 mnt"
                          : isNew
                          ? "Menunggu Koki"
                          : "Dalam Target SLA"}
                      </span>
                    </div>
                    <LiveElapsedTimer
                      sinceIso={order.waktu_pesan}
                      initialNowMs={initialNowMs}
                      className="text-sm font-bold"
                    />
                  </div>

                  {/* Item Checklist */}
                  <div className="divide-y divide-border">
                    {items.map((item) => {
                      const checkId = `kds-item-${order.id}-${item.id}`;
                      return (
                        <div
                          key={item.id}
                          className="py-2 first:pt-0.5 last:pb-0.5 flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Checkbox
                              id={checkId}
                              checked={Boolean(item.selesai)}
                              onCheckedChange={() =>
                                toggleItemChecked(order.id, item.id)
                              }
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={checkId}
                              className="flex flex-col items-start gap-0.5 min-w-0 cursor-pointer"
                            >
                              <span
                                className={`text-xs font-medium ${
                                  item.selesai
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {item.nama}
                              </span>
                              {item.catatan && (
                                <span className="text-[11px] font-normal text-primary">
                                  {item.catatan}
                                </span>
                              )}
                            </Label>
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                            {item.stasiun}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chef & Progress */}
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                    <span>Koki: {order.koki_pic || "Kang Asep"}</span>
                    <Badge
                      variant={isRushed ? "destructive" : "secondary"}
                      className="tabular-nums"
                    >
                      {isRushed
                        ? "Prioritas"
                        : `${completedCount}/${items.length} selesai`}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  {isNew ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAssignChef(order, "Kang Anton")}
                      className="w-full font-semibold"
                    >
                      Mulai Masak
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRushIds((prev) => ({
                            ...prev,
                            [order.id]: !prev[order.id],
                          }))
                        }
                      >
                        <Zap
                          data-icon="inline-start"
                          className="text-primary"
                        />
                        <span>{isRushed ? "Normal" : "Prioritas"}</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleMarkServed(order)}
                        className="flex-1 font-semibold"
                      >
                        <CheckCheck data-icon="inline-start" />
                        <span>Tandai Saji</span>
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">
              Daftar Antrean Dapur
            </CardTitle>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportSlaCsv}
              >
                <Download data-icon="inline-start" />
                <span>Export CSV</span>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Meja / Tipe</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Durasi</TableHead>
                  <TableHead>Koki</TableHead>
                  <TableHead className="pr-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const mins =
                    (initialNowMs - new Date(order.waktu_pesan).getTime()) /
                    60000;
                  const isBreach = mins > SLA_BREACH_MINUTES;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="pl-4 font-mono font-semibold text-foreground">
                        {order.kode_order || order.id}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {order.nomor_meja} ({order.tipe_pesanan})
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.customer_nama}
                      </TableCell>
                      <TableCell className="text-right">
                        <LiveElapsedTimer
                          sinceIso={order.waktu_pesan}
                          initialNowMs={initialNowMs}
                          className={`font-semibold ${
                            isBreach
                              ? "text-[#dc2626]"
                              : "text-[#15803d]"
                          }`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.koki_pic || "Kang Asep"} ({order.stasiun_dapur})
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => handleMarkServed(order)}
                        >
                          Saji
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Compact Chef Roster Strip */}
      <Card size="sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-medium text-muted-foreground">
            Koki Bertugas ({chefs.length})
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {chefs.map((chef) => (
              <div
                key={chef.id}
                className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1"
              >
                <span className="font-semibold text-foreground">
                  {chef.nama}
                </span>
                <span className="text-muted-foreground">({chef.stasiun})</span>
                <Badge
                  variant="success"
                  className="tabular-nums"
                >
                  avg {chef.rataRataMenit}m
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
