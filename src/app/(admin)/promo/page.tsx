"use client";

import * as React from "react";
import { Megaphone, MessageSquare, Send, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PromoPage() {
  const passiveCustomers = [
    {
      id: "P-01",
      nama: "Fajar Nugraha",
      wa: "628123456789",
      hariPasif: 18,
      setujuPromo: true,
      label: "Member Malam",
    },
    {
      id: "P-02",
      nama: "Anisa Rahma",
      wa: "628987654321",
      hariPasif: 21,
      setujuPromo: false,
      label: "Pelanggan Pasif",
    },
    {
      id: "P-03",
      nama: "Bayu Setiawan",
      wa: "628567890123",
      hariPasif: 15,
      setujuPromo: true,
      label: "Mahasiswa UPN",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Megaphone className="size-6 text-amber-500" />
            Promo Pasif & Marketing Automation
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Reaktivasi pelanggan pasif (&gt;14 hari) dan pengiriman broadcast promo terjadwal.
          </p>
        </div>
        <div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-xs">
            <Bell className="size-4" />
            Broadcast &quot;Begadang Nugas&quot; (Jumat Malam)
          </Button>
        </div>
      </div>

      {/* Target Reaktivasi Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Daftar Pelanggan Pasif (&gt;14 Hari Tidak Datang)</CardTitle>
              <CardDescription>
                Tombol WhatsApp aktif hanya jika pelanggan menyetujui promosi (GDPR/Privasi)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              3 Kontak Terdeteksi
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Hari Tidak Datang</th>
                  <th className="px-4 py-3">Label Pelanggan</th>
                  <th className="px-4 py-3">Persetujuan Promo</th>
                  <th className="px-4 py-3 text-right">Aksi Reaktivasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {passiveCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {cust.nama}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-amber-600">
                      {cust.hariPasif} hari yang lalu
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className="text-xs">
                        {cust.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {cust.setujuPromo ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          ✓ Setuju
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-500">
                          ✗ Tidak Setuju
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {cust.setujuPromo ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                          onClick={() => {
                            const text = encodeURIComponent(
                              `Halo ${cust.nama}! Kangen nongkrong di Warmindo Sumber Rizki 2 nih. Khusus buat kamu, dapatkan gratis Es Teh Manis setiap pemesanan mie favoritmu minggu ini!`
                            );
                            window.open(
                              `https://wa.me/${cust.wa}?text=${text}`,
                              "_blank"
                            );
                          }}
                        >
                          <Send className="size-3.5" />
                          Kirim WA (/kangen)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-xs text-zinc-400 border-zinc-200 dark:border-zinc-800"
                        >
                          <MessageSquare className="size-3.5 mr-1" />
                          WA Dinonaktifkan
                        </Button>
                      )}
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
