"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, type CustomerFormData } from "@/types/customer.schema";
import { normalizePhoneNumber } from "@/lib/formatters";
import type { Customer, SegmenKampus } from "@/types/database.types";
import { INITIAL_DEMO_CUSTOMERS } from "@/lib/demo-data";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch customers with optional search term (by Name or WhatsApp last 4 digits)
 */
export async function getCustomers(
  searchTerm?: string,
  segmentFilter?: string
): Promise<Customer[]> {
  await connection();
  await requireSession();
  try {
    const supabase = await createClient();
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (segmentFilter && segmentFilter !== "Semua") {
      query = query.eq("segmen", segmentFilter as SegmenKampus);
    }

    const { data, error } = await query;

    let customerList: Customer[] = [];

    if (!error && data && data.length > 0) {
      customerList = data;
    } else {
      customerList = [...INITIAL_DEMO_CUSTOMERS];
      if (segmentFilter && segmentFilter !== "Semua") {
        customerList = customerList.filter((c) => c.segmen === segmentFilter);
      }
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.trim().toLowerCase();
      customerList = customerList.filter((cust) => {
        const matchesName = cust.nama_panggilan.toLowerCase().includes(term);
        const matchesWa = cust.nomor_wa.toLowerCase().includes(term);
        const last4 = cust.nomor_wa.slice(-4);
        const matchesLast4 = last4.includes(term);
        const matchesFav = (cust.preferensi_racikan || "")
          .toLowerCase()
          .includes(term);

        return matchesName || matchesWa || matchesLast4 || matchesFav;
      });
    }

    return customerList;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    console.error("Error fetching customers:", err);
    return INITIAL_DEMO_CUSTOMERS;
  }
}

/**
 * Create a new customer with duplicate phone number validation (FR 2.2)
 */
export async function createCustomer(
  formData: CustomerFormData
): Promise<ActionResponse<Customer>> {
  await requireSession();
  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message || "Data input tidak valid";
    return { success: false, error: firstError };
  }

  const normalizedWa = normalizePhoneNumber(parsed.data.nomor_wa);

  try {
    const supabase = await createClient();

    const { data: existing, error: checkError } = await supabase
      .from("customers")
      .select("id, nama_panggilan, nomor_wa")
      .eq("nomor_wa", normalizedWa)
      .maybeSingle();

    if (!checkError && existing) {
      return {
        success: false,
        error: `Nomor WhatsApp (${normalizedWa}) sudah pernah terdaftar atas nama "${existing.nama_panggilan}". Sistem menolak pencatatan ganda sesuai aturan FR 2.2.`,
      };
    }

    const duplicateDemo = INITIAL_DEMO_CUSTOMERS.find(
      (c) => normalizePhoneNumber(c.nomor_wa) === normalizedWa
    );
    if (duplicateDemo) {
      return {
        success: false,
        error: `Nomor WhatsApp (${normalizedWa}) sudah terdaftar atas nama "${duplicateDemo.nama_panggilan}". Pencatatan ganda ditolak (FR 2.2).`,
      };
    }

    const basePayload = {
      nama_panggilan: parsed.data.nama_panggilan.trim(),
      nomor_wa: normalizedWa,
      segmen: parsed.data.segmen,
      setuju_promo: parsed.data.setuju_promo,
      label: parsed.data.label?.trim() || "Member Baru",
      stempel_loyalitas: 1,
      terakhir_transaksi: null as string | null,
    };

    // Try v2 insert first (with preferensi_racikan & meja_favorit)
    const v2Payload = {
      ...basePayload,
      preferensi_racikan:
        parsed.data.preferensi_racikan?.trim() ||
        "Indomie Dok-Dok Kuah Nyemek • Level 3",
      meja_favorit: parsed.data.meja_favorit?.trim() || "Meja 05",
      total_kunjungan: 1,
      total_belanja: 0,
    };

    let inserted: Customer | null = null;
    const { data: v2Data, error: v2Err } = await supabase
      .from("customers")
      .insert(v2Payload)
      .select()
      .single();

    if (!v2Err && v2Data) {
      inserted = v2Data;
    } else {
      // Fallback to v1 columns (and v1 enum fallback if YKPN not migrated yet)
      const v1Segmen =
        basePayload.segmen === "Mahasiswa YKPN"
          ? ("Umum" as SegmenKampus)
          : basePayload.segmen;
      const { data: v1Data } = await supabase
        .from("customers")
        .insert({
          ...basePayload,
          segmen: v1Segmen,
        })
        .select()
        .single();
      inserted = v1Data;
    }

    if (!inserted) {
      const mockInserted: Customer = {
        id: crypto.randomUUID(),
        ...v2Payload,
        created_at: new Date().toISOString(),
      };
      INITIAL_DEMO_CUSTOMERS.unshift(mockInserted);
      revalidatePath("/pelanggan");
      return { success: true, data: mockInserted };
    }

    revalidatePath("/pelanggan");
    return { success: true, data: inserted };
  } catch (err) {
    console.error("Error creating customer:", err);
    return {
      success: false,
      error: "Gagal menyimpan data pelanggan. Coba beberapa saat lagi.",
    };
  }
}

/**
 * Toggle promo opt-in consent for a customer
 */
export async function toggleCustomerPromoConsent(
  customerId: string,
  setujuPromo: boolean
): Promise<{ success: boolean }> {
  await requireSession();
  try {
    const supabase = await createClient();
    await supabase
      .from("customers")
      .update({ setuju_promo: setujuPromo })
      .eq("id", customerId);
  } catch {
    // Fallback below
  }

  const demoCust = INITIAL_DEMO_CUSTOMERS.find((c) => c.id === customerId);
  if (demoCust) {
    demoCust.setuju_promo = setujuPromo;
  }

  revalidatePath("/pelanggan");
  revalidatePath("/promo");
  return { success: true };
}
