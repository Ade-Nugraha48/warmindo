# Functional Requirements (FR)

## 1. Alur Akses Sistem (Login & Role)
a. Admin/Kasir dan Pemilik dapat melakukan login ke dalam sistem CRM melalui halaman otentikasi awal.
b. Sistem dapat membatasi akses fitur, di mana Admin/Kasir hanya dapat mengakses halaman operasional (Pelanggan, Transaksi, Keluhan, Promo), sedangkan Pemilik dapat mengakses Dashboard KPI laporan keseluruhan.

## 2. Alur Pendaftaran & Manajemen Data Pelanggan (Single Customer View)
a. Pelanggan dapat terdaftar ke dalam database sistem setelah mereka berinteraksi melalui WhatsApp, Instagram, atau memesan langsung di kasir.
b. Admin/Kasir dapat menambahkan data pelanggan baru ke dalam sistem, meliputi Nama Panggilan, Nomor WhatsApp, Segmen Kampus (Mahasiswa UPN/Atma Jaya), dan persetujuan menerima promo.
c. Sistem dapat menolak secara otomatis (validasi) jika Admin/Kasir memasukkan nomor WhatsApp yang sudah pernah terdaftar sebelumnya agar data tidak ganda.
d. Admin/Kasir dapat mencari profil pelanggan dengan sangat cepat cukup dengan mengetik 4 digit terakhir nomor WhatsApp atau nama panggilan di kolom pencarian.
e. Admin/Kasir dapat memberikan label khusus pada profil pelanggan, seperti "Member Malam", "Pelanggan Pasif", atau "Booking Meja".

## 3. Alur Pemesanan & Kartu Stempel Loyalitas
a. Admin/Kasir dapat mencatat detail pesanan pelanggan ke dalam sistem, yang meliputi menu makanan/minuman, jumlah porsi, nominal harga, dan waktu pesanan.
b. Sistem dapat menambahkan +1 stempel loyalitas secara otomatis ke akun pelanggan setiap kali Admin/Kasir menyimpan transaksi tersebut.
c. Sistem dapat menampilkan penanda visual "Siap Klaim Bonus" di layar kasir ketika stempel pelanggan mencapai batas $5/5$.
d. Pelanggan dapat menukarkan stempel tersebut di kasir, dan Sistem dapat mereset kembali jumlah stempel menjadi $0/5$ setelah bonus diklaim.
e. Sistem dapat memunculkan pengingat otomatis di layar agar Admin/Kasir memberikan kompensasi (gratis kerupuk/es teh) jika waktu tunggu pesanan pelanggan melewati durasi 20 menit saat jam sibuk.

## 4. Alur Penanganan Keluhan (Ticketing & SLA)
a. Pelanggan dapat melaporkan keluhan (seperti waktu tunggu lama, salah pesanan, atau fasilitas kotor) melalui WhatsApp atau DM Instagram.
b. Admin/Kasir dapat membuat tiket keluhan baru di sistem dengan memasukkan ID Pelanggan, jenis keluhan, jam masuk, dan siapa penanggung jawabnya (PIC).
c. Admin/Kasir dapat memperbarui status tiket keluhan dari "Baru", menjadi "Diproses", dan terakhir "Selesai".
d. Sistem dapat memicu pengiriman pesan WhatsApp otomatis kepada pelanggan untuk mengonfirmasi bahwa masalah telah teratasi, sesaat setelah Admin/Kasir mengubah status tiket menjadi "Selesai".

## 5. Alur Marketing Automation & Reaktivasi Pelanggan
a. Sistem dapat memfilter dan menampilkan daftar "Pelanggan Pasif", yaitu pelanggan yang tidak datang bertransaksi selama lebih dari 14 hari.
b. Admin/Kasir dapat menekan tombol "Kirim WA" pada sistem untuk membuka tautan wa.me yang sudah terisi template sapaan (/kangen) atau penawaran es teh gratis (/insentif) untuk dikirimkan ke pelanggan pasif tersebut.
c. Sistem dapat menonaktifkan tombol "Kirim WA" secara otomatis jika profil pelanggan tersebut diatur sebagai "Tidak Setuju Promo", guna menjaga privasi data.
d. Admin/Kasir dapat mengirimkan pesan penawaran massal (broadcast) kampanye "Begadang Nugas" (diskon 10%) kepada pelanggan setiap hari Jumat pukul 22.00 WIB.

## 6. Alur Pemantauan Dashboard KPI (Khusus Pemilik)
a. Pemilik dapat membuka Dashboard di sistem untuk melihat ringkasan performa warung secara real-time tanpa perlu merekap data manual.
b. Pemilik dapat memantau KPI efisiensi waktu penyiapan pesanan, yang secara otomatis dipisahkan oleh sistem menjadi data "Jam Normal" dan "Jam Sibuk" (target <15 menit).
c. Pemilik dapat melihat persentase keberhasilan staf dalam menyelesaikan komplain salah pesanan secara langsung (First Call Resolution / FCR), dengan target di atas 90%.
d. Pemilik dapat melihat daftar 5 menu terlaris, grafik tren transaksi mingguan, serta total pelanggan pasif yang berhasil diaktifkan kembali (win-back) melalui promo WhatsApp.