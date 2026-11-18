"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserPlus, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
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
import { customerSchema, type CustomerFormData } from "@/types/customer.schema";
import { createCustomer } from "@/app/(admin)/pelanggan/actions";
import type { Customer } from "@/types/database.types";

interface AddCustomerDialogProps {
  onCustomerAdded?: (customer: Customer) => void;
}

export function AddCustomerDialog({ onCustomerAdded }: AddCustomerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nama_panggilan: "",
      nomor_wa: "",
      segmen: "Umum",
      setuju_promo: true,
      label: "Pelanggan Baru",
    },
  });

  const onSubmit = async (values: CustomerFormData) => {
    setServerError(null);
    setSuccessMsg(null);

    const result = await createCustomer(values);

    if (!result.success) {
      setServerError(result.error || "Gagal menambahkan pelanggan.");
      return;
    }

    setSuccessMsg(`Pelanggan "${values.nama_panggilan}" berhasil didaftarkan!`);
    reset();

    if (result.data && onCustomerAdded) {
      onCustomerAdded(result.data);
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
            <span>Tambah Pelanggan</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[480px] p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600">
            <UserPlus className="size-5" />
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Registrasi Pelanggan Baru
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Daftarkan profil baru ke Single Customer View. Nomor WhatsApp divalidasi unik untuk mencegah data ganda (FR 2.2).
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
          {/* Nama Panggilan */}
          <div className="space-y-1.5">
            <Label htmlFor="nama_panggilan" className="text-xs font-semibold">
              Nama Panggilan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_panggilan"
              placeholder="Contoh: Dimas / Clara"
              {...register("nama_panggilan")}
              className={errors.nama_panggilan ? "border-red-500" : ""}
            />
            {errors.nama_panggilan && (
              <p className="text-[11px] text-red-500">
                {errors.nama_panggilan.message}
              </p>
            )}
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="nomor_wa" className="text-xs font-semibold">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nomor_wa"
              type="tel"
              placeholder="081234567890 atau 6281234567890"
              {...register("nomor_wa")}
              className={errors.nomor_wa ? "border-red-500" : ""}
            />
            {errors.nomor_wa && (
              <p className="text-[11px] text-red-500">{errors.nomor_wa.message}</p>
            )}
            <p className="text-[10px] text-zinc-400">
              Sistem akan memvalidasi agar nomor ini belum pernah terdaftar sebelumnya.
            </p>
          </div>

          {/* Segmen Kampus */}
          <div className="space-y-1.5">
            <Label htmlFor="segmen" className="text-xs font-semibold">
              Segmen Pelanggan
            </Label>
            <select
              id="segmen"
              {...register("segmen")}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
            >
              <option value="Mahasiswa UPN">Mahasiswa UPN</option>
              <option value="Mahasiswa Atma Jaya">Mahasiswa Atma Jaya</option>
              <option value="Umum">Umum</option>
            </select>
            {errors.segmen && (
              <p className="text-[11px] text-red-500">{errors.segmen.message}</p>
            )}
          </div>

          {/* Label Pelanggan */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs font-semibold">
              Label Pelanggan (Opsional)
            </Label>
            <select
              id="label"
              {...register("label")}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
            >
              <option value="Member Malam">Member Malam (Aktif Malam/Nongkrong)</option>
              <option value="Pelanggan Pasif">Pelanggan Pasif</option>
              <option value="Booking Meja">Booking Meja (Sering Reservasi)</option>
              <option value="Pelanggan Baru">Pelanggan Baru</option>
            </select>
          </div>

          {/* Persetujuan Promo (Checkbox) */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                {...register("setuju_promo")}
                className="mt-0.5 size-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Setuju Menerima Promo & Broadcast WA
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Pelanggan mengizinkan pengiriman voucher diskon & info menu lewat WhatsApp.
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
                "Simpan Pelanggan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
