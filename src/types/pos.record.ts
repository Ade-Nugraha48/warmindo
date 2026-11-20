export type MenuCategoryKey = "all" | "indomie" | "nasi" | "minuman" | "cemilan";

export interface MenuCatalogItem {
  id: string;
  kode_menu: string;
  nama: string;
  kategori: Exclude<MenuCategoryKey, "all">;
  deskripsi: string;
  harga: number;
  estimasi_menit: string;
  stasiun_default: string;
  badge_tag?: string | null;
  gambar_url: string;
  default_note: string;
  is_available: boolean;
}

export interface CartLine {
  menu: MenuCatalogItem;
  qty: number;
  catatan: string;
}

export interface ChefPerformanceRecord {
  id: string;
  inisial: string;
  nama: string;
  stasiun: string;
  rataRataMenit: number;
  porsiSelesai: number;
  isPrimary?: boolean;
}

export type QuickReplyCategory =
  | "all"
  | "sla"
  | "order"
  | "promo"
  | "facility"
  | "greeting";

export interface QuickReplyTemplate {
  id: string;
  shortcut: string;
  judul: string;
  kategori: Exclude<QuickReplyCategory, "all">;
  isi_pesan: string;
  trigger_mode: "Auto KDS" | "Auto CRM" | "Manual Kasir";
  keyboard_shortcut?: string | null;
  usage_count: number;
  is_primary_kasir: boolean;
}
