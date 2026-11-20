"use client";

import * as React from "react";
import {
  Coffee,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { recordCampaignLog } from "@/app/(admin)/promo/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatWaUrl, maskPhoneNumber } from "@/lib/formatters";
import type { PassiveCustomer } from "@/types/campaign.record";
import type { JenisKampanye } from "@/types/database.types";

interface PassiveCustomerTableProps {
  initialCustomers: PassiveCustomer[];
  onLogRecorded?: () => void;
}

type FilterMode = "14_days" | "30_days" | "member_malam" | "all";

const FILTER_OPTIONS = [
  { value: "14_days", label: "Tidak datang >14 hari" },
  { value: "30_days", label: "Tidak datang >30 hari" },
  { value: "member_malam", label: "Member Malam (>14 hari)" },
  { value: "all", label: "Semua kontak" },
];

export function PassiveCustomerTable({
  initialCustomers,
  onLogRecorded,
}: PassiveCustomerTableProps) {
  const customers = initialCustomers;
  const [filterMode, setFilterMode] = React.useState<FilterMode>("14_days");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [selectedCust, setSelectedCust] =
    React.useState<PassiveCustomer | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<JenisKampanye>("Kangen Nongkrong");
  const [isSending, setIsSending] = React.useState(false);

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((cust) => {
      if (filterMode === "14_days" && cust.hari_pasif < 14) return false;
      if (filterMode === "30_days" && cust.hari_pasif < 30) return false;
      if (
        filterMode === "member_malam" &&
        (cust.label !== "Member Malam" || cust.hari_pasif < 14)
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = cust.nama_panggilan.toLowerCase().includes(query);
        const matchWa =
          cust.nomor_wa.slice(-4).includes(query) ||
          cust.nomor_wa.includes(query);
        return matchName || matchWa;
      }

      return true;
    });
  }, [customers, filterMode, searchQuery]);

  const getTemplateText = (template: JenisKampanye, nama: string) => {
    if (template === "Insentif Es Teh") {
      return (
        `Halo Kak ${nama}.\n` +
        `Khusus pelanggan Warmindo Sumber Rizki 2, dapatkan gratis 1 Es Teh Manis Jumbo setiap pesan menu Indomie atau Nasi minggu ini.\n` +
        `Tunjukkan pesan ini ke kasir saat memesan. /insentif`
      );
    }
    return (
      `Halo Kak ${nama}.\n` +
      `Sudah lama tidak mampir ke Warmindo Sumber Rizki 2 Seturan. Yuk mampir minggu ini bareng teman.\n` +
      `Menu Indomie dan sambal spesial siap dipesan. /kangen`
    );
  };

  const handleOpenSendDialog = (
    cust: PassiveCustomer,
    defaultType: JenisKampanye = "Kangen Nongkrong"
  ) => {
    setSelectedCust(cust);
    setSelectedTemplate(defaultType);
  };

  const handleConfirmSend = async () => {
    if (!selectedCust) return;
    setIsSending(true);

    try {
      const message = getTemplateText(
        selectedTemplate,
        selectedCust.nama_panggilan
      );
      const waUrl = formatWaUrl(selectedCust.nomor_wa, message);

      await recordCampaignLog(
        selectedCust.id,
        selectedTemplate,
        selectedCust.nama_panggilan,
        selectedCust.nomor_wa
      );

      if (onLogRecorded) onLogRecorded();

      window.open(waUrl, "_blank");
      setSelectedCust(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau 4 digit WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filterMode}
          onValueChange={(v) => v && setFilterMode(v as FilterMode)}
          items={FILTER_OPTIONS}
        >
          <SelectTrigger
            aria-label="Filter durasi pasif"
            className="w-full sm:w-56"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="px-0">
          {filteredCustomers.length === 0 ? (
            <div className="py-8">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>Tidak ada pelanggan sesuai filter</EmptyTitle>
                  <EmptyDescription>
                    Ubah filter durasi pasif atau kata kunci pencarian kontak.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Pelanggan</TableHead>
                  <TableHead>Terakhir Berkunjung</TableHead>
                  <TableHead>Segmen</TableHead>
                  <TableHead>Izin Promo</TableHead>
                  <TableHead className="pr-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => {
                  const isCritical = cust.hari_pasif >= 30;
                  return (
                    <TableRow key={cust.id}>
                      <TableCell className="pl-4">
                        <div className="font-semibold text-foreground text-xs">
                          {cust.nama_panggilan}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {maskPhoneNumber(cust.nomor_wa)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={isCritical ? "destructive" : "warning"}
                          className="tabular-nums"
                        >
                          {cust.hari_pasif} hari lalu
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {cust.segmen || "Umum"}
                        {cust.label ? ` · ${cust.label}` : ""}
                      </TableCell>

                      <TableCell>
                        {cust.setuju_promo ? (
                          <Badge variant="success">
                            <ShieldCheck data-icon="inline-start" />
                            <span>Aktif</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <ShieldAlert data-icon="inline-start" className="text-[#dc2626]" />
                            <span>Menolak</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="pr-4 text-right">
                        {cust.setuju_promo ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              onClick={() =>
                                handleOpenSendDialog(cust, "Kangen Nongkrong")
                              }
                            >
                              <Send data-icon="inline-start" />
                              <span>/kangen</span>
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleOpenSendDialog(cust, "Insentif Es Teh")
                              }
                            >
                              <Coffee data-icon="inline-start" />
                              <span>/insentif</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Nonaktif
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedCust)}
        onOpenChange={(open) => !open && setSelectedCust(null)}
      >
        {selectedCust && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Kirim Pesan Reaktivasi</DialogTitle>
              <DialogDescription>
                Penerima: {selectedCust.nama_panggilan}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 text-xs">
              <Tabs
                value={selectedTemplate}
                onValueChange={(v) => setSelectedTemplate(v as JenisKampanye)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Kangen Nongkrong">
                    Template /kangen
                  </TabsTrigger>
                  <TabsTrigger value="Insentif Es Teh">
                    Template /insentif
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-foreground">
                  Pratinjau Pesan:
                </span>
                <div className="rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {getTemplateText(
                    selectedTemplate,
                    selectedCust.nama_panggilan
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
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
              >
                <Send data-icon="inline-start" />
                <span>{isSending ? "Mencatat..." : "Buka WhatsApp"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
