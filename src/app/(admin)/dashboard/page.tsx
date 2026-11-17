import * as React from "react";
import {
  Clock,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  Flame,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dashboard KPI & Monitoring Performa
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pemantauan efisiensi operasional dan loyalitas pelanggan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Realtime Analytics
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Waktu Saji Jam Normal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Waktu Saji (Jam Normal)
            </CardTitle>
            <Clock className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              9.4 mnt
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              ✓ Sesuai target SLA (&lt; 15 menit)
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Waktu Saji Jam Sibuk */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Waktu Saji (Jam Sibuk)
            </CardTitle>
            <Flame className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              13.8 mnt
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              ✓ Terkendali (&lt; 20 menit)
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Response Time WhatsApp */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Respon WhatsApp Admin
            </CardTitle>
            <MessageCircle className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              3.2 mnt
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              ✓ Target tercapai (&lt; 5 menit)
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: First Call Resolution (FCR) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-zinc-500">
              First Call Resolution (FCR)
            </CardTitle>
            <CheckCircle2 className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              94.2%
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              ✓ Di atas standar target (&ge; 90%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights & Top Menu */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              5 Menu Terlaris Minggu Ini
            </CardTitle>
            <CardDescription>
              Pesanan paling sering dipesan oleh member & pelanggan umum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Indomie Goreng Dok-dok Spesial", porsi: 142, pct: "85%" },
                { name: "Magelangan Telur Orak-Arik", porsi: 98, pct: "65%" },
                { name: "Nasi Ayam Geprek Sambal Korek", porsi: 84, pct: "55%" },
                { name: "Es Teh Manis Jumbo", porsi: 210, pct: "95%" },
                { name: "Nutrisari Jeruk Peras Dingin", porsi: 76, pct: "45%" },
              ].map((menu, i) => (
                <div key={menu.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                      {i + 1}
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {menu.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    {menu.porsi} porsi
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-500" />
              Efektivitas Kampanye Reaktivasi
            </CardTitle>
            <CardDescription>
              Status konversi pesan WhatsApp Win-Back untuk pelanggan pasif
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Broadcast Begadang Nugas</span>
                <Badge variant="secondary">Jumat 22.00</Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                42 terkirim · 18 member datang dalam 3 hari (Konversi: 42.8%)
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Template Sapaan Kangen (/kangen)</span>
                <Badge variant="secondary">Pasif &gt;14 Hari</Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                25 kontak dihubungi · 11 pelanggan kembali berkunjung (Konversi: 44.0%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
