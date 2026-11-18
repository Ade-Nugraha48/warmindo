"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Send,
  ShieldAlert,
  ShieldCheck,
  Coffee,
  Sparkles,
  Calendar,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { maskPhoneNumber, formatWaUrl } from "@/lib/formatters";
import { recordCampaignLog } from "@/app/(admin)/promo/actions";
import type { PassiveCustomer } from "@/types/campaign.record";
import type { JenisKampanye } from "@/types/database.types";

interface PassiveCustomerTableProps {
  initialCustomers: PassiveCustomer[];
  onLogRecorded?: () => void;
}

type FilterMode = "14_days" | "30_days" | "member_malam" | "all";

export function PassiveCustomerTable({
  initialCustomers,
  onLogRecorded,
}: PassiveCustomerTableProps) {
  const [customers] = React.useState<PassiveCustomer[]>(initialCustomers);
  const [filterMode, setFilterMode] = React.useState<FilterMode>("14_days");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Dialog for template selection
  const [selectedCust, setSelectedCust] = React.useState<PassiveCustomer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<JenisKampanye>("Kangen Nongkrong");
  const [isSending, setIsSending] = React.useState(false);

  // Filter customers
  const filteredCustomers = React.useMemo(() => {
    return customers.filter((cust) => {
      // 1. Dropdown filter mode
      if (filterMode === "14_days" && cust.hari_pasif < 14) {
        return false;
      }
      if (filterMode === "30_days" && cust.hari_pasif < 30) {
        return false;
      }
      if (filterMode === "member_malam" && (cust.label !== "Member Malam" || cust.hari_pasif < 14)) {
        return false;
      }

      // 2. Search query filter (Name or last 4 digits of phone)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = cust.nama_panggilan.toLowerCase().includes(query);
        const matchWa = cust.nomor_wa.slice(-4).includes(query) || cust.nomor_wa.includes(query);
        return matchName || matchWa;
      }

      return true;
    });
  }, [customers, filterMode, searchQuery]);

  const getTemplateText = (template: JenisKampanye, nama: string) => {
    if (template === "Insentif Es Teh") {
      return (
        `Halo Kak ${nama}! 👋\n` +
        `Khusus buat kamu pelanggan setia Warmindo Sumber Rizki 2, dapatkan GRATIS 1 Es Teh Manis Jumbo setiap pesan menu Indomie atau Nasi favoritmu minggu ini!\n\n` +
        `Tunjukkan chat ini ke kasir saat memesan ya. Ditunggu kedatangannya! /insentif`
      );
    }
    // Default: Kangen Nongkrong
    return (
      `Halo Kak ${nama}! 👋\n` +
      `Kangen nih nongkrong santai di Warmindo Sumber Rizki 2. Sudah lama nggak mampir, yuk hang out bareng teman-teman minggu ini!\n\n` +
      `Ada berbagai menu Indomie hangat dan sambal spesial siap menemani. Sampai ketemu di warung! /kangen`
    );
  };

  const handleOpenSendDialog = (cust: PassiveCustomer, defaultType: JenisKampanye = "Kangen Nongkrong") => {
    setSelectedCust(cust);
    setSelectedTemplate(defaultType);
  };

  const handleConfirmSend = async () => {
    if (!selectedCust) return;
    setIsSending(true);

    try {
      const message = getTemplateText(selectedTemplate, selectedCust.nama_panggilan);
      const waUrl = formatWaUrl(selectedCust.nomor_wa, message);

      // Record to campaign logs
      await recordCampaignLog(
        selectedCust.id,
        selectedTemplate,
        selectedCust.nama_panggilan,
        selectedCust.nomor_wa
      );

      if (onLogRecorded) {
        onLogRecorded();
      }

      // Open WhatsApp web / mobile
      window.open(waUrl, "_blank");
      setSelectedCust(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              placeholder="Cari nama atau 4 digit terakhir nomor WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Smart Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Filter className="size-3.5" />
            <span>Filter Cerdas:</span>
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 cursor-pointer"
          >
            <option value="14_days">Tidak datang &gt;14 hari (Standar)</option>
            <option value="30_days">Tidak datang &gt;30 hari (Kritis)</option>
            <option value="member_malam">Member Malam Pasif (&gt;14 hari)</option>
            <option value="all">Semua Pelanggan Pasif</option>
          </select>
        </div>
      </div>

      {/* Target Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 dark:bg-zinc-900/40">
              <TableHead className="w-[200px] text-xs font-semibold">Nama &amp; Kontak</TableHead>
              <TableHead className="text-xs font-semibold">Lama Tidak Datang</TableHead>
              <TableHead className="text-xs font-semibold">Segmen &amp; Label</TableHead>
              <TableHead className="text-xs font-semibold">Persetujuan Promo</TableHead>
              <TableHead className="text-right text-xs font-semibold">Aksi Reaktivasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="size-8 text-zinc-300" />
                    <span>Tidak ada data pelanggan yang cocok dengan kriteria filter.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((cust) => {
                const isCritical = cust.hari_pasif >= 30;

                return (
                  <TableRow
                    key={cust.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Nama & Kontak */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                        {cust.nama_panggilan}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-400">
                        {maskPhoneNumber(cust.nomor_wa)}
                      </div>
                    </TableCell>

                    {/* Lama Tidak Datang */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold gap-1 ${
                            isCritical
                              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {isCritical ? (
                            <AlertTriangle className="size-3 text-red-600" />
                          ) : (
                            <Calendar className="size-3 text-amber-600" />
                          )}
                          {cust.hari_pasif} Hari Lalu
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Segmen & Label */}
                    <TableCell className="py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {cust.segmen || "Umum"}
                        </Badge>
                        {cust.label && (
                          <Badge
                            className={`text-[11px] font-medium ${
                              cust.label === "Member Malam"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            }`}
                          >
                            {cust.label}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Persetujuan Promo */}
                    <TableCell className="py-3">
                      {cust.setuju_promo ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span>✓ Setuju Promo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400">
                          <ShieldAlert className="size-4 text-rose-500" />
                          <span>✗ Menolak (Privasi)</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Aksi Reaktivasi (Kirim WA) */}
                    <TableCell className="py-3 text-right">
                      {cust.setuju_promo ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs h-8"
                            onClick={() => handleOpenSendDialog(cust, "Kangen Nongkrong")}
                          >
                            <Send className="size-3" />
                            Kirim WA (/kangen)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200 gap-1 text-xs h-8"
                            onClick={() => handleOpenSendDialog(cust, "Insentif Es Teh")}
                          >
                            <Coffee className="size-3 text-amber-700" />
                            /insentif
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="text-xs text-zinc-400 border-zinc-200 bg-zinc-50 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 h-8"
                          title="Pelanggan memilih untuk tidak menerima materi promosi"
                        >
                          <ShieldAlert className="size-3.5 mr-1 text-zinc-400" />
                          WA Dinonaktifkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation & Preview Dialog */}
      <Dialog open={Boolean(selectedCust)} onOpenChange={(open) => !open && setSelectedCust(null)}>
        {selectedCust && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Send className="size-4 text-emerald-600" />
                Kirim Penawaran Reaktivasi via WhatsApp
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Pilih template pesan ramah yang ingin dikirimkan ke {selectedCust.nama_panggilan}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {/* Template selector pills */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Pilih Template Pesan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("Kangen Nongkrong")}
                    className={`rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                      selectedTemplate === "Kangen Nongkrong"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      <span>Template /kangen</span>
                    </div>
                    <p className="mt-1 text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                      Sapaan hangat &amp; ajakan kembali berkunjung
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate("Insentif Es Teh")}
                    className={`rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                      selectedTemplate === "Insentif Es Teh"
                        ? "border-amber-500 bg-amber-50 text-amber-950 font-semibold dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Coffee className="size-3.5 text-amber-600" />
                      <span>Template /insentif</span>
                    </div>
                    <p className="mt-1 text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                      Gratis 1 Es Teh Manis setiap pesan mie
                    </p>
                  </button>
                </div>
              </div>

              {/* Message preview box */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Pratinjau Teks WhatsApp:
                </label>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 whitespace-pre-wrap">
                  {getTemplateText(selectedTemplate, selectedCust.nama_panggilan)}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCust(null)}
                disabled={isSending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Send className="size-3.5" />
                {isSending ? "Merekam..." : "Buka WhatsApp & Kirim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
