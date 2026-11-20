"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { createCustomer } from "@/app/(admin)/pelanggan/actions";
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
import { customerSchema, type CustomerFormData } from "@/types/customer.schema";
import type { Customer } from "@/types/database.types";

interface AddCustomerDialogProps {
  onCustomerAdded?: (customer: Customer) => void;
  trigger?: React.ReactElement;
  defaultName?: string;
}

const SEGMEN_OPTIONS = [
  { value: "Mahasiswa UPN", label: "Mahasiswa UPN" },
  { value: "Mahasiswa YKPN", label: "Mahasiswa YKPN" },
  { value: "Mahasiswa Atma Jaya", label: "Mahasiswa Atma Jaya" },
  { value: "Umum", label: "Umum / Kos Seturan" },
];

export function AddCustomerDialog({
  onCustomerAdded,
  trigger,
  defaultName = "",
}: AddCustomerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const buildDefaults = React.useCallback(
    (nameOverride = ""): CustomerFormData => ({
      nama_panggilan: nameOverride,
      nomor_wa: "",
      segmen: "Mahasiswa UPN",
      setuju_promo: true,
      label: "Begadang Nugas",
      preferensi_racikan: "Indomie Dok-Dok Kuah Nyemek • Level 3",
      meja_favorit: "Pojokan Meja 05",
    }),
    []
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: buildDefaults(defaultName),
  });

  const onSubmit = async (values: CustomerFormData) => {
    setServerError(null);
    setSuccessMsg(null);

    const result = await createCustomer(values);

    if (!result.success) {
      setServerError(result.error || "Gagal menambahkan pelanggan.");
      return;
    }

    setSuccessMsg(`Member "${values.nama_panggilan}" berhasil didaftarkan!`);
    reset(buildDefaults());

    if (result.data && onCustomerAdded) {
      onCustomerAdded(result.data);
    }

    setTimeout(() => {
      setSuccessMsg(null);
      setOpen(false);
    }, 1000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setServerError(null);
    setSuccessMsg(null);
    reset(buildDefaults(newOpen ? defaultName.trim() : ""));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <UserPlus data-icon="inline-start" />
              <span>Tambah Pelanggan</span>
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-lg font-sans">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>
            Nomor WhatsApp dicek otomatis untuk mencegah data ganda.
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
              <Label htmlFor="nama_panggilan" className="text-xs">
                Nama Panggilan *
              </Label>
              <Input
                id="nama_panggilan"
                placeholder="Contoh: Rizki Pratama"
                {...register("nama_panggilan")}
              />
              {errors.nama_panggilan && (
                <p className="text-xs text-destructive">
                  {errors.nama_panggilan.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nomor_wa" className="text-xs">
                Nomor WhatsApp *
              </Label>
              <Input
                id="nomor_wa"
                placeholder="081234567890"
                {...register("nomor_wa")}
                className="font-mono"
              />
              {errors.nomor_wa && (
                <p className="text-xs text-destructive">
                  {errors.nomor_wa.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Segmen Kampus *</Label>
              <Controller
                control={control}
                name="segmen"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    items={SEGMEN_OPTIONS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SEGMEN_OPTIONS.map((opt) => (
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
              <Label htmlFor="label" className="text-xs">
                Label Aktivitas
              </Label>
              <Input
                id="label"
                placeholder="Begadang Nugas / Member Malam"
                {...register("label")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferensi_racikan" className="text-xs">
              Preferensi Racikan Koki
            </Label>
            <Input
              id="preferensi_racikan"
              placeholder="Contoh: Indomie Dok-Dok Level 3 • Telur 1/2 Matang"
              {...register("preferensi_racikan")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meja_favorit" className="text-xs">
              Meja Favorit
            </Label>
            <Input
              id="meja_favorit"
              placeholder="Contoh: Pojokan Meja 05 (Dekat Stopkontak)"
              {...register("meja_favorit")}
            />
          </div>

          <Controller
            control={control}
            name="setuju_promo"
            render={({ field }) => (
              <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 p-2.5">
                <Checkbox
                  id="add-cust-promo"
                  checked={Boolean(field.value)}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                />
                <Label
                  htmlFor="add-cust-promo"
                  className="text-xs font-normal cursor-pointer"
                >
                  Setuju menerima promo WhatsApp &amp; diskon Begadang Nugas
                  (10%)
                </Label>
              </div>
            )}
          />

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  <span>Menyimpan Member...</span>
                </>
              ) : (
                <span>Daftarkan Member (+1 Stempel Perdana)</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
