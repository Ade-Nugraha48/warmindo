"use client";

import * as React from "react";
import { Ticket, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { AddTicketDialog } from "@/components/features/AddTicketDialog";
import { TicketKanbanBoard } from "@/components/features/TicketKanbanBoard";
import type { TicketRecord } from "@/types/ticket.record";
import type { Customer } from "@/types/database.types";

interface TicketManagementViewProps {
  initialTickets: TicketRecord[];
  customers?: Customer[];
}

export function TicketManagementView({
  initialTickets,
  customers,
}: TicketManagementViewProps) {
  const [tickets, setTickets] = React.useState<TicketRecord[]>(initialTickets);

  const handleTicketAdded = (newTicket: TicketRecord) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleTicketUpdated = (updated: TicketRecord) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // Metrics
  const activeCount = tickets.filter(
    (t) => t.status === "Baru" || t.status === "Diproses"
  ).length;
  const completedCount = tickets.filter((t) => t.status === "Selesai").length;
  const fcrCount = tickets.filter(
    (t) => t.status === "Selesai" && t.diselesaikan_di_tempat
  ).length;
  const fcrRate =
    completedCount > 0 ? Math.round((fcrCount / completedCount) * 100) : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Ticket className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Penanganan Keluhan Pelanggan (Helpdesk SLA)
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Papan Kanban status komplain, delegasi PIC internal, dan notifikasi otomatis WhatsApp /tiketselesai (FR 4.1 – FR 4.4).
          </p>
        </div>

        {/* Action: Add Ticket Dialog */}
        <AddTicketDialog onTicketAdded={handleTicketAdded} customers={customers} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* Total Tiket */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Ticket className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Total Keluhan Masuk</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {tickets.length} Tiket
            </div>
          </div>
        </div>

        {/* Tiket Aktif */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertCircle className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Tiket Perlu Ditangani</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {activeCount} Aktif
            </div>
          </div>
        </div>

        {/* FCR Rate */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">First Call Resolution</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {fcrRate}% (Target &ge; 90%)
            </div>
          </div>
        </div>

        {/* Tiket Selesai */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Berhasil Diselesaikan</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {completedCount} Tiket
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Component */}
      <TicketKanbanBoard tickets={tickets} onTicketUpdated={handleTicketUpdated} />
    </div>
  );
}
