"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema, type TransactionFormData } from "@/types/transaction.schema";
import { INITIAL_DEMO_CUSTOMERS, INITIAL_DEMO_TRANSACTIONS } from "@/lib/demo-data";
import type { Customer } from "@/types/database.types";
import type { TransactionRecord } from "@/types/transaction.record";

const DEMO_TRANSACTIONS = INITIAL_DEMO_TRANSACTIONS;

/**
 * Quick search customer by 4 digits or part of WhatsApp number
 */
export async function searchCustomerByWa(query: string): Promise<Customer[]> {
  if (!query || query.trim() === "") return [];
  const term = query.trim().toLowerCase();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .ilike("nomor_wa", `%${term}%`)
      .limit(5);

    if (!error && data && data.length > 0) {
      return data;
    }

    // Fallback search in demo customers
    return INITIAL_DEMO_CUSTOMERS.filter((c) =>
      c.nomor_wa.toLowerCase().includes(term) || c.nomor_wa.slice(-4).includes(term)
    );
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    return INITIAL_DEMO_CUSTOMERS.filter((c) =>
      c.nomor_wa.toLowerCase().includes(term) || c.nomor_wa.slice(-4).includes(term)
    );
  }
}

/**
 * Get all today's transactions
 */
export async function getTodayTransactions(): Promise<TransactionRecord[]> {
  await connection();
  try {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        customers (
          id,
          nama_panggilan,
          nomor_wa,
          stempel_loyalitas
        )
      `)
      .gte("waktu_pesan", today.toISOString())
      .order("waktu_pesan", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((t) => {
        const cust = t.customers as unknown as {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
          stempel_loyalitas: number;
        } | null;

        return {
          id: t.id,
          customer_id: t.customer_id,
          customer_nama: cust?.nama_panggilan || "Pelanggan Walk-in",
          customer_wa: cust?.nomor_wa || "-",
          menu_pesanan: t.menu_pesanan,
          jumlah_porsi: t.jumlah_porsi,
          total_harga: Number(t.total_harga),
          waktu_pesan: t.waktu_pesan || new Date().toISOString(),
          waktu_saji: t.waktu_saji,
          is_jam_sibuk: Boolean(t.is_jam_sibuk),
          kompensasi_diberikan: Boolean(t.kompensasi_diberikan),
          stempel_ditambahkan: t.stempel_ditambahkan ?? 1,
          stempel_saat_ini: cust?.stempel_loyalitas ?? 1,
        };
      });
    }

    return DEMO_TRANSACTIONS;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    return DEMO_TRANSACTIONS;
  }
}

/**
 * Create transaction and update loyalty stamps (FR 3.a - FR 3.d)
 */
export async function createTransaction(
  formData: TransactionFormData
): Promise<{ success: boolean; data?: TransactionRecord; error?: string }> {
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data transaksi tidak valid",
    };
  }

  const { customer_id, menu_pesanan, jumlah_porsi, total_harga, is_jam_sibuk, claim_reward } =
    parsed.data;

  try {
    const supabase = await createClient();

    // 1. Fetch current customer
    const { data: customer } = await supabase
      .from("customers")
      .select("id, nama_panggilan, nomor_wa, stempel_loyalitas, terakhir_transaksi")
      .eq("id", customer_id)
      .single();

    const targetCustomer =
      customer ||
      INITIAL_DEMO_CUSTOMERS.find((c) => c.id === customer_id);

    const prevStamps = targetCustomer?.stempel_loyalitas ?? 0;
    // Calculate new stamps:
    // If user claims reward at 5 stamps, reset to 0 (FR 3.d)
    // Otherwise add +1 stamp (max 5 before reset)
    let newStamps = prevStamps;
    if (claim_reward) {
      newStamps = 0;
    } else {
      newStamps = prevStamps >= 5 ? 1 : prevStamps + 1;
    }

    const orderTime = new Date().toISOString();

    // 2. Insert into Supabase transactions
    const { data: inserted } = await supabase
      .from("transactions")
      .insert({
        customer_id,
        menu_pesanan,
        jumlah_porsi,
        total_harga,
        waktu_pesan: orderTime,
        waktu_saji: null,
        is_jam_sibuk,
        kompensasi_diberikan: false,
        stempel_ditambahkan: claim_reward ? 0 : 1,
      })
      .select()
      .single();

    // 3. Update customer stamp & last transaction time
    await supabase
      .from("customers")
      .update({
        stempel_loyalitas: newStamps,
        terakhir_transaksi: orderTime,
      })
      .eq("id", customer_id);

    const record: TransactionRecord = {
      id: inserted ? inserted.id : `TRX-${Date.now().toString().slice(-4)}`,
      customer_id,
      customer_nama: targetCustomer?.nama_panggilan || "Pelanggan",
      customer_wa: targetCustomer?.nomor_wa || "-",
      menu_pesanan,
      jumlah_porsi,
      total_harga,
      waktu_pesan: orderTime,
      waktu_saji: null,
      is_jam_sibuk,
      kompensasi_diberikan: false,
      stempel_ditambahkan: claim_reward ? 0 : 1,
      stempel_saat_ini: newStamps,
    };

    // Also update demo customer in-memory
    if (targetCustomer) {
      targetCustomer.stempel_loyalitas = newStamps;
      targetCustomer.terakhir_transaksi = orderTime;
    }
    DEMO_TRANSACTIONS.unshift(record);

    revalidatePath("/transaksi");
    revalidatePath("/pelanggan");

    return { success: true, data: record };
  } catch (err) {
    console.error("Error creating transaction:", err);
    return { success: false, error: "Gagal menyimpan transaksi kasir." };
  }
}

/**
 * Mark order as served and record serving timestamp
 */
export async function markOrderServed(
  transactionId: string
): Promise<{ success: boolean; waktu_saji: string }> {
  const servedTime = new Date().toISOString();

  try {
    const supabase = await createClient();
    await supabase
      .from("transactions")
      .update({ waktu_saji: servedTime })
      .eq("id", transactionId);

    // Update in demo list
    const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
    if (found) {
      found.waktu_saji = servedTime;
    }

    revalidatePath("/transaksi");
    return { success: true, waktu_saji: servedTime };
  } catch {
    const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
    if (found) {
      found.waktu_saji = servedTime;
    }
    revalidatePath("/transaksi");
    return { success: true, waktu_saji: servedTime };
  }
}

/**
 * Mark that compensation (gratis teh / kerupuk) has been granted to customer
 */
export async function grantCompensation(
  transactionId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase
      .from("transactions")
      .update({ kompensasi_diberikan: true })
      .eq("id", transactionId);

    const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
    if (found) {
      found.kompensasi_diberikan = true;
    }

    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
    if (found) {
      found.kompensasi_diberikan = true;
    }
    revalidatePath("/transaksi");
    return { success: true };
  }
}
