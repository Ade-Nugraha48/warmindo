"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Users,
  ShieldCheck,
  Moon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PassiveCustomerTable } from "@/components/features/PassiveCustomerTable";
import { CampaignHistoryTable } from "@/components/features/CampaignHistoryTable";
import { BroadcastModal } from "@/components/features/BroadcastModal";
import type { PassiveCustomer, CampaignLogRecord } from "@/types/campaign.record";

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

  // Derive metrics
  const totalPassive = initialPassiveCustomers.filter((c) => c.hari_pasif >= 14).length;
  const totalOptIn = initialPassiveCustomers.filter(
    (c) => c.hari_pasif >= 14 && c.setuju_promo
  ).length;
  const totalMemberMalam = initialPassiveCustomers.filter(
    (c) => c.label === "Member Malam" && c.setuju_promo
  ).length;
  const totalReactivated = initialCampaignLogs.filter(
    (log) => log.berhasil_reaktivasi
  ).length;

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-2xs dark:bg-purple-950 dark:text-purple-300">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Promo Pasif &amp; Reaktivasi
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Alur Marketing Automation &amp; Reaktivasi Pelanggan Pasif (&gt;14 hari) Warmindo Sumber Rizki 2
              </p>
            </div>
          </div>
        </div>

        {/* Large Prominent Broadcast Button */}
        <div>
          <Button
            size="lg"
            onClick={() => setBroadcastModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md gap-2 px-5 py-6 text-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="size-5 animate-pulse text-amber-300" />
            <span>Broadcast &quot;Begadang Nugas&quot;</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Pelanggan Pasif (&gt;14 Hari)
            </CardTitle>
            <Users className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalPassive}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Target potensial untuk reaktivasi
            </p>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Siap Dihubungi (Opt-in)
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalOptIn}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Setuju menerima pesan promosi WA
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Target Member Malam
            </CardTitle>
            <Moon className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalMemberMalam}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Penerima diskon 10% Begadang Nugas
            </p>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Reaktivasi Sukses (Win-Back)
            </CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalReactivated}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Pelanggan aktif bertransaksi kembali
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Reaktivasi Table Section */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Daftar Pelanggan Pasif &amp; Target Reaktivasi
              </CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tombol WhatsApp aktif hanya jika pelanggan menyetujui promosi (GDPR/Privasi). Klik tombol untuk mengirim template /kangen atau /insentif.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PassiveCustomerTable
            initialCustomers={initialPassiveCustomers}
            onLogRecorded={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Campaign Activity History Table */}
      <Card className="shadow-2xs">
        <CardContent className="pt-6">
          <CampaignHistoryTable logs={initialCampaignLogs} />
        </CardContent>
      </Card>

      {/* Broadcast Modal */}
      <BroadcastModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        onBroadcastSuccess={handleRefresh}
      />
    </div>
  );
}
