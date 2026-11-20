import type { KategoriTiket, PicTiket, StatusTiket } from "@/types/database.types";

export interface TicketAuditStep {
  waktu: string;
  deskripsi: string;
  severity?: "normal" | "warning" | "critical";
}

export interface TicketRecord {
  id: string;
  kode_tiket?: string;
  customer_id: string | null;
  customer_nama: string;
  customer_wa: string;
  customer_segmen?: string | null;
  customer_stempel?: number;
  nomor_meja?: string;
  kategori: KategoriTiket;
  deskripsi_keluhan: string;
  pic: PicTiket;
  status: StatusTiket;
  waktu_masuk: string;
  waktu_selesai: string | null;
  diselesaikan_di_tempat: boolean;
  pesan_konfirmasi_terkirim: boolean;
  kompensasi_item?: string;
  kronologi_audit?: TicketAuditStep[];
}
