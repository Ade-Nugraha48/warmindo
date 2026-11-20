"use client";

import * as React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Megaphone,
} from "lucide-react";
import { broadcastBegadangNugas } from "@/app/(admin)/promo/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatWaUrl, maskPhoneNumber } from "@/lib/formatters";

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

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setResult(null);
    }
    onOpenChange(nextOpen);
  };

  const handleClose = () => {
    handleDialogOpenChange(false);
  };

  const getBegadangMessage = (nama: string) => {
    return (
      `Halo Kak ${nama}.\n` +
      `Malam ini mulai pukul 22.00 WIB ada promo Begadang Nugas di Warmindo Sumber Rizki 2 Seturan.\n` +
      `Nikmati diskon 10% untuk semua menu Indomie dan minuman dengan menunjukkan pesan ini ke kasir. /begadang`
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg font-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="size-4 text-primary" />
            <span>Broadcast Begadang Nugas</span>
          </DialogTitle>
          <DialogDescription>
            Kirim diskon 10% Jumat malam kepada Member Malam yang menyetujui
            promo.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-emerald-600/25 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold block">
                  Log kampanye tersimpan untuk {result.count} pelanggan.
                </span>
                Klik Buka WA untuk mengirim pesan satu per satu.
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-border rounded-lg border">
              {result.recipients.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 text-xs hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-foreground">{rec.nama}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {maskPhoneNumber(rec.wa)}
                    </div>
                  </div>
                  <Button
                    size="xs"
                    onClick={() => {
                      window.open(
                        formatWaUrl(rec.wa, getBegadangMessage(rec.nama)),
                        "_blank"
                      );
                    }}
                  >
                    <ExternalLink data-icon="inline-start" />
                    <span>Buka WA</span>
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
          <div className="flex flex-col gap-4 text-xs">
            <div className="rounded-lg border bg-muted/50 p-3 flex flex-col gap-1 text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Target Penerima
                </span>
                <Badge variant="secondary">Opt-in Aktif</Badge>
              </div>
              <p>
                Label Member Malam / Begadang Nugas dengan persetujuan promo WA
                aktif.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-foreground">
                Pratinjau Pesan:
              </span>
              <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {getBegadangMessage("[Nama Pelanggan]")}
              </div>
            </div>

            <DialogFooter>
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
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Megaphone data-icon="inline-start" />
                    <span>Siapkan Broadcast</span>
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
