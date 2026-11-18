export interface KpiMetricItem {
  rataRata: number;
  target: number;
  statusSla: boolean;
  totalSampel: number;
  satuan: string;
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
  kategori: "Makanan" | "Minuman" | "Spesial";
  porsi: number;
  hargaSatuan: number;
  totalOmset: number;
  kontribusiPersen: number;
}

export interface ReactivationMetricItem {
  namaKampanye: string;
  jenis: string;
  totalSent: number;
  totalWinBack: number;
  konversiRate: number;
  estimasiOmset: number;
}

export interface DashboardAnalyticsData {
  kpi: DashboardKpiSummary;
  weeklyTrends: WeeklyTrendData[];
  topMenus: TopMenuItem[];
  reactivationStats: {
    totalTerkirim: number;
    totalReaktivasi: number;
    konversiKeseluruhan: number;
    totalOmsetReaktivasi: number;
    items: ReactivationMetricItem[];
  };
}
