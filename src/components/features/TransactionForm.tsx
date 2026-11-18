"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Receipt,
  Search,
  Gift,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Flame,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionSchema, type TransactionFormData } from "@/types/transaction.schema";
import { searchCustomerByWa, createTransaction } from "@/app/(admin)/transaksi/actions";
import { maskPhoneNumber, formatRupiah } from "@/lib/formatters";
import type { Customer } from "@/types/database.types";
import type { TransactionRecord } from "@/types/transaction.record";

interface TransactionFormProps {
  onTransactionCreated?: (newTrx: TransactionRecord) => void;
}

const PRESET_MENUS = [
  { name: "Indomie Goreng Dok-dok Spesial", price: 15000 },
  { name: "Magelangan Telur Orak-Arik", price: 16000 },
  { name: "Nasi Ayam Geprek Sambal Korek", price: 18000 },
  { name: "Es Teh Manis Jumbo", price: 4000 },
  { name: "Nutrisari Dingin", price: 5000 },
];

export function TransactionForm({ onTransactionCreated }: TransactionFormProps) {
  // 4-digit WA search state
  const [waQuery, setWaQuery] = React.useState("");
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [searchResults, setSearchResults] = React.useState<Customer[]>([]);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Live order clock
  const [orderTimeDisplay, setOrderTimeDisplay] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setOrderTimeDisplay(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customer_id: "",
      menu_pesanan: "",
      jumlah_porsi: 1,
      total_harga: 0,
      is_jam_sibuk: false,
      claim_reward: false,
    },
  });

  const porsi = useWatch({ control, name: "jumlah_porsi" }) || 1;
  const isClaimReward = useWatch({ control, name: "claim_reward" });
  const isJamSibuk = useWatch({ control, name: "is_jam_sibuk" });

  // Search customer as cashier types 4 digits
  const handleWaSearch = async (val: string) => {
    setWaQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchCustomerByWa(val);
      setSearchResults(results);

      // Auto-select if exactly 1 match
      if (results.length === 1 && !selectedCustomer) {
        selectCustomer(results[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setValue("customer_id", cust.id);
    setSearchResults([]);
    setWaQuery(cust.nomor_wa.slice(-4)); // Display last 4 digits
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setValue("customer_id", "");
    setWaQuery("");
    setSearchResults([]);
  };

  const selectPresetMenu = (menuName: string, price: number) => {
    setValue("menu_pesanan", menuName);
    setValue("total_harga", price * porsi);
  };

  const onSubmit = async (values: TransactionFormData) => {
    setServerError(null);
    setSuccessMsg(null);

    const res = await createTransaction(values);
    if (!res.success || !res.data) {
      setServerError(res.error || "Gagal menyimpan transaksi");
      return;
    }

    setSuccessMsg(
      `Transaksi ${res.data.customer_nama} berhasil disimpan! Stempel sekarang: ${res.data.stempel_saat_ini}/5`
    );

    if (onTransactionCreated) {
      onTransactionCreated(res.data);
    }

    // Reset customer and form
    setTimeout(() => {
      reset({
        customer_id: "",
        menu_pesanan: "",
        jumlah_porsi: 1,
        total_harga: 0,
        is_jam_sibuk: isJamSibuk,
        claim_reward: false,
      });
      clearCustomer();
      setSuccessMsg(null);
    }, 2000);
  };

  const currentStamps = selectedCustomer?.stempel_loyalitas ?? 0;
  const isEligibleForBonus = currentStamps >= 5;

  return (
    <Card className="border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950 font-sans">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-white">
              <Receipt className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Input Transaksi Kasir</CardTitle>
              <CardDescription className="text-xs">
                Ketik 4 digit WA untuk auto-fill nama & akumulasi stempel (FR 3.1 - FR 3.4)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-mono font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Clock className="size-3.5 text-zinc-500" />
              <span>{orderTimeDisplay}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Bagian 1: Pencarian 4 Digit WA Pelanggan */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="wa_search" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <User className="size-3.5 text-amber-500" />
                Pencarian 4 Digit Terakhir WA Pelanggan
              </Label>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="text-[11px] text-zinc-500 hover:text-red-600 underline"
                >
                  Ganti Pelanggan
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
              <Input
                id="wa_search"
                type="text"
                placeholder="Ketik 4 digit WA (misal: '4321' atau '8890')..."
                value={waQuery}
                onChange={(e) => handleWaSearch(e.target.value)}
                className="pl-9 pr-8 text-xs font-mono bg-white dark:bg-zinc-950"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-zinc-400" />
              )}
            </div>

            {/* Dropdown Suggestions */}
            {searchResults.length > 0 && !selectedCustomer && (
              <div className="rounded-lg border border-zinc-200 bg-white p-1.5 shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400">
                  Ditemukan {searchResults.length} Pelanggan:
                </div>
                {searchResults.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => selectCustomer(cust)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-zinc-800"
                  >
                    <div>
                      <span className="font-bold">{cust.nama_panggilan}</span>
                      <span className="ml-2 font-mono text-zinc-500">
                        ({maskPhoneNumber(cust.nomor_wa)})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {cust.stempel_loyalitas ?? 0}/5 Stempel
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Customer Loyalty Card & Visual Stempel */}
            {selectedCustomer ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedCustomer.nama_panggilan}
                    </span>
                    <span className="ml-2 text-xs font-mono text-zinc-500">
                      {maskPhoneNumber(selectedCustomer.nomor_wa)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedCustomer.segmen || "Umum"}
                  </Badge>
                </div>

                {/* Stempel Indicator (Badge & 5 Stamps Circles) */}
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Kartu Loyalitas:
                    </span>
                    {/* Visual 5 Stamps */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((slot) => {
                        const isFilled = slot <= currentStamps;
                        return (
                          <div
                            key={slot}
                            className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                              isFilled
                                ? "bg-amber-500 text-white shadow-xs scale-105"
                                : "border border-dashed border-zinc-300 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                            }`}
                          >
                            {isFilled ? "★" : slot}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loyalty Badge */}
                  {isEligibleForBonus ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 flex items-center gap-1 animate-pulse">
                      <Gift className="size-3" />
                      SIAP KLAIM BONUS
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-bold text-amber-700 border-amber-300 bg-white dark:bg-zinc-900"
                    >
                      Stempel {currentStamps}/5
                    </Badge>
                  )}
                </div>

                {/* Option to Redeem Reward if 5 Stamps reached */}
                {isEligibleForBonus && (
                  <div className="mt-2 rounded-md border border-emerald-300 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950/50">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        {...register("claim_reward")}
                        className="size-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                        Klaim Bonus 1 Porsi Gratis (Reset Stempel ke 0/5 sesuai FR 3.d)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 italic">
                *Pencarian 4 digit nomor WA akan otomatis memuat nama pelanggan dan jumlah stempelnya.
              </p>
            )}

            {errors.customer_id && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.customer_id.message}
              </p>
            )}
          </div>

          {/* Bagian 2: Preset Menu Cepat */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Pilihan Menu Favorit Cepat:
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MENUS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => selectPresetMenu(m.name, m.price)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition-colors"
                >
                  {m.name} ({formatRupiah(m.price)})
                </button>
              ))}
            </div>
          </div>

          {/* Bagian 3: Input Menu & Porsi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="menu_pesanan" className="text-xs font-semibold">
                Menu Pesanan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="menu_pesanan"
                placeholder="Contoh: Indomie Dok-dok + Es Teh"
                {...register("menu_pesanan")}
                className={errors.menu_pesanan ? "border-red-500" : ""}
              />
              {errors.menu_pesanan && (
                <p className="text-[11px] text-red-500">{errors.menu_pesanan.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="jumlah_porsi" className="text-xs font-semibold">
                Jumlah Porsi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jumlah_porsi"
                type="number"
                min="1"
                {...register("jumlah_porsi", { valueAsNumber: true })}
                className={errors.jumlah_porsi ? "border-red-500" : ""}
              />
              {errors.jumlah_porsi && (
                <p className="text-[11px] text-red-500">{errors.jumlah_porsi.message}</p>
              )}
            </div>
          </div>

          {/* Bagian 4: Nominal Total Harga & Jam Sibuk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="total_harga" className="text-xs font-semibold">
                Total Harga (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="total_harga"
                type="number"
                step="500"
                placeholder="15000"
                {...register("total_harga", { valueAsNumber: true })}
                className={errors.total_harga ? "border-red-500" : ""}
              />
              {errors.total_harga && (
                <p className="text-[11px] text-red-500">{errors.total_harga.message}</p>
              )}
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  {...register("is_jam_sibuk")}
                  className="size-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Flame className="size-3.5 text-amber-500" />
                  Pesanan Saat Jam Sibuk (Rush Hour)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 shadow-xs gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan Transaksi...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                {isClaimReward
                  ? "Klaim Bonus & Selesaikan Nota (Reset 0/5)"
                  : "Simpan Transaksi (+1 Stempel Loyalitas)"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
