"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { MAX_LOYALTY_STAMPS } from "@/lib/constants";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/types/transaction.schema";
import {
  INITIAL_DEMO_CUSTOMERS,
  INITIAL_DEMO_MENU_ITEMS,
  INITIAL_DEMO_TRANSACTIONS,
} from "@/lib/demo-data";
import type { Customer, Json } from "@/types/database.types";
import type {
  OrderItemLine,
  TransactionRecord,
} from "@/types/transaction.record";
import type { MenuCatalogItem } from "@/types/pos.record";

const DEMO_TRANSACTIONS = INITIAL_DEMO_TRANSACTIONS;

/**
 * Fetch POS menu catalog from Supabase menu_items or fallback to demo catalog
 */
export async function getMenuCatalog(): Promise<MenuCatalogItem[]> {
  await connection();
  await requireSession();
  const catalogByCode = new Map<string, MenuCatalogItem>(
    INITIAL_DEMO_MENU_ITEMS.map((item) => [item.kode_menu, item])
  );

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("kode_menu", { ascending: true })
      .limit(200);

    if (!error && data && data.length > 0) {
      for (const item of data) {
        if (!item.is_available) {
          catalogByCode.delete(item.kode_menu);
          continue;
        }
        const existing = catalogByCode.get(item.kode_menu);
        catalogByCode.set(item.kode_menu, {
          id: item.id,
          kode_menu: item.kode_menu,
          nama: item.nama,
          kategori:
            (item.kategori as MenuCatalogItem["kategori"]) ||
            existing?.kategori ||
            "indomie",
          deskripsi: item.deskripsi,
          harga: Number(item.harga),
          estimasi_menit: item.estimasi_menit || "8-10 mnt",
          stasiun_default: item.stasiun_default || "Kompor 1",
          badge_tag: item.badge_tag,
          gambar_url:
            item.gambar_url ||
            existing?.gambar_url ||
            "/images/menu/indomie-goreng.jpg",
          default_note: existing?.default_note || "Pedas normal",
          is_available: true,
        });
      }
    }

    return Array.from(catalogByCode.values());
  } catch {
    return Array.from(catalogByCode.values());
  }
}

/**
 * Quick search customer by 4 digits or part of WhatsApp number or name
 */
export async function searchCustomerByWa(query: string): Promise<Customer[]> {
  await requireSession();
  if (!query || query.trim() === "") return [];
  const term = query.trim().toLowerCase();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`nomor_wa.ilike.%${term}%,nama_panggilan.ilike.%${term}%`)
      .limit(6);

    if (!error && data && data.length > 0) {
      return data;
    }

    return INITIAL_DEMO_CUSTOMERS.filter(
      (c) =>
        c.nomor_wa.toLowerCase().includes(term) ||
        c.nomor_wa.slice(-4).includes(term) ||
        c.nama_panggilan.toLowerCase().includes(term)
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
    return INITIAL_DEMO_CUSTOMERS.filter(
      (c) =>
        c.nomor_wa.toLowerCase().includes(term) ||
        c.nomor_wa.slice(-4).includes(term) ||
        c.nama_panggilan.toLowerCase().includes(term)
    );
  }
}

/**
 * Get all today's transactions (shared by POS & KDS Antrean Dapur)
 */
export async function getTodayTransactions(): Promise<TransactionRecord[]> {
  await connection();
  await requireSession();
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
          segmen,
          stempel_loyalitas
        )
      `)
      .gte("waktu_pesan", today.toISOString())
      .order("waktu_pesan", { ascending: false })
      .limit(150);

    if (!error && data && data.length > 0) {
      return data.map((t) => {
        const cust = t.customers as unknown as {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
          segmen: string | null;
          stempel_loyalitas: number;
        } | null;

        const parsedItems = Array.isArray(t.order_items_json)
          ? (t.order_items_json as unknown as OrderItemLine[])
          : undefined;

        const rawNotes = t.catatan_pesanan || "";
        const guestMatch = !cust
          ? rawNotes.match(/^\[Tamu:\s*([^\]]+)\]\s*(.*)$/)
          : null;
        const resolvedGuestName = guestMatch?.[1]?.trim();
        const cleanedNotes = guestMatch
          ? guestMatch[2]?.trim() || undefined
          : t.catatan_pesanan || undefined;

        return {
          id: t.id,
          kode_order: t.kode_order || `#WDS-${t.id.slice(0, 4).toUpperCase()}`,
          customer_id: t.customer_id,
          customer_nama:
            cust?.nama_panggilan || resolvedGuestName || "Tamu Umum",
          customer_wa: cust?.nomor_wa || "-",
          customer_segmen: cust?.segmen || "Umum",
          menu_pesanan: t.menu_pesanan,
          jumlah_porsi: t.jumlah_porsi,
          total_harga: Number(t.total_harga),
          waktu_pesan: t.waktu_pesan || new Date().toISOString(),
          waktu_saji: t.waktu_saji,
          is_jam_sibuk: Boolean(t.is_jam_sibuk),
          kompensasi_diberikan: Boolean(t.kompensasi_diberikan),
          stempel_ditambahkan:
            t.stempel_ditambahkan ?? (t.customer_id ? 1 : 0),
          stempel_saat_ini: cust?.stempel_loyalitas ?? 0,
          nomor_meja: t.nomor_meja || "Meja 01",
          tipe_pesanan:
            (t.tipe_pesanan as TransactionRecord["tipe_pesanan"]) || "Dine-in",
          status_dapur:
            (t.status_dapur as TransactionRecord["status_dapur"]) ||
            (t.waktu_saji ? "Selesai" : "Dimasak"),
          stasiun_dapur: t.stasiun_dapur || "Kompor 1",
          koki_pic: t.koki_pic || "Kang Asep",
          catatan_pesanan: cleanedNotes,
          metode_bayar:
            (t.metode_bayar as TransactionRecord["metode_bayar"]) || "Tunai",
          diskon_nominal: Number(t.diskon_nominal || 0),
          order_items: parsedItems,
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
 * Create transaction, push to KDS queue, and update loyalty stamps
 */
export async function createTransaction(
  formData: TransactionFormData & { order_items?: OrderItemLine[] }
): Promise<{ success: boolean; data?: TransactionRecord; error?: string }> {
  await requireSession();
  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data transaksi tidak valid",
    };
  }

  const {
    customer_id,
    is_walkin = false,
    guest_nama,
    menu_pesanan,
    jumlah_porsi,
    total_harga,
    is_jam_sibuk,
    claim_reward,
    nomor_meja = "Meja 01",
    tipe_pesanan = "Dine-in",
    metode_bayar = "Tunai",
    diskon_nominal = 0,
    catatan_pesanan,
  } = parsed.data;

  try {
    const supabase = await createClient();

    const resolvedCustomerId =
      !is_walkin && customer_id && customer_id.trim().length > 0
        ? customer_id.trim()
        : null;
    const trimmedGuest = guest_nama?.trim() || "";

    let targetCustomer:
      | {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
          segmen: string | null;
          stempel_loyalitas: number | null;
          terakhir_transaksi?: string | null;
        }
      | undefined;

    if (resolvedCustomerId) {
      const { data: customer } = await supabase
        .from("customers")
        .select(
          "id, nama_panggilan, nomor_wa, segmen, stempel_loyalitas, terakhir_transaksi"
        )
        .eq("id", resolvedCustomerId)
        .single();

      targetCustomer =
        customer ||
        INITIAL_DEMO_CUSTOMERS.find((c) => c.id === resolvedCustomerId);
    }

    const canEarnStamp = Boolean(resolvedCustomerId);
    const shouldClaimReward = canEarnStamp && claim_reward;
    const stampsDelta = canEarnStamp ? (shouldClaimReward ? 0 : 1) : 0;

    const prevStamps = targetCustomer?.stempel_loyalitas ?? 0;
    let newStamps = 0;
    if (canEarnStamp) {
      newStamps = shouldClaimReward
        ? 0
        : prevStamps >= MAX_LOYALTY_STAMPS
        ? 1
        : prevStamps + 1;
    }

    const orderTime = new Date().toISOString();
    const kodeOrder = `#WDS-${Math.floor(410 + (Date.now() % 580))}`;
    const persistedNotes = !resolvedCustomerId && trimmedGuest
      ? `[Tamu: ${trimmedGuest}] ${catatan_pesanan || ""}`.trim()
      : catatan_pesanan || null;

    const orderItems = formData.order_items || [
      {
        id: `oi-${Date.now()}`,
        nama: menu_pesanan,
        qty: jumlah_porsi,
        harga: total_harga,
        catatan: catatan_pesanan,
        stasiun: "Kompor 1",
        selesai: false,
      },
    ];

    // Try v2 insert first, fallback to v1 columns if v2 schema hasn't been applied
    let insertedId: string | null = null;
    const { data: v2Inserted, error: v2Err } = await supabase
      .from("transactions")
      .insert({
        customer_id: resolvedCustomerId,
        menu_pesanan,
        jumlah_porsi,
        total_harga,
        waktu_pesan: orderTime,
        waktu_saji: null,
        is_jam_sibuk,
        kompensasi_diberikan: false,
        stempel_ditambahkan: stampsDelta,
        kode_order: kodeOrder,
        nomor_meja,
        tipe_pesanan,
        status_dapur: "Antre",
        stasiun_dapur: "Kompor 1",
        koki_pic: "Belum Ditugaskan",
        catatan_pesanan: persistedNotes,
        metode_bayar,
        diskon_nominal,
        order_items_json: orderItems as unknown as Json,
      })
      .select("id")
      .single();

    if (!v2Err && v2Inserted) {
      insertedId = v2Inserted.id;
    } else {
      const { data: v1Inserted } = await supabase
        .from("transactions")
        .insert({
          customer_id: resolvedCustomerId,
          menu_pesanan,
          jumlah_porsi,
          total_harga,
          waktu_pesan: orderTime,
          waktu_saji: null,
          is_jam_sibuk,
          kompensasi_diberikan: false,
          stempel_ditambahkan: stampsDelta,
        })
        .select("id")
        .single();
      insertedId = v1Inserted?.id || null;
    }

    // Update customer stamp & last transaction time for registered members only
    let effectiveStamps = newStamps;
    if (resolvedCustomerId) {
      const { error: custUpdateErr } = await supabase
        .from("customers")
        .update({
          stempel_loyalitas: newStamps,
          terakhir_transaksi: orderTime,
        })
        .eq("id", resolvedCustomerId);

      if (custUpdateErr) {
        effectiveStamps = shouldClaimReward
          ? 0
          : prevStamps >= 5
          ? 0
          : prevStamps + 1;
        await supabase
          .from("customers")
          .update({
            stempel_loyalitas: effectiveStamps,
            terakhir_transaksi: orderTime,
          })
          .eq("id", resolvedCustomerId);
      }

      if (targetCustomer) {
        targetCustomer.stempel_loyalitas = effectiveStamps;
        targetCustomer.terakhir_transaksi = orderTime;
      }
    }

    const record: TransactionRecord = {
      id: insertedId || `TRX-${Date.now().toString().slice(-4)}`,
      kode_order: kodeOrder,
      customer_id: resolvedCustomerId,
      customer_nama: resolvedCustomerId
        ? targetCustomer?.nama_panggilan || "Member CRM"
        : trimmedGuest || "Tamu Umum",
      customer_wa: resolvedCustomerId ? targetCustomer?.nomor_wa || "-" : "-",
      customer_segmen: resolvedCustomerId
        ? targetCustomer?.segmen || "Umum"
        : "Umum",
      menu_pesanan,
      jumlah_porsi,
      total_harga,
      waktu_pesan: orderTime,
      waktu_saji: null,
      is_jam_sibuk,
      kompensasi_diberikan: false,
      stempel_ditambahkan: stampsDelta,
      stempel_saat_ini: effectiveStamps,
      nomor_meja,
      tipe_pesanan,
      status_dapur: "Antre",
      stasiun_dapur: "Kompor 1",
      koki_pic: "Belum Ditugaskan",
      catatan_pesanan,
      metode_bayar,
      diskon_nominal,
      order_items: orderItems,
    };
    DEMO_TRANSACTIONS.unshift(record);

    revalidatePath("/transaksi");
    revalidatePath("/antrean-dapur");
    revalidatePath("/pelanggan");
    revalidatePath("/dashboard");

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
  await requireSession();
  const servedTime = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ waktu_saji: servedTime, status_dapur: "Selesai" })
      .eq("id", transactionId);

    if (error) {
      await supabase
        .from("transactions")
        .update({ waktu_saji: servedTime })
        .eq("id", transactionId);
    }
  } catch {
    // Graceful demo fallback
  }

  const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
  if (found) {
    found.waktu_saji = servedTime;
    found.status_dapur = "Selesai";
  }

  revalidatePath("/transaksi");
  revalidatePath("/antrean-dapur");
  revalidatePath("/dashboard");
  return { success: true, waktu_saji: servedTime };
}

/**
 * Assign kitchen chef & start cooking on KDS
 */
export async function assignKitchenChef(
  transactionId: string,
  chefName: string
): Promise<{ success: boolean; persistedInDb: boolean }> {
  await requireSession();
  let persistedInDb = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ status_dapur: "Dimasak", koki_pic: chefName })
      .eq("id", transactionId);
    if (!error) persistedInDb = true;
  } catch {
    // Graceful demo / v1 schema fallback
  }

  const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
  if (found) {
    found.status_dapur = "Dimasak";
    found.koki_pic = chefName;
  }

  revalidatePath("/antrean-dapur");
  return { success: true, persistedInDb };
}

/**
 * Mark that compensation (gratis Es Teh Jumbo / kerupuk) has been granted
 */
export async function grantCompensation(
  transactionId: string
): Promise<{ success: boolean }> {
  await requireSession();
  try {
    const supabase = await createClient();
    await supabase
      .from("transactions")
      .update({ kompensasi_diberikan: true })
      .eq("id", transactionId);
  } catch {
    // Graceful demo fallback
  }

  const found = DEMO_TRANSACTIONS.find((t) => t.id === transactionId);
  if (found) {
    found.kompensasi_diberikan = true;
  }

  revalidatePath("/transaksi");
  revalidatePath("/antrean-dapur");
  return { success: true };
}
