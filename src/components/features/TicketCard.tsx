"use client";

import * as React from "react";
import {
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  ChefHat,
  Footprints,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { maskPhoneNumber } from "@/lib/formatters";
import { updateTicketStatus } from "@/app/(admin)/keluhan/actions";
import type { TicketRecord } from "@/types/ticket.record";
import type { StatusTiket } from "@/types/database.types";

interface TicketCardProps {
  ticket: TicketRecord;
  onTicketUpdated?: (updated: TicketRecord) => void;
}

export function TicketCard({ ticket, onTicketUpdated }: TicketCardProps) {
  const [waDialogOpen, setWaDialogOpen] = React.useState(false);

  const getPicIcon = (pic: string) => {
    switch (pic) {
      case "Dapur":
        return <ChefHat className="size-3 text-amber-600" />;
      case "Lantai":
        return <Footprints className="size-3 text-blue-600" />;
      default:
        return <User className="size-3 text-zinc-600" />;
    }
  };

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "Waktu Tunggu":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
          >
            {kategori}
          </Badge>
        );
      case "Salah Pesanan":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
          >
            {kategori}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {kategori}
          </Badge>
        );
    }
  };

  const handleStatusSelect = async (newStatus: StatusTiket) => {
    if (newStatus === ticket.status) return;

    // Requirement: If changed to "Selesai", trigger the WhatsApp confirmation modal
    if (newStatus === "Selesai") {
      setWaDialogOpen(true);
      return;
    }

    // Direct update for other statuses
    const res = await updateTicketStatus(ticket.id, newStatus, false);
    if (res.success && onTicketUpdated) {
      onTicketUpdated({
        ...ticket,
        status: newStatus,
        waktu_selesai: null,
      });
    }
  };

  const confirmCompleteWithWa = async (sendWa: boolean) => {
    setWaDialogOpen(false);
    const res = await updateTicketStatus(ticket.id, "Selesai", sendWa);

    if (sendWa && ticket.customer_wa) {
      const template = encodeURIComponent(
        `Halo Kak ${ticket.customer_nama}! Keluhan mengenai "${ticket.kategori}" (${ticket.deskripsi_keluhan}) di Warmindo Sumber Rizki 2 telah berhasil kami tangani dan selesaikan oleh tim ${ticket.pic}. Mohon maaf atas ketidaknyamanannya dan terima kasih atas kesabarannya! /tiketselesai`
      );
      window.open(`https://wa.me/${ticket.customer_wa.replace(/\D/g, "")}?text=${template}`, "_blank");
    }

    if (res.success && onTicketUpdated) {
      onTicketUpdated({
        ...ticket,
        status: "Selesai",
        waktu_selesai: res.data?.waktu_selesai || new Date().toISOString(),
        pesan_konfirmasi_terkirim: sendWa,
      });
    }
  };

  const formatElapsed = (isoTime: string) => {
    const d = new Date(isoTime);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-950 space-y-3 font-sans">
        {/* Top: ID, Kategori, Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-zinc-500">
              #{ticket.id}
            </span>
            {getKategoriBadge(ticket.kategori)}
          </div>

          {/* Status Dropdown */}
          <select
            value={ticket.status}
            onChange={(e) => handleStatusSelect(e.target.value as StatusTiket)}
            className={`rounded-md px-2 py-1 text-xs font-bold shadow-2xs outline-none border transition-colors cursor-pointer ${
              ticket.status === "Baru"
                ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : ticket.status === "Diproses"
                ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            <option value="Baru">Baru</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        {/* Pelanggan Info */}
        <div className="flex items-center justify-between text-xs border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {ticket.customer_nama}
          </span>
          <span className="font-mono text-zinc-400">
            {maskPhoneNumber(ticket.customer_wa)}
          </span>
        </div>

        {/* Deskripsi Keluhan */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
          {ticket.deskripsi_keluhan}
        </p>

        {/* Footer: PIC, Waktu, WA status */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            {getPicIcon(ticket.pic)}
            <span>PIC: {ticket.pic}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="size-3 text-zinc-400" />
            <span>{formatElapsed(ticket.waktu_masuk)}</span>
          </div>
        </div>

        {/* Status Konfirmasi WA */}
        {ticket.status === "Selesai" && (
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px] dark:border-zinc-800">
            <span className="text-zinc-400">Notifikasi WA (/tiketselesai):</span>
            {ticket.pesan_konfirmasi_terkirim ? (
              <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 flex items-center gap-0.5">
                <CheckCircle2 className="size-2.5" />
                Terkirim
              </Badge>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setWaDialogOpen(true);
                }}
                className="text-amber-600 hover:underline flex items-center gap-0.5"
              >
                <Send className="size-2.5" />
                Kirim Sekarang
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog: "Kirim notifikasi selesai ke WA pelanggan?" */}
      <Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
        <DialogContent className="sm:max-w-[420px] p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-sans">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600">
              <MessageCircle className="size-5" />
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Kirim Notifikasi Penyelesaian via WhatsApp?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-zinc-500">
              Tiket #{ticket.id} diubah ke status <strong>Selesai</strong>. Sesuai prosedur FR 4.d, Anda dapat memicu pesan konfirmasi otomatis ke pelanggan.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950/60 space-y-1.5">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Template Pesan /tiketselesai:
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 italic">
              &quot;Halo Kak {ticket.customer_nama}! Keluhan mengenai &apos;{ticket.kategori}&apos; di Warmindo Sumber Rizki 2 telah diselesaikan oleh tim {ticket.pic}. Terima kasih atas kesabarannya!&quot;
            </p>
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => confirmCompleteWithWa(false)}
            >
              Selesaikan Tanpa WA
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => confirmCompleteWithWa(true)}
            >
              <Send className="size-3.5" />
              Kirim Notifikasi WA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
