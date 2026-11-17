import * as React from "react";
import { Receipt, AlertTriangle, Gift } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TransaksiPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Receipt className="size-6 text-amber-500" />
          Point of Sales & Stempel Loyalitas
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pencatatan nota kasir, akumulasi stempel member, dan pemantauan batas waktu saji pesanan.
        </p>
      </div>

      {/* Alert Kompensasi Waktu Saji */}
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        <AlertTriangle className="size-5 shrink-0 text-red-600 mt-0.5" />
        <div className="text-sm">
          <span className="font-bold">Peringatan Keterlambatan Waktu Saji (&gt;20 Menit):</span>
          <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
            Jika pesanan pelanggan melewati 20 menit pada jam sibuk, kasir diwajibkan memberikan kompensasi gratis Es Teh Manis atau Kerupuk Kaleng.
          </p>
        </div>
      </div>

      {/* Grid: Status Stempel & Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Input Transaksi Kasir</CardTitle>
            <CardDescription>
              Masukkan 4 digit nomor WA pelanggan untuk mengakumulasi stempel loyalitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-800">
              <Receipt className="mx-auto size-8 text-zinc-400 mb-2" />
              <p className="text-sm font-medium">Modul Form Transaksi Siap Dihubungkan</p>
              <p className="text-xs text-zinc-400 mt-1">
                Kalkulasi otomatis stempel (Beli 5x gratis 1x) & timer waktu saji.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="size-4 text-amber-500" />
              Aturan Stempel
            </CardTitle>
            <CardDescription>Mekanisme Loyalitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-zinc-500">Target Stempel</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">5 Stempel</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-zinc-500">Reward Member</span>
              <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50">
                1 Porsi Makan Gratis
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Reset Stempel</span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Otomatis kembali 0/5</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
