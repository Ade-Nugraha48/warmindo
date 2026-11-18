import type { KategoriTiket, PicTiket, StatusTiket } from "@/types/database.types";

export interface TicketRecord {
  id: string;
  customer_id: string | null;
  customer_nama: string;
  customer_wa: string;
  kategori: KategoriTiket;
  deskripsi_keluhan: string;
  pic: PicTiket;
  status: StatusTiket;
  waktu_masuk: string;
  waktu_selesai: string | null;
  diselesaikan_di_tempat: boolean;
  pesan_konfirmasi_terkirim: boolean;
}
