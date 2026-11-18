"use client";

import * as React from "react";
import {
  Megaphone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radio,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { broadcastBegadangNugas } from "@/app/(admin)/promo/actions";
import { maskPhoneNumber, formatWaUrl } from "@/lib/formatters";

interface BroadcastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBroadcastSuccess?: () => void;
}

export function BroadcastModal({
  open,
  onOpenChange,
  onBroadcastSuccess,
}: BroadcastModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    count: number;
    recipients: { id: string; nama: string; wa: string }[];
  } | null>(null);

  const handleBroadcast = async () => {
    setIsSubmitting(true);
    try {
      const res = await broadcastBegadangNugas();
      if (res.success) {
        setResult({
          count: res.count,
          recipients: res.recipients,
        });
        if (onBroadcastSuccess) {
          onBroadcastSuccess();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  const getBegadangMessage = (nama: string) => {
    return (
      `Halo Kak ${nama}! 🍜\n` +
      `Spesial malam ini jam 22.00 WIB: promo "Begadang Nugas" di Warmindo Sumber Rizki 2!\n` +
      `Nikmati Diskon 10% untuk semua menu Indomie & minuman pendamping nugas. Tunjukkan pesan ini ke kasir saat bayar ya! /begadangnugas`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Megaphone className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Broadcast &quot;Begadang Nugas&quot;
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Pemberitahuan massal diskon 10% untuk komunitas Member Malam
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Broadcast Berhasil Dieksekusi!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Log kampanye telah disimpan untuk {result.count} pelanggan terverifikasi. Anda dapat meninjau atau membuka tautan WhatsApp berikut untuk mengirimkan ke tiap penerima.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {result.recipients.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {rec.nama}
                    </div>
                    <div className="font-mono text-zinc-400">
                      {maskPhoneNumber(rec.wa)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-7"
                    onClick={() => {
                      const url = formatWaUrl(rec.wa, getBegadangMessage(rec.nama));
                      window.open(url, "_blank");
                    }}
                  >
                    <ExternalLink className="size-3" />
                    Buka Chat WA
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 gap-1 font-semibold">
                <Clock className="size-3" />
                Jadwal: Jumat Pukul 22.00 WIB
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-semibold">
                <ShieldCheck className="size-3" />
                Opt-in Filter: Setuju Promo
              </Badge>
            </div>

            {/* Target Criteria */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3.5 space-y-2 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Radio className="size-3.5 text-purple-600" />
                Kriteria Sasaran Otomatis (FR 5.d):
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>
                  Pelanggan dengan label{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    &quot;Member Malam&quot;
                  </span>
                </li>
                <li>
                  Status persetujuan promosi{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Aktif (Setuju Promo = True)
                  </span>
                </li>
                <li>
                  Pemberian diskon 10% untuk transaksi larut malam di atas jam 22.00 WIB
                </li>
              </ul>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Pratinjau Pesan yang Dikirimkan:
              </label>
              <div className="rounded-lg border border-zinc-300 bg-zinc-100 p-3 font-mono text-[11px] leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 whitespace-pre-wrap">
                {getBegadangMessage("[Nama Pelanggan]")}
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              *Catatan: Sistem secara otomatis mematuhi privasi pelanggan. Kontak yang tidak menyetujui promosi tidak akan menerima notifikasi ini.
            </p>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleBroadcast}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memproses Broadcast...
                  </>
                ) : (
                  <>
                    <Megaphone className="size-4" />
                    Kirim Broadcast Massal Sekarang
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
