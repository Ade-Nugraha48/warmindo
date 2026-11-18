import type { JenisKampanye } from "@/types/database.types";

export interface PassiveCustomer {
  id: string;
  nama_panggilan: string;
  nomor_wa: string;
  segmen: string | null;
  label: string | null;
  setuju_promo: boolean;
  stempel_loyalitas: number;
  terakhir_transaksi: string | null;
  hari_pasif: number;
}

export interface CampaignLogRecord {
  id: string;
  customer_id: string | null;
  customer_nama: string;
  customer_wa: string;
  jenis_kampanye: JenisKampanye;
  waktu_kirim: string;
  berhasil_reaktivasi: boolean;
}
