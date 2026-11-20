"use client";

import * as React from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Flame,
  MessageSquare,
  MoreHorizontal,
  PlusCircle,
  Search,
  Users,
} from "lucide-react";
import { AddCustomerDialog } from "@/components/features/AddCustomerDialog";
import { toggleCustomerPromoConsent } from "@/app/(admin)/pelanggan/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_LOYALTY_STAMPS } from "@/lib/constants";
import {
  formatIndonesianDate,
  formatWaUrl,
  maskPhoneNumber,
} from "@/lib/formatters";
import type { Customer } from "@/types/database.types";

interface CustomerManagementViewProps {
  initialCustomers: Customer[];
  initialSearchQuery?: string;
}

type SegmentTabKey =
  | "all"
  | "Mahasiswa UPN"
  | "Mahasiswa YKPN"
  | "Mahasiswa Atma Jaya"
  | "begadang"
  | "ready_claim";

const SORT_OPTIONS = [
  { label: "Kunjungan Terbanyak", value: "visits_desc" },
  { label: "Terakhir Datang", value: "recent" },
  { label: "Stempel Terbanyak", value: "stamps_desc" },
  { label: "Nama (A-Z)", value: "name_asc" },
];

export function CustomerManagementView({
  initialCustomers,
  initialSearchQuery = "",
}: CustomerManagementViewProps) {
  const [customers, setCustomers] = React.useState<Customer[]>(initialCustomers);
  const [drawerCustomer, setDrawerCustomer] = React.useState<Customer | null>(
    null
  );
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);
  const [activeTab, setActiveTab] = React.useState<SegmentTabKey>("all");
  const [sortBy, setSortBy] = React.useState<string>("visits_desc");
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const filteredCustomers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = customers.filter((c) => {
      if (activeTab === "Mahasiswa UPN" && c.segmen !== "Mahasiswa UPN")
        return false;
      if (activeTab === "Mahasiswa YKPN" && c.segmen !== "Mahasiswa YKPN")
        return false;
      if (
        activeTab === "Mahasiswa Atma Jaya" &&
        c.segmen !== "Mahasiswa Atma Jaya"
      )
        return false;
      if (
        activeTab === "begadang" &&
        !(c.label || "").toLowerCase().includes("malam") &&
        !(c.label || "").toLowerCase().includes("begadang")
      ) {
        return false;
      }
      if (
        activeTab === "ready_claim" &&
        (c.stempel_loyalitas ?? 0) < MAX_LOYALTY_STAMPS
      ) {
        return false;
      }

      if (!q) return true;
      return (
        c.nama_panggilan.toLowerCase().includes(q) ||
        c.nomor_wa.toLowerCase().includes(q) ||
        c.nomor_wa.slice(-4).includes(q) ||
        (c.segmen || "").toLowerCase().includes(q) ||
        (c.preferensi_racikan || "").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "stamps_desc") {
        return (b.stempel_loyalitas ?? 0) - (a.stempel_loyalitas ?? 0);
      }
      if (sortBy === "name_asc") {
        return a.nama_panggilan.localeCompare(b.nama_panggilan);
      }
      if (sortBy === "recent") {
        return (
          new Date(b.terakhir_transaksi || 0).getTime() -
          new Date(a.terakhir_transaksi || 0).getTime()
        );
      }
      return (b.total_kunjungan ?? 0) - (a.total_kunjungan ?? 0);
    });
  }, [customers, searchQuery, activeTab, sortBy]);

  const handleExportCsv = () => {
    const rows = [
      ["Nama", "No WA", "Segmen", "Stempel", "Setuju Promo", "Label", "Preferensi"],
      ...filteredCustomers.map((c) => [
        c.nama_panggilan,
        maskPhoneNumber(c.nomor_wa),
        c.segmen || "Umum",
        `${c.stempel_loyalitas ?? 0}/${MAX_LOYALTY_STAMPS}`,
        c.setuju_promo ? "Ya" : "Tidak",
        c.label || "-",
        `"${(c.preferensi_racikan || "").replace(/"/g, '""')}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sumber-rizki-pelanggan-crm.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data pelanggan diekspor ke CSV.");
  };

  const handleToggleConsent = async () => {
    if (!drawerCustomer) return;
    const nextVal = !drawerCustomer.setuju_promo;
    await toggleCustomerPromoConsent(drawerCustomer.id, nextVal);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === drawerCustomer.id ? { ...c, setuju_promo: nextVal } : c
      )
    );
    setDrawerCustomer((prev) =>
      prev ? { ...prev, setuju_promo: nextVal } : prev
    );
    showToast(
      `Izin promo ${drawerCustomer.nama_panggilan}: ${
        nextVal ? "Aktif" : "Nonaktif"
      }.`
    );
  };

  const currentStamps = drawerCustomer?.stempel_loyalitas ?? 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium tracking-tight text-foreground">
            Pelanggan CRM
          </h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {customers.length} kontak terdaftar · klik baris untuk membuka detail profil dan stempel.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
          <AddCustomerDialog
            onCustomerAdded={(newCust) => {
              setCustomers((prev) => [newCust, ...prev]);
              setDrawerCustomer(newCust);
              showToast(`Pelanggan ${newCust.nama_panggilan} ditambahkan.`);
            }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, WA, racikan..."
              className="pl-8"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as SegmentTabKey)}
          >
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">Semua ({customers.length})</TabsTrigger>
              <TabsTrigger value="Mahasiswa UPN">UPN</TabsTrigger>
              <TabsTrigger value="Mahasiswa YKPN">YKPN</TabsTrigger>
              <TabsTrigger value="Mahasiswa Atma Jaya">Atma Jaya</TabsTrigger>
              <TabsTrigger value="begadang">Member Malam</TabsTrigger>
              <TabsTrigger value="ready_claim">Siap Klaim</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Select
          value={sortBy}
          onValueChange={(v) => {
            if (v) setSortBy(v);
          }}
          items={SORT_OPTIONS}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Full-Width CRM Data Table */}
      <Card>
        <CardContent className="p-4">
          {filteredCustomers.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Pelanggan tidak ditemukan</EmptyTitle>
                <EmptyDescription>
                  Ubah kata kunci pencarian atau pilih segmen kampus lain.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                >
                  Tampilkan Semua
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="rounded-lg overflow-hidden border border-border/60">
              <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Pelanggan</TableHead>
                  <TableHead>Segmen</TableHead>
                  <TableHead>Kupon Stempel</TableHead>
                  <TableHead className="text-right">Kunjungan</TableHead>
                  <TableHead>Terakhir Datang</TableHead>
                  <TableHead>Izin Promo WA</TableHead>
                  <TableHead className="pr-4 text-right w-12">
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => {
                  const stamps = cust.stempel_loyalitas ?? 0;
                  const initials = cust.nama_panggilan
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <TableRow
                      key={cust.id}
                      onClick={() => setDrawerCustomer(cust)}
                      className="cursor-pointer"
                    >
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="default">
                            <AvatarFallback className="text-xs font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">
                              {cust.nama_panggilan}
                            </div>
                            <div className="text-xs text-muted-foreground tabular-nums">
                              {maskPhoneNumber(cust.nomor_wa)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cust.segmen || "Umum"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-[132px]">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="grid grid-cols-10 gap-0.5 flex-1">
                              {Array.from({ length: MAX_LOYALTY_STAMPS }).map(
                                (_, idx) => (
                                  <span
                                    key={idx}
                                    className={`h-1.5 rounded-full ${
                                      idx < stamps
                                        ? stamps >= MAX_LOYALTY_STAMPS
                                          ? "bg-[#16a34a]"
                                          : "bg-primary"
                                        : "bg-border"
                                    }`}
                                  />
                                )
                              )}
                            </div>
                            <Badge
                              variant={
                                stamps >= MAX_LOYALTY_STAMPS
                                  ? "success"
                                  : "secondary"
                              }
                              className="tabular-nums shrink-0"
                            >
                              {stamps}/{MAX_LOYALTY_STAMPS}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {cust.total_kunjungan ?? Math.max(1, stamps)}x
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatIndonesianDate(cust.terakhir_transaksi)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cust.setuju_promo ? "success" : "secondary"}
                        >
                          {cust.setuju_promo ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="pr-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Menu baris</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => setDrawerCustomer(cust)}
                              >
                                Lihat Profil CRM
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.open(
                                    formatWaUrl(
                                      cust.nomor_wa,
                                      `Halo Kak ${cust.nama_panggilan}, ada promo Jumat Malam 10% di Warmindo Sumber Rizki 2 Seturan.`
                                    ),
                                    "_blank"
                                  );
                                }}
                              >
                                Chat WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={`/transaksi?q=${encodeURIComponent(cust.nama_panggilan)}`}
                                  />
                                }
                              >
                                Input Order POS
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-Over Customer Profile Sheet */}
      <Sheet
        open={Boolean(drawerCustomer)}
        onOpenChange={(open) => !open && setDrawerCustomer(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {drawerCustomer && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-2 pr-6">
                  <div>
                    <SheetTitle>{drawerCustomer.nama_panggilan}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono">
                        {maskPhoneNumber(drawerCustomer.nomor_wa)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            drawerCustomer.nomor_wa
                          );
                          showToast("Nomor WA disalin.");
                        }}
                        aria-label="Salin nomor WhatsApp"
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </SheetDescription>
                  </div>
                  <Badge variant="outline">
                    {drawerCustomer.segmen || "Umum"}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-5 p-4">
                {/* 10-Stamp Loyalty Card */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Kupon Stempel Loyalitas
                    </span>
                    <span className="font-semibold text-primary tabular-nums">
                      {currentStamps}/{MAX_LOYALTY_STAMPS}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: MAX_LOYALTY_STAMPS }).map(
                      (_, idx) => {
                        const filled = idx < currentStamps;
                        return (
                          <div
                            key={idx}
                            className={`h-9 rounded-md flex items-center justify-center text-xs font-medium tabular-nums ${
                              filled
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground border"
                            }`}
                          >
                            {filled ? <Flame className="size-3.5" /> : idx + 1}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {currentStamps >= MAX_LOYALTY_STAMPS
                      ? "Kupon penuh. Pelanggan siap menukar 1 porsi gratis."
                      : `Kurang ${
                          MAX_LOYALTY_STAMPS - currentStamps
                        } stempel lagi untuk gratis 1 porsi.`}
                  </p>
                </div>

                <Separator />

                {/* Attributes */}
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      Racikan favorit
                    </span>
                    <span className="text-right font-medium text-foreground">
                      {drawerCustomer.preferensi_racikan ||
                        "Indomie Dok-Dok, Pedas Sedang"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Meja favorit</span>
                    <span className="font-medium text-foreground">
                      {drawerCustomer.meja_favorit || "Meja 05"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Total kunjungan</span>
                    <span className="font-medium tabular-nums">
                      {drawerCustomer.total_kunjungan ??
                        Math.max(1, currentStamps)}{" "}
                      kali
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Izin Promo WA</span>
                    <Button
                      variant={
                        drawerCustomer.setuju_promo ? "secondary" : "outline"
                      }
                      size="xs"
                      onClick={handleToggleConsent}
                    >
                      {drawerCustomer.setuju_promo
                        ? "Aktif (klik ubah)"
                        : "Nonaktif"}
                    </Button>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t pt-4">
                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(
                      formatWaUrl(
                        drawerCustomer.nomor_wa,
                        `Halo Kak ${drawerCustomer.nama_panggilan}, ada yang bisa kami bantu dari Warmindo Sumber Rizki 2 Seturan?`
                      ),
                      "_blank"
                    )
                  }
                >
                  <MessageSquare data-icon="inline-start" />
                  Chat WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  render={
                    <Link
                      href={`/transaksi?q=${encodeURIComponent(drawerCustomer.nama_panggilan)}`}
                    />
                  }
                  nativeButton={false}
                >
                  <PlusCircle data-icon="inline-start" />
                  Input Transaksi POS
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-md">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
