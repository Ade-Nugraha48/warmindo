import { z } from "zod";

export const transactionSchema = z
  .object({
    customer_id: z.string().nullable().optional(),
    is_walkin: z.boolean().optional(),
    guest_nama: z.string().max(60).optional(),
    menu_pesanan: z.string().min(3, "Menu pesanan minimal 3 karakter"),
    jumlah_porsi: z.number().min(1, "Jumlah porsi minimal 1"),
    total_harga: z.number().min(1000, "Total harga minimal Rp 1.000"),
    is_jam_sibuk: z.boolean(),
    claim_reward: z.boolean(),
    nomor_meja: z.string().max(20).optional(),
    tipe_pesanan: z.enum(["Dine-in", "Takeaway WA", "Booking"]).optional(),
    metode_bayar: z.enum(["Tunai", "QRIS"]).optional(),
    diskon_nominal: z.number().min(0).optional(),
    catatan_pesanan: z.string().max(300).optional(),
  })
  .refine(
    (data) =>
      Boolean(data.is_walkin) ||
      Boolean(data.customer_id && data.customer_id.trim().length > 0),
    {
      message: "Pilih pelanggan CRM atau gunakan mode Tamu Umum.",
      path: ["customer_id"],
    }
  );

export type TransactionFormData = z.infer<typeof transactionSchema>;
