# Page Specification

## 1. Halaman Login (`/login`)
*   **Memenuhi Fungsional**: Alur Akses Sistem & Hak Akses (Role).
*   **Role Pemakai**: Admin/Kasir dan Pemilik.
*   **Tujuan**: Menjadi gerbang keamanan sistem agar hanya staf dan pemilik yang bisa mengakses data pelanggan dan laporan bisnis.
*   **Isi Halaman & Elemen UI**:
    *   Form input Username dan Password.
    *   Tombol "Masuk".
    *   Routing logic: Jika yang login adalah Kasir, akan diarahkan ke halaman Data Pelanggan. Jika yang login adalah Pemilik, akan diarahkan langsung ke Dashboard.

## 2. Halaman Dashboard KPI (`/dashboard`)
*   **Memenuhi Fungsional**: Alur Pemantauan Dashboard KPI & Analisis Performa.
*   **Role Pemakai**: Khusus Pemilik (Owner).
*   **Tujuan**: Memberikan rangkuman performa warung secara real-time kepada pemilik tanpa harus menghitung nota atau membaca log chat satu per satu.
*   **Isi Halaman & Elemen UI**:
    *   Card KPI Efisiensi: Rata-rata waktu saji (dipisah Jam Normal & Jam Sibuk) dan Response Time WA (Target <5 menit).
    *   Card KPI Efektivitas: Persentase First Call Resolution (FCR) >= 90%.
    *   Grafik Visual: Grafik garis tren transaksi member per minggu.
    *   Tabel Ringkasan: Tabel 5 Menu Terlaris dan metrik keberhasilan klaim promo reaktivasi.

## 3. Halaman Data Pelanggan (`/pelanggan`)
*   **Memenuhi Fungsional**: Alur Pendaftaran & Manajemen Data Pelanggan (Single Customer View).
*   **Role Pemakai**: Admin/Kasir.
*   **Tujuan**: Menjadi pusat data pelanggan (pengganti buku catatan manual) agar kasir bisa mengenali pelanggan, melihat label mereka, dan menghindari pencatatan data ganda.
*   **Isi Halaman & Elemen UI**:
    *   Kolom Pencarian Cepat: Bar pencarian (*search bar*) yang bisa mencari profil lewat nama atau 4 digit terakhir nomor WhatsApp.
    *   Tombol Aksi: Tombol "+ Tambah Pelanggan" (membuka pop-up/modal form registrasi).
    *   Tabel Data: Menampilkan ID Pelanggan, Nama, Nomor WA (disamarkan, misal 62812****1234), Segmen (UPN/Atma Jaya), Status Setuju Promo, Label, dan Tanggal Kunjungan Terakhir.

## 4. Halaman Transaksi & Stempel Loyalitas (`/transaksi`)
*   **Memenuhi Fungsional**: Alur Pemesanan & Kartu Stempel Loyalitas.
*   **Role Pemakai**: Admin/Kasir.
*   **Tujuan**: Tempat kasir menginput pesanan harian, yang mana sistem akan otomatis menambah stempel pelanggan dan memberi peringatan jika waktu saji terlalu lama.
*   **Isi Halaman & Elemen UI**:
    *   Form Input Kasir: Input 4 digit WA pelanggan (otomatis memunculkan nama & sisa stempel), input menu pesanan, nominal harga, dan waktu.
    *   Indikator Visual Loyalitas: Teks atau badge warna-warni (misal: "Stempel $4/5$" atau "SIAP KLAIM BONUS").
    *   Notifikasi Peringatan (Alert): Kotak peringatan merah yang muncul otomatis berbunyi "Waktu tunggu >20 menit! Berikan kompensasi Es Teh/Kerupuk" jika durasi pesanan melewati batas.
    *   Tabel Riwayat Transaksi Hari Ini: Daftar transaksi yang baru saja diinput.

## 5. Halaman Keluhan & Saran (`/keluhan`)
*   **Memenuhi Fungsional**: Alur Penanganan Keluhan (Ticketing & SLA).
*   **Role Pemakai**: Admin/Kasir.
*   **Tujuan**: Mengubah komplain yang awalnya berantakan di WA atau IG menjadi daftar tugas (*to-do list*) terstruktur yang harus diselesaikan oleh tim warung.
*   **Isi Halaman & Elemen UI**:
    *   Papan Status Tiket (Kanban/Tabel): Tiga kolom utama untuk status tiket: "Baru", "Diproses", dan "Selesai".
    *   Form Tambah Tiket: Input untuk ID Pelanggan, Kategori (waktu saji/salah pesanan/fasilitas kotor), dan siapa PIC-nya (Dapur/Lantai).
    *   Tombol Aksi Otomasi: Dropdown untuk mengubah status. Jika dipilih "Selesai", ada konfirmasi pop-up "Kirim notifikasi selesai ke WA pelanggan?".

## 6. Halaman Promo Pasif & Reaktivasi (`/promo`)
*   **Memenuhi Fungsional**: Alur Marketing Automation & Reaktivasi Pelanggan Pasif.
*   **Role Pemakai**: Admin/Kasir.
*   **Tujuan**: Alat "serangan balik" marketing untuk menarik kembali pelanggan yang sudah lama tidak ke warung atau untuk mempromosikan diskon "Begadang Nugas".
*   **Isi Halaman & Elemen UI**:
    *   Filter Pelanggan Cerdas: Dropdown filter otomatis untuk menampilkan daftar orang yang "Tidak datang >14 hari".
    *   Tabel Target Promo: Menampilkan nama, lama tidak datang, dan indikator "Setuju Promo (Ya/Tidak)".
    *   Tombol "Kirim WA" (*Click-to-chat*): Tombol aksi di sebelah nama pelanggan. Jika Setuju Promo = Tidak, tombol ini berwarna abu-abu (mati). Jika ditekan, otomatis membuka WA API dengan template pesan `/kangen` atau `/insentif`.
    *   Tombol Broadcast "Begadang Nugas": Tombol khusus yang ditekan kasir tiap Jumat malam pukul 22.00 WIB untuk menembakkan info diskon ke pelanggan berlabel Member Malam.