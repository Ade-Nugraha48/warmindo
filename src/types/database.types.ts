export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum Types
export type UserRole = "admin" | "kasir" | "pemilik";
export type SegmenKampus =
  | "Mahasiswa UPN"
  | "Mahasiswa YKPN"
  | "Mahasiswa Atma Jaya"
  | "Umum";
export type KategoriTiket = "Waktu Tunggu" | "Salah Pesanan" | "Fasilitas";
export type PicTiket = "Dapur" | "Lantai" | "Admin";
export type StatusTiket = "Baru" | "Diproses" | "Selesai";
export type JenisKampanye =
  | "Kangen Nongkrong"
  | "Insentif Es Teh"
  | "Begadang Nugas";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nama_lengkap: string;
          created_at: string | null;
          username?: string | null;
          shift_default?: string | null;
        };
        Insert: {
          id: string;
          role?: UserRole;
          nama_lengkap: string;
          created_at?: string | null;
          username?: string | null;
          shift_default?: string | null;
        };
        Update: {
          id?: string;
          role?: UserRole;
          nama_lengkap?: string;
          created_at?: string | null;
          username?: string | null;
          shift_default?: string | null;
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
          preferensi_racikan?: string | null;
          meja_favorit?: string | null;
          total_kunjungan?: number | null;
          total_belanja?: number | null;
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
          preferensi_racikan?: string | null;
          meja_favorit?: string | null;
          total_kunjungan?: number | null;
          total_belanja?: number | null;
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
          preferensi_racikan?: string | null;
          meja_favorit?: string | null;
          total_kunjungan?: number | null;
          total_belanja?: number | null;
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
          kode_order?: string | null;
          nomor_meja?: string | null;
          tipe_pesanan?: string | null;
          status_dapur?: string | null;
          stasiun_dapur?: string | null;
          koki_pic?: string | null;
          catatan_pesanan?: string | null;
          metode_bayar?: string | null;
          diskon_nominal?: number | null;
          shift?: string | null;
          order_items_json?: Json | null;
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
          kode_order?: string | null;
          nomor_meja?: string | null;
          tipe_pesanan?: string | null;
          status_dapur?: string | null;
          stasiun_dapur?: string | null;
          koki_pic?: string | null;
          catatan_pesanan?: string | null;
          metode_bayar?: string | null;
          diskon_nominal?: number | null;
          shift?: string | null;
          order_items_json?: Json | null;
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
          kode_order?: string | null;
          nomor_meja?: string | null;
          tipe_pesanan?: string | null;
          status_dapur?: string | null;
          stasiun_dapur?: string | null;
          koki_pic?: string | null;
          catatan_pesanan?: string | null;
          metode_bayar?: string | null;
          diskon_nominal?: number | null;
          shift?: string | null;
          order_items_json?: Json | null;
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
          kode_tiket?: string | null;
          nomor_meja?: string | null;
          transaction_id?: string | null;
          kompensasi_item?: string | null;
          kronologi_audit?: Json | null;
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
          kode_tiket?: string | null;
          nomor_meja?: string | null;
          transaction_id?: string | null;
          kompensasi_item?: string | null;
          kronologi_audit?: Json | null;
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
          kode_tiket?: string | null;
          nomor_meja?: string | null;
          transaction_id?: string | null;
          kompensasi_item?: string | null;
          kronologi_audit?: Json | null;
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
      menu_items: {
        Row: {
          id: string;
          kode_menu: string;
          nama: string;
          kategori: string;
          deskripsi: string;
          harga: number;
          estimasi_menit: string | null;
          stasiun_default: string | null;
          badge_tag: string | null;
          gambar_url: string | null;
          is_available: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          kode_menu: string;
          nama: string;
          kategori: string;
          deskripsi: string;
          harga: number;
          estimasi_menit?: string | null;
          stasiun_default?: string | null;
          badge_tag?: string | null;
          gambar_url?: string | null;
          is_available?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          kode_menu?: string;
          nama?: string;
          kategori?: string;
          deskripsi?: string;
          harga?: number;
          estimasi_menit?: string | null;
          stasiun_default?: string | null;
          badge_tag?: string | null;
          gambar_url?: string | null;
          is_available?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      wa_quick_replies: {
        Row: {
          id: string;
          shortcut: string;
          judul: string;
          kategori: string;
          isi_pesan: string;
          trigger_mode: string | null;
          keyboard_shortcut: string | null;
          usage_count: number | null;
          is_primary_kasir: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          shortcut: string;
          judul: string;
          kategori: string;
          isi_pesan: string;
          trigger_mode?: string | null;
          keyboard_shortcut?: string | null;
          usage_count?: number | null;
          is_primary_kasir?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          shortcut?: string;
          judul?: string;
          kategori?: string;
          isi_pesan?: string;
          trigger_mode?: string | null;
          keyboard_shortcut?: string | null;
          usage_count?: number | null;
          is_primary_kasir?: boolean | null;
          created_at?: string | null;
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
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
export type WaResponseLog = Database["public"]["Tables"]["wa_response_logs"]["Row"];
export type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
export type WaQuickReplyRow = Database["public"]["Tables"]["wa_quick_replies"]["Row"];
