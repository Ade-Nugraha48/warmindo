export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum Types
export type UserRole = "admin" | "kasir" | "pemilik";
export type SegmenKampus = "Mahasiswa UPN" | "Mahasiswa Atma Jaya" | "Umum";
export type KategoriTiket = "Waktu Tunggu" | "Salah Pesanan" | "Fasilitas";
export type PicTiket = "Dapur" | "Lantai" | "Admin";
export type StatusTiket = "Baru" | "Diproses" | "Selesai";
export type JenisKampanye = "Kangen Nongkrong" | "Insentif Es Teh" | "Begadang Nugas";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nama_lengkap: string;
          created_at: string | null;
        };
        Insert: {
          id: string;
          role?: UserRole;
          nama_lengkap: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          role?: UserRole;
          nama_lengkap?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
          segmen: SegmenKampus | null;
          setuju_promo: boolean | null;
          label: string | null;
          stempel_loyalitas: number | null;
          terakhir_transaksi: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nama_panggilan: string;
          nomor_wa: string;
          segmen?: SegmenKampus | null;
          setuju_promo?: boolean | null;
          label?: string | null;
          stempel_loyalitas?: number | null;
          terakhir_transaksi?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nama_panggilan?: string;
          nomor_wa?: string;
          segmen?: SegmenKampus | null;
          setuju_promo?: boolean | null;
          label?: string | null;
          stempel_loyalitas?: number | null;
          terakhir_transaksi?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          customer_id: string | null;
          menu_pesanan: string;
          jumlah_porsi: number;
          total_harga: number;
          waktu_pesan: string | null;
          waktu_saji: string | null;
          is_jam_sibuk: boolean | null;
          kompensasi_diberikan: boolean | null;
          stempel_ditambahkan: number | null;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          menu_pesanan: string;
          jumlah_porsi: number;
          total_harga: number;
          waktu_pesan?: string | null;
          waktu_saji?: string | null;
          is_jam_sibuk?: boolean | null;
          kompensasi_diberikan?: boolean | null;
          stempel_ditambahkan?: number | null;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          menu_pesanan?: string;
          jumlah_porsi?: number;
          total_harga?: number;
          waktu_pesan?: string | null;
          waktu_saji?: string | null;
          is_jam_sibuk?: boolean | null;
          kompensasi_diberikan?: boolean | null;
          stempel_ditambahkan?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          id: string;
          customer_id: string | null;
          kategori: KategoriTiket;
          deskripsi_keluhan: string;
          pic: PicTiket;
          status: StatusTiket | null;
          waktu_masuk: string | null;
          waktu_selesai: string | null;
          diselesaikan_di_tempat: boolean | null;
          pesan_konfirmasi_terkirim: boolean | null;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          kategori: KategoriTiket;
          deskripsi_keluhan: string;
          pic: PicTiket;
          status?: StatusTiket | null;
          waktu_masuk?: string | null;
          waktu_selesai?: string | null;
          diselesaikan_di_tempat?: boolean | null;
          pesan_konfirmasi_terkirim?: boolean | null;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          kategori?: KategoriTiket;
          deskripsi_keluhan?: string;
          pic?: PicTiket;
          status?: StatusTiket | null;
          waktu_masuk?: string | null;
          waktu_selesai?: string | null;
          diselesaikan_di_tempat?: boolean | null;
          pesan_konfirmasi_terkirim?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_logs: {
        Row: {
          id: string;
          customer_id: string | null;
          jenis_kampanye: JenisKampanye;
          waktu_kirim: string | null;
          berhasil_reaktivasi: boolean | null;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          jenis_kampanye: JenisKampanye;
          waktu_kirim?: string | null;
          berhasil_reaktivasi?: boolean | null;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          jenis_kampanye?: JenisKampanye;
          waktu_kirim?: string | null;
          berhasil_reaktivasi?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_logs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      wa_response_logs: {
        Row: {
          id: string;
          waktu_pesan_masuk: string;
          waktu_dibalas_admin: string | null;
          selisih_menit: number | null;
        };
        Insert: {
          id?: string;
          waktu_pesan_masuk: string;
          waktu_dibalas_admin?: string | null;
          selisih_menit?: never;
        };
        Update: {
          id?: string;
          waktu_pesan_masuk?: string;
          waktu_dibalas_admin?: string | null;
          selisih_menit?: never;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      segmen_kampus: SegmenKampus;
      kategori_tiket: KategoriTiket;
      pic_tiket: PicTiket;
      status_tiket: StatusTiket;
      jenis_kampanye: JenisKampanye;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience Type Aliases for Tables
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
export type TicketInsert = Database["public"]["Tables"]["tickets"]["Insert"];
export type TicketUpdate = Database["public"]["Tables"]["tickets"]["Update"];

export type CampaignLog = Database["public"]["Tables"]["campaign_logs"]["Row"];
export type CampaignLogInsert = Database["public"]["Tables"]["campaign_logs"]["Insert"];
export type CampaignLogUpdate = Database["public"]["Tables"]["campaign_logs"]["Update"];

export type WaResponseLog = Database["public"]["Tables"]["wa_response_logs"]["Row"];
export type WaResponseLogInsert = Database["public"]["Tables"]["wa_response_logs"]["Insert"];
export type WaResponseLogUpdate = Database["public"]["Tables"]["wa_response_logs"]["Update"];
