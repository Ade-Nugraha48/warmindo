"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { createTicket } from "@/app/(admin)/keluhan/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INITIAL_DEMO_CUSTOMERS } from "@/lib/demo-data";
import { maskPhoneNumber } from "@/lib/formatters";
import type { Customer } from "@/types/database.types";
import type { TicketRecord } from "@/types/ticket.record";
import { ticketSchema, type TicketFormData } from "@/types/ticket.schema";

interface AddTicketDialogProps {
  onTicketAdded?: (ticket: TicketRecord) => void;
  customers?: Customer[];
}

const KATEGORI_OPTIONS = [
  { value: "Waktu Tunggu", label: "Waktu Tunggu (SLA)" },
  { value: "Salah Pesanan", label: "Salah Pesanan / Racik" },
  { value: "Fasilitas", label: "Fasilitas Meja / WiFi" },
];

const PIC_OPTIONS = [
  { value: "Dapur", label: "Dapur" },
  { value: "Lantai", label: "Lantai" },
  { value: "Admin", label: "Admin / Kasir" },
];

export function AddTicketDialog({
  onTicketAdded,
  customers = INITIAL_DEMO_CUSTOMERS,
}: AddTicketDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const customerOptions = React.useMemo(
    () =>
      customers.map((c) => ({
        value: c.id,
        label: `${c.nama_panggilan} (${maskPhoneNumber(c.nomor_wa)})`,
      })),
    [customers]
  );

  const {
    control,
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
      nomor_meja: "Meja 05",
      kompensasi_item: "1x Es Teh Jumbo Solo (Rp 0)",
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

    setSuccessMsg(
      `Tiket keluhan ${res.data.kode_tiket || res.data.id} berhasil dicatat!`
    );
    reset();

    if (onTicketAdded) {
      onTicketAdded(res.data);
    }

    setTimeout(() => {
      setSuccessMsg(null);
      setOpen(false);
    }, 1000);
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
          <Button>
            <Plus data-icon="inline-start" />
            <span>Buat Tiket</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg font-sans">
        <DialogHeader>
          <DialogTitle>Buat Tiket Keluhan</DialogTitle>
          <DialogDescription>
            Catat keluhan pelanggan dan tentukan PIC penanganannya.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-600/25 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Pelanggan *</Label>
              <Controller
                control={control}
                name="customer_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    items={customerOptions}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {customerOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nomor_meja" className="text-xs">
                Nomor Meja
              </Label>
              <Input
                id="nomor_meja"
                placeholder="Contoh: Meja 07"
                {...register("nomor_meja")}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Kategori Keluhan *</Label>
              <Controller
                control={control}
                name="kategori"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    items={KATEGORI_OPTIONS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {KATEGORI_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">PIC Penanggung Jawab *</Label>
              <Controller
                control={control}
                name="pic"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    items={PIC_OPTIONS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PIC_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deskripsi_keluhan" className="text-xs">
              Deskripsi Kendala *
            </Label>
            <Textarea
              id="deskripsi_keluhan"
              rows={3}
              {...register("deskripsi_keluhan")}
              placeholder="Contoh: Pesanan Indomie Kari Dobel Telur sudah 19 menit belum tersaji..."
              className="text-xs"
            />
            {errors.deskripsi_keluhan && (
              <p className="text-xs text-destructive">
                {errors.deskripsi_keluhan.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kompensasi_item" className="text-xs">
              Kompensasi yang Disiapkan
            </Label>
            <Input
              id="kompensasi_item"
              placeholder="Contoh: 1x Es Teh Jumbo Solo (Rp 0)"
              {...register("kompensasi_item")}
            />
          </div>

          <Controller
            control={control}
            name="diselesaikan_di_tempat"
            render={({ field }) => (
              <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 p-2.5">
                <Checkbox
                  id="add-ticket-fcr"
                  checked={Boolean(field.value)}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                />
                <Label
                  htmlFor="add-ticket-fcr"
                  className="text-xs font-normal cursor-pointer"
                >
                  Dapat diselesaikan di tempat (First Contact Resolution / FCR)
                </Label>
              </div>
            )}
          />

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  <span>Mencatat Tiket...</span>
                </>
              ) : (
                <span>Simpan Tiket Keluhan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
