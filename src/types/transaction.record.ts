export interface TransactionRecord {
  id: string;
  customer_id: string | null;
  customer_nama: string;
  customer_wa: string;
  menu_pesanan: string;
  jumlah_porsi: number;
  total_harga: number;
  waktu_pesan: string;
  waktu_saji: string | null;
  is_jam_sibuk: boolean;
  kompensasi_diberikan: boolean;
  stempel_ditambahkan: number;
  stempel_saat_ini: number;
}
