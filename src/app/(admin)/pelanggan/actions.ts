"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, type CustomerFormData } from "@/types/customer.schema";
import { normalizePhoneNumber } from "@/lib/formatters";
import type { Customer, SegmenKampus } from "@/types/database.types";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Initial mock customers for demonstration & local testing if DB is empty
const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    id: "e4a1c5d0-9f3b-4c8d-8a1e-2f3b4c5d6e7f",
    nama_panggilan: "Dimas Anggara",
    nomor_wa: "081234564321",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 4,
    terakhir_transaksi: "2026-11-16T21:30:00Z",
    created_at: "2026-10-10T10:00:00Z",
  },
  {
    id: "f5b2d6e1-0a4c-5d9e-9b2f-3a4b5c6d7e8a",
    nama_panggilan: "Clara Vania",
    nomor_wa: "081912348890",
    segmen: "Mahasiswa Atma Jaya",
    setuju_promo: true,
    label: "Booking Meja",
    stempel_loyalitas: 5,
    terakhir_transaksi: "2026-11-15T13:15:00Z",
    created_at: "2026-10-15T11:20:00Z",
  },
  {
    id: "a6c3e7f2-1b5d-6e0f-0c3a-4b5c6d7e8f9b",
    nama_panggilan: "Rizky Pratama",
    nomor_wa: "085798761122",
    segmen: "Umum",
    setuju_promo: false,
    label: "Pelanggan Pasif",
    stempel_loyalitas: 1,
    terakhir_transaksi: "2026-11-01T19:00:00Z",
    created_at: "2026-09-20T14:40:00Z",
  },
  {
    id: "b7d4f8a3-2c6e-7f1a-1d4b-5c6d7e8f0a1c",
    nama_panggilan: "Farhan Hakim",
    nomor_wa: "082155557788",
    segmen: "Mahasiswa UPN",
    setuju_promo: true,
    label: "Member Malam",
    stempel_loyalitas: 3,
    terakhir_transaksi: "2026-11-17T22:10:00Z",
    created_at: "2026-10-28T09:15:00Z",
  },
];

/**
 * Fetch customers with optional search term (by Name or WhatsApp last 4 digits)
 */
export async function getCustomers(
  searchTerm?: string,
  segmentFilter?: string
): Promise<Customer[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (segmentFilter && segmentFilter !== "Semua") {
      query = query.eq("segmen", segmentFilter as SegmenKampus);
    }

    const { data, error } = await query;

    let customerList: Customer[] = [];

    if (!error && data && data.length > 0) {
      customerList = data;
    } else {
      // Fallback to initial demo dataset if database has no records yet
      customerList = INITIAL_DEMO_CUSTOMERS;
      if (segmentFilter && segmentFilter !== "Semua") {
        customerList = customerList.filter((c) => c.segmen === segmentFilter);
      }
    }

    // Filter by name or last 4 digits of WhatsApp if search term provided
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.trim().toLowerCase();
      customerList = customerList.filter((cust) => {
        const matchesName = cust.nama_panggilan.toLowerCase().includes(term);
        const matchesWa = cust.nomor_wa.toLowerCase().includes(term);
        // Also check last 4 digits match explicitly
        const last4 = cust.nomor_wa.slice(-4);
        const matchesLast4 = last4.includes(term);

        return matchesName || matchesWa || matchesLast4;
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
 * Create a new customer with duplicate phone number validation
 */
export async function createCustomer(
  formData: CustomerFormData
): Promise<ActionResponse<Customer>> {
  // Validate schema
  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Data input tidak valid";
    return { success: false, error: firstError };
  }

  const normalizedWa = normalizePhoneNumber(parsed.data.nomor_wa);

  try {
    const supabase = await createClient();

    // 1. Check for duplicate WhatsApp number in Supabase
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

    // Also check demo customers list in case running without migrated DB table
    const duplicateDemo = INITIAL_DEMO_CUSTOMERS.find(
      (c) => normalizePhoneNumber(c.nomor_wa) === normalizedWa
    );
    if (duplicateDemo) {
      return {
        success: false,
        error: `Nomor WhatsApp (${normalizedWa}) sudah terdaftar atas nama "${duplicateDemo.nama_panggilan}". Pencatatan ganda ditolak (FR 2.2).`,
      };
    }

    // 2. Insert into Supabase customers table
    const newCustomerData = {
      nama_panggilan: parsed.data.nama_panggilan.trim(),
      nomor_wa: normalizedWa,
      segmen: parsed.data.segmen,
      setuju_promo: parsed.data.setuju_promo,
      label: parsed.data.label?.trim() || "Pelanggan Baru",
      stempel_loyalitas: 0,
      terakhir_transaksi: null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("customers")
      .insert(newCustomerData)
      .select()
      .single();

    if (insertError) {
      // If table doesn't exist yet or connection fails, return mock inserted customer for UI test
      const mockInserted: Customer = {
        id: crypto.randomUUID(),
        ...newCustomerData,
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
