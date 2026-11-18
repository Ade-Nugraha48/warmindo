"use client";

import * as React from "react";
import {
  Kanban,
  Table as TableIcon,
  Filter,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketCard } from "@/components/features/TicketCard";
import { maskPhoneNumber, formatIndonesianDate } from "@/lib/formatters";
import type { TicketRecord } from "@/types/ticket.record";

interface TicketKanbanBoardProps {
  tickets: TicketRecord[];
  onTicketUpdated?: (updated: TicketRecord) => void;
}

export function TicketKanbanBoard({
  tickets,
  onTicketUpdated,
}: TicketKanbanBoardProps) {
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("Semua");

  const categories = ["Semua", "Waktu Tunggu", "Salah Pesanan", "Fasilitas"];

  const filteredTickets = React.useMemo(() => {
    if (categoryFilter === "Semua") return tickets;
    return tickets.filter((t) => t.kategori === categoryFilter);
  }, [tickets, categoryFilter]);

  const baruTickets = filteredTickets.filter((t) => t.status === "Baru");
  const diprosesTickets = filteredTickets.filter((t) => t.status === "Diproses");
  const selesaiTickets = filteredTickets.filter((t) => t.status === "Selesai");

  // Calculate FCR (First Call Resolution: percentage of completed tickets resolved on-site)
  const completedTickets = tickets.filter((t) => t.status === "Selesai");
  const fcrTickets = completedTickets.filter((t) => t.diselesaikan_di_tempat);
  const fcrPercentage =
    completedTickets.length > 0
      ? Math.round((fcrTickets.length / completedTickets.length) * 100)
      : 100;

  return (
    <div className="space-y-4 font-sans">
      {/* View Switcher and Category Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="size-3.5 text-zinc-400 mr-1 shrink-0" />
          <span className="text-xs text-zinc-400 mr-1 shrink-0 font-medium">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                categoryFilter === cat
                  ? "bg-amber-500 text-white font-semibold shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Kanban className="size-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <TableIcon className="size-3.5" />
              Tabel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Baru */}
          <div className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Tiket Baru
                </h3>
              </div>
              <Badge variant="outline" className="text-[11px] font-bold border-amber-300 text-amber-700 bg-amber-50">
                {baruTickets.length}
              </Badge>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[680px]">
              {baruTickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  Tidak ada tiket baru
                </div>
              ) : (
                baruTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} onTicketUpdated={onTicketUpdated} />
                ))
              )}
            </div>
          </div>

          {/* Column 2: Diproses */}
          <div className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Sedang Diproses
                </h3>
              </div>
              <Badge variant="outline" className="text-[11px] font-bold border-blue-300 text-blue-700 bg-blue-50">
                {diprosesTickets.length}
              </Badge>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[680px]">
              {diprosesTickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  Tidak ada tiket yang sedang diproses
                </div>
              ) : (
                diprosesTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} onTicketUpdated={onTicketUpdated} />
                ))
              )}
            </div>
          </div>

          {/* Column 3: Selesai */}
          <div className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Selesai (FCR {fcrPercentage}%)
                </h3>
              </div>
              <Badge variant="outline" className="text-[11px] font-bold border-emerald-300 text-emerald-700 bg-emerald-50">
                {selesaiTickets.length}
              </Badge>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[680px]">
              {selesaiTickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  Belum ada tiket yang diselesaikan
                </div>
              ) : (
                selesaiTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} onTicketUpdated={onTicketUpdated} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[90px] text-xs font-semibold uppercase text-zinc-500">
                  ID Tiket
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  Pelanggan
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  Kategori
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  Deskripsi Keluhan
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  PIC
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  Waktu Masuk
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-zinc-500">
                  WA Notif
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-zinc-400">
                    Tidak ada tiket keluhan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((t) => (
                  <TableRow key={t.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                    <TableCell className="font-mono text-xs font-bold text-zinc-500">
                      #{t.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {t.customer_nama}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {maskPhoneNumber(t.customer_wa)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {t.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xs">
                      {t.deskripsi_keluhan}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {t.pic}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold ${
                          t.status === "Baru"
                            ? "bg-amber-100 text-amber-800"
                            : t.status === "Diproses"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400 whitespace-nowrap">
                      {formatIndonesianDate(t.waktu_masuk)}
                    </TableCell>
                    <TableCell>
                      {t.pesan_konfirmasi_terkirim ? (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="size-3" />
                          Terkirim
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
