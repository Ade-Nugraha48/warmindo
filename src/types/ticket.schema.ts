import { z } from "zod";

export const ticketSchema = z.object({
  customer_id: z.string().min(1, "Pelanggan harus dipilih"),
  kategori: z.enum(["Waktu Tunggu", "Salah Pesanan", "Fasilitas"], {
    error: "Pilih salah satu kategori keluhan",
  }),
  deskripsi_keluhan: z
    .string()
    .min(5, "Deskripsi keluhan minimal 5 karakter")
    .max(500, "Deskripsi keluhan maksimal 500 karakter"),
  pic: z.enum(["Dapur", "Lantai", "Admin"], {
    error: "Pilih PIC penanggung jawab",
  }),
  diselesaikan_di_tempat: z.boolean(),
  nomor_meja: z.string().max(20).optional(),
  kompensasi_item: z.string().max(120).optional(),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
