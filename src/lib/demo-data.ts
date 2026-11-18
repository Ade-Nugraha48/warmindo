import type { Customer } from "@/types/database.types";
import type { TransactionRecord } from "@/types/transaction.record";
import type { TicketRecord } from "@/types/ticket.record";
import type { CampaignLogRecord } from "@/types/campaign.record";
import type {
  WeeklyTrendData,
  TopMenuItem,
  ReactivationMetricItem,
} from "@/types/dashboard.record";

export const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    id: "e4a1c5d0-9f3b-4c8d-8a1e-2f3b4c5d6e7f",
    nama_panggilan: "Dimas Anggara",
    nomor_wa: "081234564321",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 4,
    terakhir_transaksi: "2026-11-16T21:30:00Z",
    created_at: "2026-10-10T10:00:00Z",
  },
  {
    id: "f5b2d6e1-0a4c-5d9e-9b2f-3a4b5c6d7e8a",
    nama_panggilan: "Clara Vania",
    nomor_wa: "081912348890",
    segmen: "Mahasiswa Atma Jaya",
    setuju_promo: true,
    label: "Booking Meja",
    stempel_loyalitas: 5,
    terakhir_transaksi: "2026-11-15T13:15:00Z",
    created_at: "2026-10-15T11:20:00Z",
  },
  {
    id: "a6c3e7f2-1b5d-6e0f-0c3a-4b5c6d7e8f9b",
    nama_panggilan: "Rizky Pratama",
    nomor_wa: "085798761122",
    segmen: "Umum",
    setuju_promo: false,
    label: "Pelanggan Pasif",
    stempel_loyalitas: 1,
    terakhir_transaksi: "2026-11-01T19:00:00Z", // 17 days ago
    created_at: "2026-09-20T14:40:00Z",
  },
  {
    id: "b7d4f8a3-2c6e-7f1a-1d4b-5c6d7e8f0a1c",
    nama_panggilan: "Farhan Hakim",
    nomor_wa: "082155557788",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 3,
    terakhir_transaksi: "2026-11-17T22:10:00Z",
    created_at: "2026-10-28T09:15:00Z",
  },
  {
    id: "c8e5a9b4-3d7f-8a2b-2e5c-6d7e8f0a1b2c",
    nama_panggilan: "Bayu Setiawan",
    nomor_wa: "085678901234",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 3,
    terakhir_transaksi: "2026-10-30T22:00:00Z", // 19 days ago
    created_at: "2026-09-10T12:00:00Z",
  },
  {
    id: "d9f6b0c5-4e8a-9b3c-3f6d-7e8f0a1b2c3d",
    nama_panggilan: "Anisa Rahma",
    nomor_wa: "089876543210",
    segmen: "Mahasiswa Atma Jaya",
    setuju_promo: false,
    label: "Pelanggan Pasif",
    stempel_loyalitas: 2,
    terakhir_transaksi: "2026-10-14T18:00:00Z", // 35 days ago
    created_at: "2026-08-15T10:00:00Z",
  },
  {
    id: "ea07c1d6-5f9b-0c4d-4a7e-8f9a1b2c3d4e",
    nama_panggilan: "Fajar Nugraha",
    nomor_wa: "081234567890",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 4,
    terakhir_transaksi: "2026-10-28T23:15:00Z", // 21 days ago
    created_at: "2026-09-01T15:00:00Z",
  },
  {
    id: "fb18d2e7-6a0c-1d5e-5b8f-9a0b1c2d3e4f",
    nama_panggilan: "Siti Nurhaliza",
    nomor_wa: "087712349900",
    segmen: "Umum",
    setuju_promo: true,
    label: "Pelanggan Pasif",
    stempel_loyalitas: 1,
    terakhir_transaksi: "2026-10-07T14:30:00Z", // 42 days ago
    created_at: "2026-07-20T11:00:00Z",
  },
];

const now = Date.now();
export const INITIAL_DEMO_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "TRX-001",
    customer_id: "e4a1c5d0-9f3b-4c8d-8a1e-2f3b4c5d6e7f",
    customer_nama: "Dimas Anggara",
    customer_wa: "081234564321",
    menu_pesanan: "Indomie Dok-dok Spesial + Es Teh Manis Jumbo",
    jumlah_porsi: 2,
    total_harga: 19000,
    // Placed 25 minutes ago, unserved -> triggers >20 min SLA warning!
    waktu_pesan: new Date(now - 25 * 60 * 1000).toISOString(),
    waktu_saji: null,
    is_jam_sibuk: true,
    kompensasi_diberikan: false,
    stempel_ditambahkan: 1,
    stempel_saat_ini: 4,
  },
  {
    id: "TRX-002",
    customer_id: "f5b2d6e1-0a4c-5d9e-9b2f-3a4b5c6d7e8a",
    customer_nama: "Clara Vania",
    customer_wa: "081912348890",
    menu_pesanan: "Magelangan Telur Orak-Arik",
    jumlah_porsi: 1,
    total_harga: 16000,
    waktu_pesan: new Date(now - 10 * 60 * 1000).toISOString(),
    waktu_saji: null,
    is_jam_sibuk: true,
    kompensasi_diberikan: false,
    stempel_ditambahkan: 1,
    stempel_saat_ini: 5,
  },
  {
    id: "TRX-003",
    customer_id: "b7d4f8a3-2c6e-7f1a-1d4b-5c6d7e8f0a1c",
    customer_nama: "Farhan Hakim",
    customer_wa: "082155557788",
    menu_pesanan: "Nasi Ayam Geprek Sambal Korek + Es Teh",
    jumlah_porsi: 2,
    total_harga: 22000,
    waktu_pesan: new Date(now - 35 * 60 * 1000).toISOString(),
    waktu_saji: new Date(now - 24 * 60 * 1000).toISOString(),
    is_jam_sibuk: false,
    kompensasi_diberikan: false,
    stempel_ditambahkan: 1,
    stempel_saat_ini: 3,
  },
];

export const INITIAL_DEMO_TICKETS: TicketRecord[] = [
  {
    id: "TK-001",
    customer_id: "e4a1c5d0-9f3b-4c8d-8a1e-2f3b4c5d6e7f",
    customer_nama: "Dimas Anggara",
    customer_wa: "081234564321",
    kategori: "Waktu Tunggu",
    deskripsi_keluhan: "Pesanan mie goreng dok-dok meja 4 belum tersaji setelah 22 menit.",
    pic: "Dapur",
    status: "Baru",
    waktu_masuk: new Date(now - 14 * 60 * 1000).toISOString(),
    waktu_selesai: null,
    diselesaikan_di_tempat: true,
    pesan_konfirmasi_terkirim: false,
  },
  {
    id: "TK-002",
    customer_id: "f5b2d6e1-0a4c-5d9e-9b2f-3a4b5c6d7e8a",
    customer_nama: "Clara Vania",
    customer_wa: "081912348890",
    kategori: "Salah Pesanan",
    deskripsi_keluhan: "Minta telur setengah matang tetapi tersaji matang. Sedang dibuatkan pengganti.",
    pic: "Lantai",
    status: "Diproses",
    waktu_masuk: new Date(now - 22 * 60 * 1000).toISOString(),
    waktu_selesai: null,
    diselesaikan_di_tempat: true,
    pesan_konfirmasi_terkirim: false,
  },
  {
    id: "TK-003",
    customer_id: "b7d4f8a3-2c6e-7f1a-1d4b-5c6d7e8f0a1c",
    customer_nama: "Farhan Hakim",
    customer_wa: "082155557788",
    kategori: "Fasilitas",
    deskripsi_keluhan: "Tisu dan saus di meja 8 habis, staf lantai telah mengisi ulang.",
    pic: "Lantai",
    status: "Selesai",
    waktu_masuk: new Date(now - 60 * 60 * 1000).toISOString(),
    waktu_selesai: new Date(now - 50 * 60 * 1000).toISOString(),
    diselesaikan_di_tempat: true,
    pesan_konfirmasi_terkirim: true,
  },
];

export const INITIAL_DEMO_CAMPAIGN_LOGS: CampaignLogRecord[] = [
  {
    id: "CMP-001",
    customer_id: "ea07c1d6-5f9b-0c4d-4a7e-8f9a1b2c3d4e",
    customer_nama: "Fajar Nugraha",
    customer_wa: "081234567890",
    jenis_kampanye: "Begadang Nugas",
    waktu_kirim: "2026-11-14T22:00:00Z",
    berhasil_reaktivasi: true,
  },
  {
    id: "CMP-002",
    customer_id: "c8e5a9b4-3d7f-8a2b-2e5c-6d7e8f0a1b2c",
    customer_nama: "Bayu Setiawan",
    customer_wa: "085678901234",
    jenis_kampanye: "Insentif Es Teh",
    waktu_kirim: "2026-11-10T14:30:00Z",
    berhasil_reaktivasi: false,
  },
  {
    id: "CMP-003",
    customer_id: "e4a1c5d0-9f3b-4c8d-8a1e-2f3b4c5d6e7f",
    customer_nama: "Dimas Anggara",
    customer_wa: "081234564321",
    jenis_kampanye: "Kangen Nongkrong",
    waktu_kirim: "2026-11-05T19:00:00Z",
    berhasil_reaktivasi: true,
  },
];

export const INITIAL_DEMO_WA_LOGS = [
  { id: "WA-01", waktu_pesan_masuk: "2026-11-18T08:00:00Z", waktu_dibalas_admin: "2026-11-18T08:02:45Z", selisih_menit: 2.75 },
  { id: "WA-02", waktu_pesan_masuk: "2026-11-18T09:15:00Z", waktu_dibalas_admin: "2026-11-18T09:18:30Z", selisih_menit: 3.5 },
  { id: "WA-03", waktu_pesan_masuk: "2026-11-18T11:30:00Z", waktu_dibalas_admin: "2026-11-18T11:31:40Z", selisih_menit: 1.67 },
  { id: "WA-04", waktu_pesan_masuk: "2026-11-18T12:45:00Z", waktu_dibalas_admin: "2026-11-18T12:49:00Z", selisih_menit: 4.25 },
  { id: "WA-05", waktu_pesan_masuk: "2026-11-18T14:10:00Z", waktu_dibalas_admin: "2026-11-18T14:13:20Z", selisih_menit: 3.33 },
  { id: "WA-06", waktu_pesan_masuk: "2026-11-18T16:20:00Z", waktu_dibalas_admin: "2026-11-18T16:23:50Z", selisih_menit: 3.83 },
  { id: "WA-07", waktu_pesan_masuk: "2026-11-18T18:05:00Z", waktu_dibalas_admin: "2026-11-18T18:07:30Z", selisih_menit: 2.5 },
  { id: "WA-08", waktu_pesan_masuk: "2026-11-18T20:40:00Z", waktu_dibalas_admin: "2026-11-18T20:44:10Z", selisih_menit: 4.17 },
];

export const INITIAL_DEMO_WEEKLY_TRENDS: WeeklyTrendData[] = [
  { minggu: "W1", label: "01 - 07 Okt", transaksiMember: 68, transaksiNonMember: 110, totalTransaksi: 178, omsetMember: 1156000, totalOmset: 2848000 },
  { minggu: "W2", label: "08 - 14 Okt", transaksiMember: 82, transaksiNonMember: 118, totalTransaksi: 200, omsetMember: 1394000, totalOmset: 3200000 },
  { minggu: "W3", label: "15 - 21 Okt", transaksiMember: 96, transaksiNonMember: 122, totalTransaksi: 218, omsetMember: 1680000, totalOmset: 3620000 },
  { minggu: "W4", label: "22 - 28 Okt", transaksiMember: 120, transaksiNonMember: 125, totalTransaksi: 245, omsetMember: 2160000, totalOmset: 4165000 },
  { minggu: "W5", label: "29 Okt - 04 Nov", transaksiMember: 145, transaksiNonMember: 130, totalTransaksi: 275, omsetMember: 2682000, totalOmset: 4812000 },
  { minggu: "W6", label: "05 - 11 Nov", transaksiMember: 172, transaksiNonMember: 128, totalTransaksi: 300, omsetMember: 3182000, totalOmset: 5400000 },
  { minggu: "W7", label: "12 - 18 Nov", transaksiMember: 198, transaksiNonMember: 132, totalTransaksi: 330, omsetMember: 3762000, totalOmset: 6105000 },
  { minggu: "W8 (Est)", label: "19 - 25 Nov", transaksiMember: 225, transaksiNonMember: 135, totalTransaksi: 360, omsetMember: 4275000, totalOmset: 6660000 },
];

export const INITIAL_DEMO_TOP_MENUS: TopMenuItem[] = [
  { rank: 1, nama: "Indomie Goreng Dok-dok Spesial", kategori: "Makanan", porsi: 142, hargaSatuan: 16000, totalOmset: 2272000, kontribusiPersen: 32 },
  { rank: 2, nama: "Es Teh Manis Jumbo", kategori: "Minuman", porsi: 210, hargaSatuan: 5000, totalOmset: 1050000, kontribusiPersen: 25 },
  { rank: 3, nama: "Magelangan Telur Orak-Arik", kategori: "Makanan", porsi: 98, hargaSatuan: 16000, totalOmset: 1568000, kontribusiPersen: 18 },
  { rank: 4, nama: "Nasi Ayam Geprek Sambal Korek", kategori: "Spesial", porsi: 84, hargaSatuan: 18000, totalOmset: 1512000, kontribusiPersen: 15 },
  { rank: 5, nama: "Nutrisari Jeruk Peras Dingin", kategori: "Minuman", porsi: 76, hargaSatuan: 6000, totalOmset: 456000, kontribusiPersen: 10 },
];

export const INITIAL_DEMO_REACTIVATION_STATS: {
  totalTerkirim: number;
  totalReaktivasi: number;
  konversiKeseluruhan: number;
  totalOmsetReaktivasi: number;
  items: ReactivationMetricItem[];
} = {
  totalTerkirim: 67,
  totalReaktivasi: 29,
  konversiKeseluruhan: 43.3,
  totalOmsetReaktivasi: 1425000,
  items: [
    {
      namaKampanye: "Broadcast Begadang Nugas",
      jenis: "Begadang Nugas",
      totalSent: 42,
      totalWinBack: 18,
      konversiRate: 42.8,
      estimasiOmset: 882000,
    },
    {
      namaKampanye: "Template Sapaan Kangen (/kangen)",
      jenis: "Kangen Nongkrong",
      totalSent: 15,
      totalWinBack: 7,
      konversiRate: 46.7,
      estimasiOmset: 364000,
    },
    {
      namaKampanye: "Insentif Es Teh Gratis (/insentif)",
      jenis: "Insentif Es Teh",
      totalSent: 10,
      totalWinBack: 4,
      konversiRate: 40.0,
      estimasiOmset: 179000,
    },
  ],
};
