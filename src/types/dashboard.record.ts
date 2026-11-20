export interface KpiMetricItem {
  rataRata: number;
  target: number;
  statusSla: boolean;
  totalSampel: number;
  satuan: string;
}

export interface HourlyRushPoint {
  jam: string;
  normalCount: number;
  rushCount: number;
  promoLabel?: string;
  isPeak?: boolean;
}

export interface DashboardKpiSummary {
  waktuSajiNormal: KpiMetricItem;
  waktuSajiSibuk: KpiMetricItem;
  responseTimeWa: KpiMetricItem;
  fcr: {
    persentase: number;
    target: number;
    statusSla: boolean;
    totalSelesaiDiTempat: number;
    totalKeluhan: number;
  };
  totalOmzet?: number;
  totalTransaksi?: number;
  avgOrderValue?: number;
  breachCount?: number;
  breachRate?: number;
  kompensasiBiaya?: number;
  kompensasiQty?: number;
}

export interface WeeklyTrendData {
  minggu: string;
  label: string;
  transaksiMember: number;
  transaksiNonMember: number;
  totalTransaksi: number;
  omsetMember: number;
  totalOmset: number;
}

export interface TopMenuItem {
  rank: number;
  nama: string;
  deskripsi?: string;
  kategori: "Makanan" | "Minuman" | "Spesial";
  porsi: number;
  hargaSatuan: number;
  totalOmset: number;
  kontribusiPersen: number;
  marginPersen?: number;
}

export interface ReactivationMetricItem {
  namaKampanye: string;
  pemicu?: string;
  jenis: string;
  totalSent: number;
  openRate?: number;
  totalWinBack: number;
  konversiRate: number;
  estimasiOmset: number;
}

export interface SegmentShareItem {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface RecentActivityItem {
  id: string;
  kind: "order" | "ticket" | "sla";
  actor: string;
  action: string;
  target: string;
  timeLabel: string;
  quote?: string;
}

export interface DashboardAnalyticsData {
  kpi: DashboardKpiSummary;
  weeklyTrends: WeeklyTrendData[];
  hourlyRush: HourlyRushPoint[];
  topMenus: TopMenuItem[];
  segmentBreakdown: SegmentShareItem[];
  recentActivities: RecentActivityItem[];
  reactivationStats: {
    totalTerkirim: number;
    totalReaktivasi: number;
    konversiKeseluruhan: number;
    totalOmsetReaktivasi: number;
    items: ReactivationMetricItem[];
  };
}
