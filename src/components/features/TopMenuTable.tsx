"use client";

import * as React from "react";
import { Award, Utensils, Coffee, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/formatters";
import type { TopMenuItem } from "@/types/dashboard.record";

interface TopMenuTableProps {
  menus: TopMenuItem[];
}

export function TopMenuTable({ menus }: TopMenuTableProps) {
  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case "Makanan":
        return (
          <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
            <Utensils className="size-3 text-amber-600" />
            Makanan
          </Badge>
        );
      case "Minuman":
        return (
          <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
            <Coffee className="size-3 text-blue-600" />
            Minuman
          </Badge>
        );
      case "Spesial":
      default:
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 gap-1 text-[11px] font-normal">
            <Sparkles className="size-3 text-purple-600" />
            Spesial
          </Badge>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 font-bold text-xs text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 shadow-2xs">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-200 font-bold text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shadow-2xs">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 font-bold text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200">
          🥉 3
        </span>
      );
    }
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-zinc-100 font-medium text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        #{rank}
      </span>
    );
  };

  return (
    <Card className="border-zinc-200/80 shadow-2xs dark:border-zinc-800 font-sans">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Award className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              5 Menu Terlaris (Top Seller)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Menu paling banyak dipesan dan penyumbang omset terbesar warung
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-zinc-200 overflow-hidden dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 dark:bg-zinc-900/40">
                <TableHead className="w-[60px] text-xs font-semibold">Rank</TableHead>
                <TableHead className="text-xs font-semibold">Nama Menu</TableHead>
                <TableHead className="text-xs font-semibold">Porsi Terjual</TableHead>
                <TableHead className="text-xs font-semibold">Total Omset</TableHead>
                <TableHead className="text-right text-xs font-semibold">Kontribusi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((item) => (
                <TableRow
                  key={item.nama}
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <TableCell className="py-3">{getRankBadge(item.rank)}</TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                      {item.nama}
                    </div>
                    <div className="mt-0.5">{getKategoriBadge(item.kategori)}</div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {item.porsi}
                    </span>
                    <span className="text-[11px] text-zinc-400 ml-1">porsi</span>
                  </TableCell>
                  <TableCell className="py-3 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(item.totalOmset)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.kontribusiPersen}%
                      </span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${item.kontribusiPersen}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
