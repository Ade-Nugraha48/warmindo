# Product Requirements Document (PRD)
**Project Name:** Sistem CRM Warmindo Sumber Rizki 2
**Version:** 1.0

## 1. Executive Summary
Warmindo Sumber Rizki 2 membutuhkan sistem CRM (Customer Relationship Management) berbasis web untuk mengelola interaksi dengan pelanggan, mempercepat operasional pemesanan, dan meningkatkan retensi pelanggan melalui *marketing automation* dan loyalitas (stempel).

## 2. Target Audience / Users
*   **Admin/Kasir:** Bertanggung jawab atas operasional sehari-hari (input transaksi, pendaftaran member, penanganan komplain, pengiriman broadcast promo).
*   **Pemilik (Owner):** Membutuhkan pengawasan *real-time* terhadap kinerja warung (Dashboard KPI) tanpa harus hadir secara fisik atau menghitung laporan manual.

## 3. Objectives & Goals
*   **Digitalisasi Data:** Beralih dari pencatatan manual ke *Single Customer View* agar tidak ada duplikasi data pelanggan.
*   **Meningkatkan Loyalitas:** Menerapkan sistem stempel digital (Beli 5 gratis bonus) untuk meningkatkan kunjungan ulang.
*   **Meningkatkan Pelayanan:** Melacak SLA *(Service Level Agreement)* waktu saji pesanan (<15 menit) dan penyelesaian keluhan (FCR > 90%).
*   **Automasi Marketing:** Memberikan fasilitas reaktivasi pelanggan yang sudah >14 hari tidak berkunjung dengan template WhatsApp langsung dari sistem.

## 4. Tech Stack & Infrastructure
*   **Framework:** Next.js (App Router) dengan TypeScript.
*   **Styling:** Tailwind CSS.
*   **UI Components:** shadcn/ui (Preset: Nova, Font: Geist, Icons: Lucide).
*   **Database & Auth (Disarankan):** Supabase (PostgreSQL).

## 5. Core Features (Scope)
1.  **Sistem Login & Role-Based Access Control (RBAC):** Akses berbeda antara Kasir (Operasional) dan Pemilik (Dashboard Analytics).
2.  **Manajemen Pelanggan (CRM):** Pencarian cepat dengan 4 digit nomor WA, labeling pelanggan, status persetujuan promo.
3.  **Point of Sales (POS) Sederhana & Stempel:** Input transaksi, peringatan *delay* waktu saji pesanan (>20 menit), dan auto-kalkulasi stempel loyalitas.
4.  **Sistem Tiket Keluhan (Helpdesk):** Kanban/Tabel pencatatan komplain (Dapur/Lantai/Admin) hingga status selesai.
5.  **Marketing Automation:** Filter pelanggan pasif (>14 hari) dan integrasi tombol WhatsApp wa.me untuk *follow up* cepat dan *broadcast*.
6.  **Dashboard Analytics (Pemilik):** Metrik efisiensi waktu, FCR komplain, tren penjualan, dan daftar menu terlaris.