"use client";

import * as React from "react";
import {
  CheckCircle2,
  Copy,
  FileDown,
  Gift,
  LayoutGrid,
  ListFilter,
  MessageSquareText,
  Send,
  TicketCheck,
} from "lucide-react";
import { AddTicketDialog } from "@/components/features/AddTicketDialog";
import { LiveElapsedTimer } from "@/components/shared/LiveElapsedTimer";
import {
  grantTicketCompensation,
  markTicketWaSent,
  updateTicketStatus,
} from "@/app/(admin)/keluhan/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MAX_LOYALTY_STAMPS } from "@/lib/constants";
import { formatWaUrl, maskPhoneNumber } from "@/lib/formatters";
import type {
  Customer,
  KategoriTiket,
  StatusTiket,
} from "@/types/database.types";
import type { TicketRecord } from "@/types/ticket.record";

interface TicketManagementViewProps {
  initialTickets: TicketRecord[];
  customers: Customer[];
  initialNowMs: number;
}

type StatusTab = "all" | "urgent" | "Diproses" | "Selesai";

const CATEGORY_OPTIONS = [
  { label: "Semua Kategori", value: "all" },
  { label: "Waktu Tunggu Dapur", value: "Waktu Tunggu" },
  { label: "Salah Racik / Topping", value: "Salah Pesanan" },
  { label: "Fasilitas / WiFi", value: "Fasilitas" },
];

export function TicketManagementView({
  initialTickets,
  customers,
  initialNowMs,
}: TicketManagementViewProps) {
  const [tickets, setTickets] = React.useState<TicketRecord[]>(initialTickets);
  const [drawerTicketId, setDrawerTicketId] = React.useState<string | null>(
    null
  );
  const [statusTab, setStatusTab] = React.useState<StatusTab>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"priority" | "kanban">(
    "priority"
  );
  const [templateModalOpen, setTemplateModalOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const drawerTicket = React.useMemo(
    () => tickets.find((t) => t.id === drawerTicketId) || null,
    [tickets, drawerTicketId]
  );

  const buildDefaultDraft = React.useCallback((ticket: TicketRecord) => {
    return (
      `Halo Kak ${ticket.customer_nama} (${ticket.nomor_meja || "Meja"}). ` +
      `Mohon maaf atas kendala pada ${ticket.kategori.toLowerCase()}. ` +
      `Kami sudah menindaklanjuti dengan kompensasi ${
        ticket.kompensasi_item || "1x Es Teh Jumbo Gratis"
      }. Terima kasih.`
    );
  }, []);

  const [draftOverrides, setDraftOverrides] = React.useState<
    Record<string, string>
  >({});

  const waDraft = drawerTicket
    ? draftOverrides[drawerTicket.id] ?? buildDefaultDraft(drawerTicket)
    : "";

  const setWaDraft = (nextText: string) => {
    if (!drawerTicket) return;
    setDraftOverrides((prev) => ({
      ...prev,
      [drawerTicket.id]: nextText,
    }));
  };

  const urgentTickets = React.useMemo(
    () => tickets.filter((t) => t.status !== "Selesai"),
    [tickets]
  );

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      if (statusTab === "urgent" && t.status === "Selesai") return false;
      if (statusTab === "Diproses" && t.status !== "Diproses") return false;
      if (statusTab === "Selesai" && t.status !== "Selesai") return false;
      if (
        categoryFilter !== "all" &&
        t.kategori !== (categoryFilter as KategoriTiket)
      ) {
        return false;
      }
      return true;
    });
  }, [tickets, statusTab, categoryFilter]);

  const handleResolveTicket = React.useCallback(
    async (ticket: TicketRecord) => {
      const res = await updateTicketStatus(ticket.id, "Selesai", true);
      if (res.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticket.id
              ? {
                  ...t,
                  status: "Selesai",
                  waktu_selesai:
                    res.data?.waktu_selesai || new Date().toISOString(),
                  pesan_konfirmasi_terkirim: true,
                }
              : t
          )
        );
        showToast(`Tiket ${ticket.kode_tiket || ticket.id} selesai.`);
      }
    },
    []
  );

  const handleSendWa = async (ticket: TicketRecord) => {
    await markTicketWaSent(ticket.id);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, pesan_konfirmasi_terkirim: true } : t
      )
    );
    window.open(formatWaUrl(ticket.customer_wa, waDraft), "_blank");
    showToast(`Membuka WhatsApp untuk ${ticket.customer_nama}.`);
  };

  const handleGrantCompensation = async (ticket: TicketRecord) => {
    const compItem =
      ticket.kompensasi_item || "1x Es Teh Jumbo Solo (Rp 0)";
    const res = await grantTicketCompensation(ticket.id, compItem);
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                kompensasi_item: compItem,
                status: t.status === "Baru" ? "Diproses" : t.status,
              }
            : t
        )
      );
      showToast(`Kompensasi ${compItem} dicatat.`);
    } else {
      showToast("Gagal mencatat kompensasi.");
    }
  };

  const handleMoveStatus = async (
    ticketId: string,
    nextStatus: StatusTiket
  ) => {
    const res = await updateTicketStatus(
      ticketId,
      nextStatus,
      nextStatus === "Selesai"
    );
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: nextStatus,
                waktu_selesai: res.data?.waktu_selesai || t.waktu_selesai,
              }
            : t
        )
      );
      showToast(`Status diubah ke ${nextStatus}.`);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ["Kode", "Meja", "Pelanggan", "Kategori", "PIC", "Status", "Kompensasi"],
      ...tickets.map((t) => [
        t.kode_tiket || t.id,
        t.nomor_meja || "-",
        t.customer_nama,
        t.kategori,
        t.pic,
        t.status,
        `"${(t.kompensasi_item || "-").replace(/"/g, '""')}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sumber-rizki-rekap-keluhan.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Rekap keluhan diekspor ke CSV.");
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        setTemplateModalOpen((prev) => !prev);
      } else if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (drawerTicket && drawerTicket.status !== "Selesai") {
          void handleResolveTicket(drawerTicket);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerTicket, handleResolveTicket]);

  const applyDraftPreset = (
    preset: "keterlambatan" | "salah-racik" | "kupon"
  ) => {
    if (!drawerTicket) return;
    if (preset === "keterlambatan") {
      setWaDraft(
        `Halo Kak ${drawerTicket.customer_nama} (${drawerTicket.nomor_meja || "Meja"}). Mohon maaf pesanan terlambat (>20 menit). Kami kirimkan 1x Es Teh Jumbo Solo gratis ke meja Kakak.`
      );
    } else if (preset === "salah-racik") {
      setWaDraft(
        `Halo Kak ${drawerTicket.customer_nama} (${drawerTicket.nomor_meja || "Meja"}). Mohon maaf atas kesalahan racikan. Koki kami langsung memasak ulang porsi baru prioritas 5 menit.`
      );
    } else {
      setWaDraft(
        `Halo Kak ${drawerTicket.customer_nama}. Kami sertakan voucher diskon 15% untuk kunjungan berikutnya di Warmindo Seturan.`
      );
    }
    setTemplateModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium tracking-tight text-foreground">
            Tiket Keluhan
          </h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {urgentTickets.length} tiket terbuka · klik baris atau kartu untuk membuka detail penanganan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCsv}>
            <FileDown data-icon="inline-start" />
            Export CSV
          </Button>
          <AddTicketDialog
            customers={customers}
            onTicketAdded={(newTicket) => {
              setTickets((prev) => [newTicket, ...prev]);
              setDrawerTicketId(newTicket.id);
              showToast(`Tiket ${newTicket.kode_tiket} ditambahkan.`);
            }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as StatusTab)}
        >
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Semua ({tickets.length})</TabsTrigger>
            <TabsTrigger value="urgent">
              Terbuka ({urgentTickets.length})
            </TabsTrigger>
            <TabsTrigger value="Diproses">
              Diproses ({tickets.filter((t) => t.status === "Diproses").length})
            </TabsTrigger>
            <TabsTrigger value="Selesai">
              Selesai ({tickets.filter((t) => t.status === "Selesai").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              if (v) setCategoryFilter(v);
            }}
            items={CATEGORY_OPTIONS}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "priority" | "kanban")}
          >
            <TabsList>
              <TabsTrigger value="priority">
                <ListFilter />
                Daftar
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <LayoutGrid />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Full-Width Table or 3-Col Kanban */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent>
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TicketCheck />
                </EmptyMedia>
                <EmptyTitle>Tidak ada tiket keluhan</EmptyTitle>
                <EmptyDescription>
                  Semua tiket pada filter ini sudah tertangani.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusTab("all");
                    setCategoryFilter("all");
                  }}
                >
                  Tampilkan Semua
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : viewMode === "priority" ? (
        <Card>
          <CardContent className="p-4">
            <div className="rounded-lg overflow-hidden border border-border/60">
              <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Tiket &amp; Meja</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kategori &amp; Keluhan</TableHead>
                  <TableHead>Kompensasi</TableHead>
                  <TableHead className="text-right">Durasi</TableHead>
                  <TableHead className="pr-4 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const isOpen = ticket.status !== "Selesai";

                  return (
                    <TableRow
                      key={ticket.id}
                      onClick={() => setDrawerTicketId(ticket.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="pl-4 py-3">
                        <div className="font-semibold text-foreground tabular-nums">
                          {ticket.kode_tiket || ticket.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ticket.nomor_meja || "Meja 01"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {ticket.customer_nama}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {maskPhoneNumber(ticket.customer_wa)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="font-medium text-foreground">
                          {ticket.kategori}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {ticket.deskripsi_keluhan}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {ticket.kompensasi_item || "Es Teh Jumbo Rp0"}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOpen ? (
                          <LiveElapsedTimer
                            sinceIso={ticket.waktu_masuk}
                            initialNowMs={initialNowMs}
                            className="text-xs font-semibold text-[#dc2626]"
                          />
                        ) : (
                          <span className="text-xs font-medium text-[#15803d]">
                            Tuntas
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Badge
                          variant={
                            ticket.status === "Baru"
                              ? "destructive"
                              : ticket.status === "Diproses"
                              ? "warning"
                              : "success"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {(["Baru", "Diproses", "Selesai"] as const).map((colStatus) => {
            const colItems = filteredTickets.filter(
              (t) => t.status === colStatus
            );
            return (
              <div
                key={colStatus}
                className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3 border"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium">{colStatus}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {colItems.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2.5">
                  {colItems.map((t) => (
                    <Card
                      key={t.id}
                      size="sm"
                      onClick={() => setDrawerTicketId(t.id)}
                      className="cursor-pointer hover:ring-foreground/20 transition-all"
                    >
                      <CardHeader>
                        <CardDescription className="text-xs font-medium text-primary tabular-nums">
                          {t.kode_tiket || t.id} · {t.nomor_meja || "Meja"}
                        </CardDescription>
                        <CardTitle>{t.customer_nama}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        <p className="line-clamp-2">{t.deskripsi_keluhan}</p>
                      </CardContent>
                      {colStatus !== "Selesai" && (
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleMoveStatus(
                                t.id,
                                colStatus === "Baru" ? "Diproses" : "Selesai"
                              );
                            }}
                          >
                            {colStatus === "Baru" ? "Proses" : "Tandai Selesai"}
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-Over Ticket Resolution Sheet */}
      <Sheet
        open={Boolean(drawerTicket)}
        onOpenChange={(open) => !open && setDrawerTicketId(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {drawerTicket && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-2 pr-6">
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      <span className="tabular-nums">
                        {drawerTicket.kode_tiket || drawerTicket.id}
                      </span>
                      <Badge
                        variant={
                          drawerTicket.status === "Baru"
                            ? "destructive"
                            : drawerTicket.status === "Diproses"
                            ? "warning"
                            : "success"
                        }
                      >
                        {drawerTicket.status}
                      </Badge>
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                      {drawerTicket.customer_nama} ({drawerTicket.nomor_meja || "Meja 01"}) · Stempel{" "}
                      {drawerTicket.customer_stempel ?? 0}/{MAX_LOYALTY_STAMPS}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="font-semibold text-foreground">
                    {drawerTicket.kategori} · PIC: {drawerTicket.pic}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {drawerTicket.deskripsi_keluhan}
                  </p>
                  <div className="text-[#15803d] font-medium pt-1">
                    Kompensasi:{" "}
                    {drawerTicket.kompensasi_item ||
                      "1x Es Teh Jumbo Solo (Rp 0)"}
                  </div>
                </div>

                {drawerTicket.kronologi_audit &&
                  drawerTicket.kronologi_audit.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-col gap-2 text-xs">
                        <span className="font-medium text-muted-foreground">
                          Riwayat Penanganan
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {drawerTicket.kronologi_audit.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-baseline gap-2"
                            >
                              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                                {step.waktu}
                              </span>
                              <span className="text-foreground">
                                {step.deskripsi}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                <Separator />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Pesan Tindak Lanjut WA
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setTemplateModalOpen(true)}
                      >
                        <MessageSquareText data-icon="inline-start" />
                        Preset
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          void navigator.clipboard.writeText(waDraft);
                          showToast("Draft disalin.");
                        }}
                      >
                        <Copy data-icon="inline-start" />
                        Salin
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    rows={4}
                    value={waDraft}
                    onChange={(e) => setWaDraft(e.target.value)}
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>

              <SheetFooter className="border-t pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleSendWa(drawerTicket)}
                >
                  <Send data-icon="inline-start" />
                  Kirim via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void handleGrantCompensation(drawerTicket)}
                >
                  <Gift data-icon="inline-start" />
                  Catat Kompensasi Es Teh Rp0
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={drawerTicket.status === "Selesai"}
                  onClick={() => handleResolveTicket(drawerTicket)}
                >
                  <CheckCircle2 data-icon="inline-start" />
                  {drawerTicket.status === "Selesai"
                    ? "Sudah Selesai"
                    : "Tandai Selesai"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Preset Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preset Pesan Keluhan</DialogTitle>
            <DialogDescription>
              Pilih kalimat cepat untuk diisi ke editor tindak lanjut.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="h-auto justify-start text-left py-3 px-3.5"
              onClick={() => applyDraftPreset("keterlambatan")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-semibold text-destructive">
                  /sla-teh · Terlambat &gt;20 Menit
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  Permohonan maaf dan 1x Es Teh Jumbo gratis.
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto justify-start text-left py-3 px-3.5"
              onClick={() => applyDraftPreset("salah-racik")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-semibold text-primary">
                  /salah-racik · Ganti Porsi Prioritas
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  Masak ulang porsi baru prioritas tanpa biaya tambahan.
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto justify-start text-left py-3 px-3.5"
              onClick={() => applyDraftPreset("kupon")}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-semibold text-[#15803d]">
                  /kupon · Voucher Diskon 15%
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  Kompensasi voucher kunjungan berikutnya.
                </span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-md">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
