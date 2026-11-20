export interface OrderItemLine {
  id: string;
  nama: string;
  qty: number;
  harga: number;
  catatan?: string;
  stasiun: string;
  selesai?: boolean;
}

export interface TransactionRecord {
  id: string;
  kode_order?: string;
  customer_id: string | null;
  customer_nama: string;
  customer_wa: string;
  customer_segmen?: string | null;
  menu_pesanan: string;
  jumlah_porsi: number;
  total_harga: number;
  waktu_pesan: string;
  waktu_saji: string | null;
  is_jam_sibuk: boolean;
  kompensasi_diberikan: boolean;
  stempel_ditambahkan: number;
  stempel_saat_ini: number;
  nomor_meja?: string;
  tipe_pesanan?: "Dine-in" | "Takeaway WA" | "Booking";
  status_dapur?: "Antre" | "Dimasak" | "Siap Saji" | "Selesai";
  stasiun_dapur?: string;
  koki_pic?: string;
  catatan_pesanan?: string;
  metode_bayar?: "Tunai" | "QRIS";
  diskon_nominal?: number;
  order_items?: OrderItemLine[];
}
