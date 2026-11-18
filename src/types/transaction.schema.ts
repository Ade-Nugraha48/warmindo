import { z } from "zod";

export const transactionSchema = z.object({
  customer_id: z.string().min(1, "Pelanggan harus dipilih (masukkan 4 digit WA)"),
  menu_pesanan: z.string().min(3, "Menu pesanan minimal 3 karakter"),
  jumlah_porsi: z.number().min(1, "Jumlah porsi minimal 1"),
  total_harga: z.number().min(1000, "Total harga minimal Rp 1.000"),
  is_jam_sibuk: z.boolean(),
  claim_reward: z.boolean(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
