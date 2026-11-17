# Database Schema: CRM Warmindo Sumber Rizki 2

## 1. Enum Types (Tipe Data Dropdown)
Digunakan agar data konsisten sesuai worksheet.

```sql
CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'pemilik');
CREATE TYPE segmen_kampus AS ENUM ('Mahasiswa UPN', 'Mahasiswa Atma Jaya', 'Umum');
CREATE TYPE kategori_tiket AS ENUM ('Waktu Tunggu', 'Salah Pesanan', 'Fasilitas');
CREATE TYPE pic_tiket AS ENUM ('Dapur', 'Lantai', 'Admin');
CREATE TYPE status_tiket AS ENUM ('Baru', 'Diproses', 'Selesai');
CREATE TYPE jenis_kampanye AS ENUM ('Kangen Nongkrong', 'Insentif Es Teh', 'Begadang Nugas');
```

## 2. Tabel Pengguna (Users / Staff)
**Catatan:** Supabase memiliki `auth.users`, tabel ini untuk melengkapi profil staf.

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'kasir',
    nama_lengkap VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

## 3. Tabel Pelanggan (Single Customer View)
Memenuhi FR: Pendaftaran, Validasi WA ganda, Segmen, Persetujuan Promo, dan Label.

```sql
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nama_panggilan VARCHAR(100) NOT NULL,
    nomor_wa VARCHAR(20) UNIQUE NOT NULL, -- UNIQUE mencegah nomor ganda (FR 2.2)
    segmen segmen_kampus DEFAULT 'Umum',
    setuju_promo BOOLEAN DEFAULT TRUE,
    label VARCHAR(50), -- Contoh isi: 'Member Malam', 'Pelanggan Pasif', 'Booking Meja'
    stempel_loyalitas INT DEFAULT 0 CHECK (stempel_loyalitas >= 0 AND stempel_loyalitas <= 5), -- Max 5 stempel
    terakhir_transaksi TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

## 4. Tabel Transaksi & Stempel
Memenuhi FR: Pencatatan waktu saji (KPI Jam Normal/Sibuk), Stempel, dan Peringatan > 20 menit.

```sql
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    menu_pesanan TEXT NOT NULL,
    jumlah_porsi INT NOT NULL,
    total_harga NUMERIC NOT NULL,
    waktu_pesan TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    waktu_saji TIMESTAMP WITH TIME ZONE, -- Diisi saat pesanan diantar (Untuk hitung KPI <15 menit)
    is_jam_sibuk BOOLEAN DEFAULT FALSE, -- Penanda apakah ini Rush Hour
    kompensasi_diberikan BOOLEAN DEFAULT FALSE, -- Jika waktu saji > 20 menit (Es Teh/Kerupuk)
    stempel_ditambahkan INT DEFAULT 1
);

-- Trigger Otomatis untuk mengupdate stempel & tanggal terakhir di tabel customers
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

CREATE TRIGGER trg_after_transaction
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_customer_after_transaction();
```

## 5. Tabel Tiket Keluhan (Service Automation)
Memenuhi FR: Ticketing flow, PIC, Status SLA, dan FCR (Selesai di tempat).

```sql
CREATE TABLE tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    kategori kategori_tiket NOT NULL,
    deskripsi_keluhan TEXT NOT NULL,
    pic pic_tiket NOT NULL,
    status status_tiket DEFAULT 'Baru',
    waktu_masuk TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    waktu_selesai TIMESTAMP WITH TIME ZONE, -- Diisi saat status diubah ke 'Selesai'
    diselesaikan_di_tempat BOOLEAN DEFAULT TRUE, -- Untuk hitung KPI FCR >= 90%
    pesan_konfirmasi_terkirim BOOLEAN DEFAULT FALSE -- Status apakah WA notifikasi "/tiketselesai" sudah dikirim
);
```

## 6. Tabel Riwayat Kampanye (Marketing Automation & Reaktivasi)
Memenuhi FR: Log broadcast 'Begadang Nugas', klik 'Kirim WA' /kangen, dan win-back.

```sql
CREATE TABLE campaign_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers (id) ON DELETE CASCADE,
    jenis_kampanye jenis_kampanye NOT NULL,
    waktu_kirim TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    berhasil_reaktivasi BOOLEAN DEFAULT FALSE -- Diubah True jika dalam 30 hari mereka datang (Untuk KPI Win-back)
);
```

## 7. Tabel Log Respon WhatsApp (Untuk KPI Dashboard Pemilik)
Memenuhi FR: Pengukuran rata-rata Response Time WA < 5 menit.

```sql
CREATE TABLE wa_response_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    waktu_pesan_masuk TIMESTAMP WITH TIME ZONE NOT NULL,
    waktu_dibalas_admin TIMESTAMP WITH TIME ZONE,
    selisih_menit NUMERIC GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (waktu_dibalas_admin - waktu_pesan_masuk)) / 60
    ) STORED
);
```