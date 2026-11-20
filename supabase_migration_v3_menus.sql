-- =========================================================================
-- DATABASE MIGRATION V3: Penambahan Katalog Menu POS (Nasi, Camilan & Minuman)
-- Aman dijalankan berulang kali (idempotent via ON CONFLICT DO NOTHING).
-- =========================================================================

INSERT INTO menu_items (kode_menu, nama, kategori, deskripsi, harga, estimasi_menit, stasiun_default, badge_tag, gambar_url)
VALUES
    ('NAS-02', 'Nasi Ayam Bali', 'nasi', 'Nasi putih hangat dengan potongan ayam bumbu merah khas Bali gurih pedas dan irisan timun segar.', 13000, '8-10 mnt', 'Wajan 1', 'FAVORIT', '/images/menu/nasi-ayam-bali.jpg'),
    ('NAS-03', 'Nasi Ayam Geprek', 'nasi', 'Ayam crispy hangat digeprek sambal bawang ulek segar, lalapan timun dan kol di atas nasi pulen.', 14000, '8-10 mnt', 'Wajan 1', 'PEDAS LARIS', '/images/menu/nasi-ayam-geprek.jpg'),
    ('NAS-04', 'Nasi Orak Arik Ayam', 'nasi', 'Orak-arik telur bersama suwiran ayam, irisan kol dan bumbu bawang gurih di atas nasi putih hangat.', 15000, '8-10 mnt', 'Wajan 1', NULL, '/images/menu/nasi-orak-arik-ayam.jpg'),
    ('NAS-05', 'Nasi Orak Arik Telur', 'nasi', 'Tumis orak-arik telur lembut dengan sayuran kol dan bumbu kecap gurih bersama nasi putih pulen.', 10000, '6-8 mnt', 'Wajan 1', NULL, '/images/menu/nasi-orak-arik-telur.jpg'),
    ('NAS-06', 'Nasi Sayur', 'nasi', 'Menu hemat mahasiswa: nasi putih hangat dengan tumis sayur segar harian dan bumbu rumahan.', 7000, '4-6 mnt', 'Wajan 1', 'HEMAT', '/images/menu/nasi-sayur.jpg'),
    ('NAS-07', 'Nasi Telur', 'nasi', 'Nasi hangat pulen dengan telur dadar/ceplok garing, siraman kecap manis dan sambal ulek.', 10000, '5-7 mnt', 'Wajan 1', NULL, '/images/menu/nasi-telur.jpg'),
    ('NAS-08', 'Nasi Usus Balado', 'nasi', 'Usus ayam goreng kering dibalut bumbu balado cabai merah pedas gurih bersama nasi putih hangat.', 13000, '6-8 mnt', 'Wajan 1', NULL, '/images/menu/nasi-usus-balado.jpg'),
    ('NAS-09', 'Nasi Ayam Balado', 'nasi', 'Ayam goreng renyah disiram bumbu sambal balado merah manis pedas, disajikan dengan nasi hangat.', 13000, '8-10 mnt', 'Wajan 1', NULL, '/images/menu/nasi-ayam-balado.jpg'),
    ('NAS-10', 'Nasi Ikan', 'nasi', 'Nasi putih pulen dengan ikan goreng renyah, lalapan timun kemangi, dan sambal terasi segar.', 13000, '8-10 mnt', 'Wajan 1', NULL, '/images/menu/nasi-ikan.jpg'),
    ('CEM-03', 'Kerupuk', 'cemilan', 'Kerupuk putih kaleng warung renyah sebagai teman makan mie, nasi, maupun gorengan.', 1000, 'Instan', 'Bar Saji', 'LANGSUNG READY', '/images/menu/kerupuk.jpg'),
    ('CEM-04', 'Snack Ciki Kecil', 'cemilan', 'Aneka jajanan ciki kemasan ekonomis (varian Rp 2.000) siap santap untuk teman nugas.', 2000, 'Instan', 'Bar Saji', 'LANGSUNG READY', '/images/menu/snack-ciki.jpg'),
    ('CEM-05', 'Snack Ciki Besar', 'cemilan', 'Aneka snack ciki kemasan reguler (varian Rp 3.000) gurih renyah untuk nongkrong bareng.', 3000, 'Instan', 'Bar Saji', 'LANGSUNG READY', '/images/menu/snack-ciki.jpg'),
    ('CEM-06', 'Roti', 'cemilan', 'Roti manis lembut kemasan warung (varian cokelat / keju / srikaya) siap langsung santap.', 1500, 'Instan', 'Bar Saji', 'LANGSUNG READY', '/images/menu/roti.jpg'),
    ('MIN-03', 'Nutrisari', 'minuman', 'Minuman jeruk Nutrisari segar penuh vitamin C, cocok disajikan dingin dengan es batu atau hangat.', 4000, '2-3 mnt', 'Bar Saji', 'SEGAR DINGIN', '/images/menu/nutrisari.jpg'),
    ('MIN-04', 'Good Day', 'minuman', 'Kopi Good Day varian Cappuccino / Mocacinno lembut dengan taburan choco granule.', 4000, '2-3 mnt', 'Bar Saji', NULL, '/images/menu/good-day.jpg'),
    ('MIN-05', 'Soda Gembira', 'minuman', 'Perpaduan soda merah segar, kental manis creamy, dan es batu melimpah pelepas dahaga malam.', 8000, '3-4 mnt', 'Bar Saji', 'SEGAR DINGIN', '/images/menu/soda-gembira.jpg'),
    ('MIN-06', 'Milo', 'minuman', 'Minuman cokelat malt Milo gurih pekat yang dapat disajikan dingin ber-es maupun hangat.', 5000, '2-3 mnt', 'Bar Saji', NULL, '/images/menu/milo.jpg'),
    ('MIN-07', 'Nescafe', 'minuman', 'Seduhan kopi Nescafe klasik aroma halus, tersedia panas maupun es untuk teman lembur.', 3000, '2-3 mnt', 'Bar Saji', NULL, '/images/menu/nescafe.jpg'),
    ('MIN-08', 'Kopi Kapal Api', 'minuman', 'Kopi hitam klasik Kapal Api seduh panas dengan ampas khas warung dan manis sesuai selera.', 4000, '2-3 mnt', 'Bar Saji', NULL, '/images/menu/kopi-kapal-api.jpg'),
    ('MIN-09', 'Tea Jus', 'minuman', 'Es teh manis instan Tea Jus melati/gula batu yang super hemat dan menyegarkan.', 2000, '2-3 mnt', 'Bar Saji', 'HEMAT', '/images/menu/tea-jus.jpg'),
    ('MIN-10', 'HiLo', 'minuman', 'Susu cokelat tinggi kalsium HiLo creamy disajikan hangat atau dingin dengan es.', 4000, '2-3 mnt', 'Bar Saji', NULL, '/images/menu/hilo.jpg')
ON CONFLICT (kode_menu) DO NOTHING;
