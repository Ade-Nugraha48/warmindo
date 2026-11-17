# Project Rules & "Vibe Coding" Standards
*Dokumen ini berisi standar pengembangan dan kesepakatan coding untuk project Website Warmindo.*

## 1. Tech Stack & Environment
- **Framework:** Next.js 14/15 (App Router).
- **Language:** TypeScript (Strict mode dianjurkan).
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui.
  - *Preset:* Nova
  - *Font:* Geist
  - *Icons:* Lucide React
  - *Base Color:* Zinc / Slate
- **Formatting:** Prettier + `prettier-plugin-tailwindcss` (Wajib agar class Tailwind otomatis tersusun rapi).

## 2. Struktur Folder
Ikuti standar App Router berikut untuk menjaga kode agar tidak *spaghetti*:
- `/src/app`: Khusus untuk routing, halaman (`page.tsx`), dan layout (`layout.tsx`).
- `/src/components/ui`: Khusus untuk komponen bawaan dari shadcn/ui (jangan diubah kecuali untuk styling minor).
- `/src/components/shared`: Komponen yang dipakai berulang di berbagai halaman (seperti Navbar, Footer, Sidebar).
- `/src/components/features`: Komponen spesifik untuk fitur tertentu (contoh: `TransactionForm.tsx`, `TicketKanban.tsx`).
- `/src/lib`: Untuk fungsi utilitas (contoh: *formatter* uang Rupiah, *formatter* tanggal, koneksi Supabase).
- `/src/types`: Untuk deklarasi *interface* / tipe data TypeScript.

## 3. Konvensi Penamaan (Naming Conventions)
- **Komponen (Files & Functions):** Gunakan `PascalCase` (contoh: `CustomerTable.tsx`, `AddTicketModal.tsx`).
- **Fungsi / Variabel (Hooks, Utils):** Gunakan `camelCase` (contoh: `formatRupiah`, `useCustomerData`).
- **Tipe Data / Interface:** Gunakan `PascalCase` (contoh: `CustomerProfile`, `TransactionRecord`).

## 4. Aturan Styling (Tailwind + shadcn)
- Jangan menulis CSS kustom jika masih bisa di-handle oleh Tailwind.
- Manfaatkan *CSS Variables* dari shadcn (contoh: `bg-primary`, `text-muted-foreground`) agar mempermudah implementasi *Dark Mode* jika dibutuhkan di masa depan.
- Gunakan `cn()` utility dari shadcn/lib saat perlu menggabungkan *class* secara dinamis.

## 5. Database & Fetching
- Interaksi database (Supabase) disarankan dipanggil di Server Components (`page.tsx` tanpa `"use client"`) sejauh memungkinkan agar lebih aman dan cepat.
- Jika form butuh interaktivitas, pisahkan form tersebut menjadi Client Component (`"use client"` di baris paling atas).