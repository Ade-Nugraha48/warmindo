import { z } from "zod";

export const customerSchema = z.object({
  nama_panggilan: z
    .string()
    .min(2, "Nama panggilan minimal 2 karakter")
    .max(50, "Nama panggilan maksimal 50 karakter"),
  nomor_wa: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(18, "Nomor WhatsApp maksimal 18 digit")
    .regex(
      /^(\+62|62|08)[0-9]{8,14}$/,
      "Format WhatsApp tidak valid (Gunakan format 08123456789 atau 628123456789)"
    ),
  segmen: z.enum(
    ["Mahasiswa UPN", "Mahasiswa YKPN", "Mahasiswa Atma Jaya", "Umum"],
    {
      error: "Pilih salah satu segmen pelanggan",
    }
  ),
  setuju_promo: z.boolean(),
  label: z.string().max(50, "Label maksimal 50 karakter").optional(),
  preferensi_racikan: z.string().max(250).optional(),
  meja_favorit: z.string().max(60).optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
