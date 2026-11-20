"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, MessageSquareText } from "lucide-react";
import { BroadcastModal } from "@/components/features/BroadcastModal";
import { CampaignHistoryTable } from "@/components/features/CampaignHistoryTable";
import { PassiveCustomerTable } from "@/components/features/PassiveCustomerTable";
import { Button } from "@/components/ui/button";
import type {
  CampaignLogRecord,
  PassiveCustomer,
} from "@/types/campaign.record";

interface PromoManagementViewProps {
  initialPassiveCustomers: PassiveCustomer[];
  initialCampaignLogs: CampaignLogRecord[];
}

export function PromoManagementView({
  initialPassiveCustomers,
  initialCampaignLogs,
}: PromoManagementViewProps) {
  const router = useRouter();
  const [broadcastModalOpen, setBroadcastModalOpen] = React.useState(false);

  const totalPassive = initialPassiveCustomers.filter(
    (c) => c.hari_pasif >= 14
  ).length;
  const totalOptIn = initialPassiveCustomers.filter(
    (c) => c.hari_pasif >= 14 && c.setuju_promo
  ).length;
  const totalReactivated = initialCampaignLogs.filter(
    (log) => log.berhasil_reaktivasi
  ).length;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium tracking-tight text-foreground">
            Promo &amp; Reaktivasi
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
            Pasif &gt;14 hari: {totalPassive} · Opt-in WA: {totalOptIn} ·
            Win-Back berhasil: {totalReactivated}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            render={<Link href="/quick-replies" />}
            nativeButton={false}
          >
            <MessageSquareText data-icon="inline-start" />
            <span>Template Quick Replies</span>
          </Button>
          <Button onClick={() => setBroadcastModalOpen(true)}>
            <Megaphone data-icon="inline-start" />
            <span>Broadcast Begadang Nugas</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">
          Daftar Pelanggan Pasif
        </h2>
        <PassiveCustomerTable
          initialCustomers={initialPassiveCustomers}
          onLogRecorded={() => router.refresh()}
        />
      </div>

      <CampaignHistoryTable logs={initialCampaignLogs} />

      <BroadcastModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        onBroadcastSuccess={() => router.refresh()}
      />
    </div>
  );
}
