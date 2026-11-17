import * as React from "react";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PelangganPage() {
  const dummyCustomers = [
    {
      id: "CUST-001",
      nama: "Dimas Anggara",
      wa: "0812****4321",
      segmen: "Mahasiswa UPN",
      setujuPromo: true,
      label: "Member Malam",
      stempel: 4,
      terakhir: "16 Nov 2026, 21:30",
    },
    {
      id: "CUST-002",
      nama: "Clara Vania",
      wa: "0819****8890",
      segmen: "Mahasiswa Atma Jaya",
      setujuPromo: true,
      label: "Booking Meja",
      stempel: 5,
      terakhir: "15 Nov 2026, 13:15",
    },
    {
      id: "CUST-003",
      nama: "Rizky Pratama",
      wa: "0857****1122",
      segmen: "Umum",
      setujuPromo: false,
      label: "Pelanggan Pasif",
      stempel: 1,
      terakhir: "01 Nov 2026, 19:00",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="size-6 text-amber-500" />
            Data Pelanggan (Single Customer View)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pusat database profil pelanggan, stempel loyalitas, dan preferensi promo.
          </p>
        </div>
        <div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Plus className="size-4" />
            Tambah Pelanggan Baru
          </Button>
        </div>
      </div>

      {/* Search and Filter Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Pencarian Cepat</CardTitle>
          <CardDescription>
            Ketik nama panggilan atau 4 digit terakhir nomor WhatsApp pelanggan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              placeholder="Cari contoh: 'Dimas' atau '4321'..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Pelanggan Terdaftar</CardTitle>
          <CardDescription>
            Menampilkan data kontak, segmentasi kampus, dan jumlah stempel terkumpul
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Nama Pelanggan</th>
                  <th className="px-4 py-3">No. WhatsApp</th>
                  <th className="px-4 py-3">Segmen</th>
                  <th className="px-4 py-3">Stempel</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Persetujuan Promo</th>
                  <th className="px-4 py-3">Kunjungan Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {dummyCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {cust.nama}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                      {cust.wa}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="text-xs">
                        {cust.segmen}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-amber-600">
                        {cust.stempel}/5
                      </span>
                      {cust.stempel === 5 && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          SIAP BONUS
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className="text-xs">
                        {cust.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {cust.setujuPromo ? (
                        <span className="text-xs font-medium text-emerald-600">
                          ✓ Bersedia
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-500">
                          ✗ Menolak
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">
                      {cust.terakhir}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
