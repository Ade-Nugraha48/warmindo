-- =========================================================================
-- DATABASE MIGRATION V2: WarminDOS (Warm Hospitality & Operations Engine)
-- Ekstensi skema untuk:
--   1. Katalog Menu POS (menu_items)
--   2. Antrean Dapur & SLA KDS (kolom tambahan pada transactions)
--   3. Loyalitas 10 Stempel & Preferensi Racikan (customers)
--   4. Audit Kronologi & Kompensasi Tiket (tickets)
--   5. Quick Replies WA & Shortcut Kasir (wa_quick_replies)
--   6. Segmen Mahasiswa YKPN
-- Aman dijalankan berulang kali (idempotent).
-- =========================================================================

-- 1. Tambah nilai enum segmen_kampus ('Mahasiswa YKPN')
DO $$ BEGIN
    ALTER TYPE segmen_kampus ADD VALUE IF NOT EXISTS 'Mahasiswa YKPN';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Upgrade tabel profiles untuk shift kerja kasir
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS username VARCHAR(80),
    ADD COLUMN IF NOT EXISTS shift_default VARCHAR(20) DEFAULT 'Malam';

-- 3. Upgrade tabel customers: 10 stempel + preferensi racikan & statistik
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS preferensi_racikan TEXT,
    ADD COLUMN IF NOT EXISTS meja_favorit VARCHAR(50),
    ADD COLUMN IF NOT EXISTS total_kunjungan INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_belanja NUMERIC DEFAULT 0;

-- Ganti constraint max stempel dari 5 -> 10
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'customers'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%stempel_loyalitas%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE customers DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

ALTER TABLE customers
    ADD CONSTRAINT customers_stempel_loyalitas_check
    CHECK (stempel_loyalitas >= 0 AND stempel_loyalitas <= 10);

-- Update trigger stempel agar reset setelah mencapai 10 stempel
CREATE OR REPLACE FUNCTION update_customer_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET terakhir_transaksi = NEW.waktu_pesan,
        total_kunjungan = COALESCE(total_kunjungan, 0) + 1,
        total_belanja = COALESCE(total_belanja, 0) + COALESCE(NEW.total_harga, 0),
        stempel_loyalitas = CASE
            WHEN COALESCE(stempel_loyalitas, 0) + COALESCE(NEW.stempel_ditambahkan, 1) > 10 THEN 0
            ELSE COALESCE(stempel_loyalitas, 0) + COALESCE(NEW.stempel_ditambahkan, 1)
        END
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Upgrade tabel transactions untuk POS Kasir & Kitchen Display System (KDS)
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS kode_order VARCHAR(24),
    ADD COLUMN IF NOT EXISTS nomor_meja VARCHAR(20) DEFAULT 'Meja 01',
    ADD COLUMN IF NOT EXISTS tipe_pesanan VARCHAR(24) DEFAULT 'Dine-in',
    ADD COLUMN IF NOT EXISTS status_dapur VARCHAR(24) DEFAULT 'Antre',
    ADD COLUMN IF NOT EXISTS stasiun_dapur VARCHAR(50),
    ADD COLUMN IF NOT EXISTS koki_pic VARCHAR(80),
    ADD COLUMN IF NOT EXISTS catatan_pesanan TEXT,
    ADD COLUMN IF NOT EXISTS metode_bayar VARCHAR(24) DEFAULT 'Tunai',
    ADD COLUMN IF NOT EXISTS diskon_nominal NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shift VARCHAR(20) DEFAULT 'Malam',
    ADD COLUMN IF NOT EXISTS order_items_json JSONB DEFAULT '[]'::jsonb;

-- 5. Upgrade tabel tickets untuk Audit KDS & Kompensasi SLA Meja
ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS kode_tiket VARCHAR(24),
    ADD COLUMN IF NOT EXISTS nomor_meja VARCHAR(20),
    ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS kompensasi_item VARCHAR(120),
    ADD COLUMN IF NOT EXISTS kronologi_audit JSONB DEFAULT '[]'::jsonb;

-- 6. Tabel Baru: menu_items (Katalog POS Warmindo Sumber Rizki 2)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kode_menu VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(120) NOT NULL,
    kategori VARCHAR(40) NOT NULL, -- 'indomie' | 'nasi' | 'minuman' | 'cemilan'
    deskripsi TEXT NOT NULL,
    harga NUMERIC NOT NULL CHECK (harga >= 0),
    estimasi_menit VARCHAR(30) DEFAULT '8-10 mnt',
    stasiun_default VARCHAR(50) DEFAULT 'Kompor 1',
    badge_tag VARCHAR(40),
    gambar_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Tabel Baru: wa_quick_replies (Katalog Template & Shortcut Kasir)
CREATE TABLE IF NOT EXISTS wa_quick_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shortcut VARCHAR(40) UNIQUE NOT NULL, -- Contoh: '/sla-teh'
    judul VARCHAR(120) NOT NULL,
    kategori VARCHAR(30) NOT NULL, -- 'sla' | 'order' | 'promo' | 'facility' | 'greeting'
    isi_pesan TEXT NOT NULL,
    trigger_mode VARCHAR(30) DEFAULT 'Manual Kasir', -- 'Auto KDS' | 'Auto CRM' | 'Manual Kasir'
    keyboard_shortcut VARCHAR(20), -- Contoh: 'Alt + 1'
    usage_count INT DEFAULT 0,
    is_primary_kasir BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 8. RLS Policies untuk tabel baru
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_quick_replies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all menu_items" ON menu_items FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write wa_quick_replies" ON wa_quick_replies FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all wa_quick_replies" ON wa_quick_replies FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 9. Seed Data Awal: menu_items (8 Menu Unggulan Seturan)
INSERT INTO menu_items (kode_menu, nama, kategori, deskripsi, harga, estimasi_menit, stasiun_default, badge_tag, gambar_url)
VALUES
    ('IND-01', 'Indomie Goreng Komplit', 'indomie', 'Telor mata sapi 1/2 matang, kornet sapi gurih, sawi hijau segar, taburan bawang goreng garing melimpah.', 16000, '8-10 mnt', 'Kompor 1', 'BEST SELLER', '/images/menu/indomie-goreng.jpg'),
    ('NAS-01', 'Nasi Magelangan Spesial', 'nasi', 'Campuran nasi pulen & mie goreng khas Magelang, suwiran ayam gurih, bumbu pedas manis nikmat.', 18000, '12-14 mnt', 'Wajan 1', 'FAVORIT NUGAS', '/images/menu/magelangan.jpg'),
    ('IND-02', 'Indomie Rebus Kari Telur', 'indomie', 'Kuah kental gurih berempah kari, cabai rawit ulek pedas level 3, sayur sawi segar & telur rebus lembut.', 15000, '8-10 mnt', 'Kompor 3', NULL, '/images/menu/indomie-kari.jpg'),
    ('MIN-01', 'Es Teh Manis Jumbo Solo', 'minuman', 'Racikan daun teh wangi sepet legit melati khas Jawa Tengah, disajikan dalam gelas jumbo 700ml penuh es.', 5000, '2-3 mnt', 'Bar Saji', 'SEGAR DINGIN', '/images/menu/es-teh-jumbo.jpg'),
    ('IND-03', 'Indomie Dok-Dok Nyemek', 'indomie', 'Kuah kental nyemek telur orak-arik, bumbu bawang keprek & kecap manis legit khas resep Pak De Warmindo.', 17000, '10-12 mnt', 'Kompor 2', NULL, '/images/menu/dok-dok.jpg'),
    ('CEM-01', 'Pisang Bakar Cokelat Keju', 'cemilan', 'Pisang kepok bakar manis legit, taburan keju cheddar parut tebal, susu kental manis & meses cokelat.', 14000, '7-9 mnt', 'Panggangan', NULL, '/images/menu/pisang-bakar.jpg'),
    ('CEM-02', 'Bakwan & Mendoan (Isi 3)', 'cemilan', 'Goreng tepung renyah hangat langsung dari wajan, disajikan dengan cabai rawit hijau segar & sambal kecap.', 6000, 'Instan', 'Wajan Goreng', 'LANGSUNG READY', '/images/menu/gorengan.jpg'),
    ('MIN-02', 'Kopi Tubruk Aren Panas', 'minuman', 'Robusta lokal seduh air mendidih, aroma tajam pemompa semangat nugas semalaman, pemanis gula aren alami.', 8000, '3-5 mnt', 'Bar Saji', NULL, '/images/menu/kopi-tubruk.jpg')
ON CONFLICT (kode_menu) DO NOTHING;

-- 10. Seed Data Awal: wa_quick_replies
INSERT INTO wa_quick_replies (shortcut, judul, kategori, isi_pesan, trigger_mode, keyboard_shortcut, usage_count, is_primary_kasir)
VALUES
    ('/sla-teh', 'Kompensasi Masak >20m', 'sla', 'Halo Kak {nama_pelanggan} (Meja {nomor_meja})! 🍜\nMohon maaf atas keterlambatan pesanan {menu_terlambat} (masak melebihi 20 menit). Sesuai Garansi SLA Sumber Rizki, kami otomatis memberikan *1x Es Teh Manis Jumbo Solo GRATIS (Rp 0)* yang sudah diantar ke meja Kakak. Selamat menikmati! 🙏', 'Auto KDS', 'Alt + 2', 74, TRUE),
    ('/begadang', 'Begadang Nugas 22:00', 'promo', 'Kabar baik pejuang skripsi! 🌙 Tunjukkan KTM {kampus_pelanggan} Kakak malam ini untuk klaim Promo *Begadang Nugas*: Diskon 10% porsi kedua & Free Refill Teh Hangat. Kode kasir: *NUGAS-UPN*.', 'Manual Kasir', NULL, 52, FALSE),
    ('/wifi-lemot', 'Password WiFi & Port Meja', 'facility', 'Halo Kak di Meja {nomor_meja}! 📶\nAkses WiFi 100 Mbps kami:\n• SSID: *Warmindo-Seturan-5G*\n• Sandi: *miekuahkuningan*\nKabel colokan cadangan tersedia di kasir jika stopkontak bawah meja penuh ya!', 'Manual Kasir', 'Alt + 4', 28, FALSE),
    ('/salah-racik', 'Salah Racik / Level Cabai', 'order', 'Kak {nama_pelanggan}, mohon maaf atas ketidaksesuaian tingkat kematangan/pedas pada porsi Anda. Tim koki kami sedang memasak ulang menu pengganti langsung prioritas 5 menit. Mangkok sebelumnya silakan disimpan saja 🙏', 'Manual Kasir', NULL, 16, FALSE),
    ('/tukar-stempel', 'Klaim Kartu Stempel 10x', 'order', 'Selamat Kak {nama_pelanggan}! 🎉\nPoin loyalitas Anda telah mencapai {sisa_stempel}/10 stempel di Warmindo Seturan. Klaim 1 Porsi Mie Dok-Dok Bebas Toping sekarang dengan menunjukkan pesan ini ke kasir. Berlaku s.d akhir bulan!', 'Auto CRM', 'Alt + 3', 31, FALSE),
    ('/menu-malam', 'Salam Datang & Menu QR', 'greeting', 'Selamat datang di Warmindo Sumber Rizki 2 Seturan! 🍜\nLihat daftar menu lengkap tingkat pedas & topping di e-catalog kasir atau langsung pesan dari meja {nomor_meja} ya Kak!', 'Manual Kasir', 'Alt + 1', 45, FALSE)
ON CONFLICT (shortcut) DO NOTHING;
