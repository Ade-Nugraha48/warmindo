export const MAX_LOYALTY_STAMPS = 10;

export const SLA_SAFE_MINUTES = 15;
export const SLA_WARNING_MINUTES = 20;
export const SLA_BREACH_MINUTES = 20;
export const FCR_TARGET_MINUTES = 5;

export const OUTLET_BRANCHES = [
  {
    id: "seturan-upn",
    name: "Warmindo Seturan - Cabang UPN",
    shortName: "Sumber Rizki 2 - Seturan",
    address: "Jl. Seturan Raya No. 42 (Depan Kampus UPN Veteran)",
    nodeCode: "Node Seturan-02",
  },
  {
    id: "babarsari-atma",
    name: "Warmindo Babarsari - Atma Jaya",
    shortName: "Sumber Rizki 1 - Babarsari",
    address: "Jl. Babarsari No. 18 (Depan Kampus UAJY)",
    nodeCode: "Node Babarsari-01",
  },
] as const;

export const PROMO_BEGADANG_NUGAS = {
  title: "Begadang Nugas",
  badge: "PROMO AKTIF",
  discountPercent: 10,
  description: "Diskon 10% setiap Jumat Malam >22:00 WIB untuk mahasiswa.",
};
