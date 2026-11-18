"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { maskPhoneNumber, formatIndonesianDate } from "@/lib/formatters";
import type { Customer } from "@/types/database.types";
import { Gift, ShieldAlert, Sparkles, UserX } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
}

export function CustomerTable({ customers, isLoading = false }: CustomerTableProps) {
  const getSegmentBadge = (segmen: string | null) => {
    switch (segmen) {
      case "Mahasiswa UPN":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            Mahasiswa UPN
          </Badge>
        );
      case "Mahasiswa Atma Jaya":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
          >
            Mahasiswa Atma Jaya
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {segmen || "Umum"}
          </Badge>
        );
    }
  };

  const getLabelBadge = (label: string | null) => {
    if (!label) return <span className="text-xs text-zinc-400">-</span>;
    if (label.toLowerCase().includes("malam")) {
      return (
        <Badge
          variant="secondary"
          className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        >
          {label}
        </Badge>
      );
    }
    if (label.toLowerCase().includes("pasif")) {
      return (
        <Badge
          variant="secondary"
          className="text-[11px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {label}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
      >
        {label}
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px] text-xs font-semibold uppercase text-zinc-500">
              ID Profil
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Nama Panggilan
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Nomor WhatsApp (Privasi)
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Segmen
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Stempel
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Label
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Persetujuan Promo
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase text-zinc-500">
              Kunjungan Terakhir
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-xs text-zinc-400">
                Memuat data pelanggan...
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <UserX className="size-8 stroke-1 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Tidak ada pelanggan yang cocok
                  </p>
                  <p className="text-xs text-zinc-400">
                    Coba ganti kata kunci pencarian atau daftarkan pelanggan baru.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((cust) => {
              const stempel = cust.stempel_loyalitas ?? 0;
              const isRewardReady = stempel >= 5;

              return (
                <TableRow
                  key={cust.id}
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {/* ID */}
                  <TableCell className="font-mono text-xs text-zinc-400">
                    #{cust.id.slice(0, 8)}
                  </TableCell>

                  {/* Nama */}
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {cust.nama_panggilan}
                  </TableCell>

                  {/* WA Masked */}
                  <TableCell>
                    <span className="font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {maskPhoneNumber(cust.nomor_wa)}
                    </span>
                  </TableCell>

                  {/* Segmen */}
                  <TableCell>{getSegmentBadge(cust.segmen)}</TableCell>

                  {/* Stempel Loyalitas */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          isRewardReady
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {stempel}/5
                      </span>
                      {isRewardReady ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1"
                        >
                          <Gift className="size-3" />
                          SIAP KLAIM
                        </Badge>
                      ) : (
                        stempel > 0 && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                            <Sparkles className="size-2.5 text-amber-500" />
                            Aktif
                          </span>
                        )
                      )}
                    </div>
                  </TableCell>

                  {/* Label */}
                  <TableCell>{getLabelBadge(cust.label)}</TableCell>

                  {/* Setuju Promo */}
                  <TableCell>
                    {cust.setuju_promo ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Setuju
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400">
                        <ShieldAlert className="size-3" />
                        Menolak
                      </span>
                    )}
                  </TableCell>

                  {/* Kunjungan Terakhir */}
                  <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {formatIndonesianDate(cust.terakhir_transaksi)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
