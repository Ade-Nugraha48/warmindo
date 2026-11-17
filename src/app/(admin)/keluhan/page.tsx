import * as React from "react";
import { Ticket, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function KeluhanPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Ticket className="size-6 text-amber-500" />
            Penanganan Keluhan & SLA (Helpdesk)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pencatatan tiket masalah, delegasi PIC internal, dan tracking penyelesaian komplain (FCR).
          </p>
        </div>
        <div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Plus className="size-4" />
            Buat Tiket Baru
          </Button>
        </div>
      </div>

      {/* Kanban Overview Columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Kolom 1: Baru */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" />
                Tiket Baru Masuk
              </CardTitle>
              <Badge variant="secondary">1 Tiket</Badge>
            </div>
            <CardDescription className="text-xs">
              Keluhan baru diterima dari pelanggan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span>#TK-008 · Waktu Tunggu</span>
                <Badge variant="outline" className="text-[10px]">PIC: Dapur</Badge>
              </div>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Pesanan mie goreng meja 4 belum diantar setelah 22 menit.
              </p>
              <div className="mt-2 text-[10px] text-zinc-400">
                Masuk: 12 menit yang lalu
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom 2: Diproses */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-blue-500" />
                Sedang Diproses
              </CardTitle>
              <Badge variant="secondary">1 Tiket</Badge>
            </div>
            <CardDescription className="text-xs">
              PIC sedang menangani komplain di lantai/dapur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span>#TK-007 · Salah Pesanan</span>
                <Badge variant="outline" className="text-[10px]">PIC: Lantai</Badge>
              </div>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Minta telur setengah matang tetapi tersaji matang. Sedang diganti.
              </p>
              <div className="mt-2 text-[10px] text-zinc-400">
                Status: Penggantian porsi baru
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom 3: Selesai */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-500" />
                Selesai (FCR)
              </CardTitle>
              <Badge variant="secondary">12 Tiket</Badge>
            </div>
            <CardDescription className="text-xs">
              Terselesaikan di tempat & terkirim konfirmasi WA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs opacity-75">
              <div className="flex items-center justify-between font-semibold">
                <span>#TK-006 · Fasilitas</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">
                  WA Terkirim
                </Badge>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Tisu di meja 8 habis, staf lantai telah mengisi ulang.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
