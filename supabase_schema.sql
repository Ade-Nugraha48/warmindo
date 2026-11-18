-- =========================================================================
-- DATABASE SCHEMA: CRM Warmindo Sumber Rizki 2
-- Sesuai dengan spesifikasi dokumen docs/database_architecture.md
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum Types (Tipe Data Dropdown)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'pemilik');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE segmen_kampus AS ENUM ('Mahasiswa UPN', 'Mahasiswa Atma Jaya', 'Umum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kategori_tiket AS ENUM ('Waktu Tunggu', 'Salah Pesanan', 'Fasilitas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pic_tiket AS ENUM ('Dapur', 'Lantai', 'Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_tiket AS ENUM ('Baru', 'Diproses', 'Selesai');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE jenis_kampanye AS ENUM ('Kangen Nongkrong', 'Insentif Es Teh', 'Begadang Nugas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabel Pengguna (Staff & Profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'kasir',
    nama_lengkap VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Tabel Pelanggan (Single Customer View)
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nama_panggilan VARCHAR(100) NOT NULL,
    nomor_wa VARCHAR(20) UNIQUE NOT NULL, -- Mencegah nomor ganda (FR 2.c)
    segmen segmen_kampus DEFAULT 'Umum',
    setuju_promo BOOLEAN DEFAULT TRUE,
    label VARCHAR(50), -- Contoh: 'Member Malam', 'Pelanggan Pasif', 'Booking Meja'
    stempel_loyalitas INT DEFAULT 0 CHECK (stempel_loyalitas >= 0 AND stempel_loyalitas <= 5),
    terakhir_transaksi TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Tabel Transaksi & Stempel
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    menu_pesanan TEXT NOT NULL,
    jumlah_porsi INT NOT NULL,
    total_harga NUMERIC NOT NULL,
    waktu_pesan TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    waktu_saji TIMESTAMP WITH TIME ZONE,
    is_jam_sibuk BOOLEAN DEFAULT FALSE,
    kompensasi_diberikan BOOLEAN DEFAULT FALSE,
    stempel_ditambahkan INT DEFAULT 1
);

-- Trigger Otomatis: Update stempel & tanggal terakhir di customers
CREATE OR REPLACE FUNCTION update_customer_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET terakhir_transaksi = NEW.waktu_pesan,
        stempel_loyalitas = CASE
            WHEN stempel_loyalitas + NEW.stempel_ditambahkan > 5 THEN 0 -- Reset setelah 5
            ELSE stempel_loyalitas + NEW.stempel_ditambahkan
        END
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_transaction ON transactions;
CREATE TRIGGER trg_after_transaction
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_customer_after_transaction();

-- 5. Tabel Tiket Keluhan (Service Automation & SLA)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    kategori kategori_tiket NOT NULL,
    deskripsi_keluhan TEXT NOT NULL,
    pic pic_tiket NOT NULL,
    status status_tiket DEFAULT 'Baru',
    waktu_masuk TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    waktu_selesai TIMESTAMP WITH TIME ZONE,
    diselesaikan_di_tempat BOOLEAN DEFAULT TRUE,
    pesan_konfirmasi_terkirim BOOLEAN DEFAULT FALSE
);

-- 6. Tabel Riwayat Kampanye (Marketing Automation & Reaktivasi)
CREATE TABLE IF NOT EXISTS campaign_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    jenis_kampanye jenis_kampanye NOT NULL,
    waktu_kirim TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    berhasil_reaktivasi BOOLEAN DEFAULT FALSE
);

-- 7. Tabel Log Respon WhatsApp (KPI Response Time < 5 menit)
CREATE TABLE IF NOT EXISTS wa_response_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    waktu_pesan_masuk TIMESTAMP WITH TIME ZONE NOT NULL,
    waktu_dibalas_admin TIMESTAMP WITH TIME ZONE,
    selisih_menit NUMERIC GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (waktu_dibalas_admin - waktu_pesan_masuk)) / 60
    ) STORED
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_response_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations
DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write tickets" ON tickets FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write campaign_logs" ON campaign_logs FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read/write wa_response_logs" ON wa_response_logs FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Allow anon read/write for demo/testing mode if needed
DO $$ BEGIN
    CREATE POLICY "Allow anon select customers" ON customers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon insert customers" ON customers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all transactions" ON transactions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all tickets" ON tickets FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all campaign_logs" ON campaign_logs FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow anon all wa_response_logs" ON wa_response_logs FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
