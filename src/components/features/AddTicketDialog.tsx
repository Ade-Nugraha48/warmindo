"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Ticket, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ticketSchema, type TicketFormData } from "@/types/ticket.schema";
import { createTicket } from "@/app/(admin)/keluhan/actions";
import { INITIAL_DEMO_CUSTOMERS } from "@/lib/demo-data";
import { maskPhoneNumber } from "@/lib/formatters";
import type { TicketRecord } from "@/types/ticket.record";
import type { Customer } from "@/types/database.types";

interface AddTicketDialogProps {
  onTicketAdded?: (ticket: TicketRecord) => void;
  customers?: Customer[];
}

export function AddTicketDialog({
  onTicketAdded,
  customers = INITIAL_DEMO_CUSTOMERS,
}: AddTicketDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      customer_id: customers[0]?.id || "",
      kategori: "Waktu Tunggu",
      deskripsi_keluhan: "",
      pic: "Dapur",
      diselesaikan_di_tempat: true,
    },
  });

  const onSubmit = async (values: TicketFormData) => {
    setServerError(null);
    setSuccessMsg(null);

    const res = await createTicket(values);
    if (!res.success || !res.data) {
      setServerError(res.error || "Gagal membuat tiket keluhan.");
      return;
    }

    setSuccessMsg(`Tiket keluhan #${res.data.id} berhasil dicatat!`);
    reset();

    if (onTicketAdded) {
      onTicketAdded(res.data);
    }

    setTimeout(() => {
      setSuccessMsg(null);
      setOpen(false);
    }, 1200);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setServerError(null);
      setSuccessMsg(null);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs gap-2">
            <Plus className="size-4" />
            <span>Tambah Tiket Keluhan</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[480px] p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600">
            <Ticket className="size-5" />
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Form Input Tiket Keluhan Baru
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Catat komplain pelanggan (waktu saji, pesanan, atau fasilitas) dan delegasikan PIC penangan (FR 4.1 – FR 4.3).
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Pilih Pelanggan */}
          <div className="space-y-1.5">
            <Label htmlFor="customer_id" className="text-xs font-semibold">
              Pelanggan Terkait <span className="text-red-500">*</span>
            </Label>
            <select
              id="customer_id"
              {...register("customer_id")}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama_panggilan} ({maskPhoneNumber(c.nomor_wa)})
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="text-[11px] text-red-500">{errors.customer_id.message}</p>
            )}
          </div>

          {/* Kategori Keluhan & PIC */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kategori" className="text-xs font-semibold">
                Kategori Keluhan <span className="text-red-500">*</span>
              </Label>
              <select
                id="kategori"
                {...register("kategori")}
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
              >
                <option value="Waktu Tunggu">Waktu Tunggu</option>
                <option value="Salah Pesanan">Salah Pesanan</option>
                <option value="Fasilitas">Fasilitas</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pic" className="text-xs font-semibold">
                PIC Penanggung Jawab <span className="text-red-500">*</span>
              </Label>
              <select
                id="pic"
                {...register("pic")}
                className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
              >
                <option value="Dapur">Dapur (Koki/Masak)</option>
                <option value="Lantai">Lantai (Pelayan/Kasir)</option>
                <option value="Admin">Admin (Sistem/Owner)</option>
              </select>
            </div>
          </div>

          {/* Deskripsi Keluhan */}
          <div className="space-y-1.5">
            <Label htmlFor="deskripsi_keluhan" className="text-xs font-semibold">
              Detail Deskripsi Keluhan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deskripsi_keluhan"
              placeholder="Contoh: Meja 4 minta telur 1/2 matang, tapi tersaji matang"
              {...register("deskripsi_keluhan")}
              className={errors.deskripsi_keluhan ? "border-red-500" : ""}
            />
            {errors.deskripsi_keluhan && (
              <p className="text-[11px] text-red-500">
                {errors.deskripsi_keluhan.message}
              </p>
            )}
          </div>

          {/* Selesai di Tempat (FCR) */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                {...register("diselesaikan_di_tempat")}
                className="mt-0.5 size-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Target Diselesaikan di Tempat (FCR &ge; 90%)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Centang jika komplain ditangani langsung saat pelanggan masih berada di warung.
                </span>
              </div>
            </label>
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Catat Tiket"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
