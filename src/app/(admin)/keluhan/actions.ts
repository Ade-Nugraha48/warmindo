"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { ticketSchema, type TicketFormData } from "@/types/ticket.schema";
import { INITIAL_DEMO_TICKETS, INITIAL_DEMO_CUSTOMERS } from "@/lib/demo-data";
import type { Json, StatusTiket } from "@/types/database.types";
import type { TicketAuditStep, TicketRecord } from "@/types/ticket.record";

const DEMO_TICKETS = INITIAL_DEMO_TICKETS;

/**
 * Fetch all complaint tickets
 */
export async function getTickets(): Promise<TicketRecord[]> {
  await connection();
  await requireSession();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tickets")
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
      .order("waktu_masuk", { ascending: false })
      .limit(150);

    if (!error && data && data.length > 0) {
      return data.map((t) => {
        const cust = t.customers as unknown as {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
          segmen: string | null;
          stempel_loyalitas: number | null;
        } | null;

        const auditSteps = Array.isArray(t.kronologi_audit)
          ? (t.kronologi_audit as unknown as TicketAuditStep[])
          : undefined;

        return {
          id: t.id,
          kode_tiket: t.kode_tiket || `#TKT-${t.id.slice(0, 3).toUpperCase()}`,
          customer_id: t.customer_id,
          customer_nama: cust?.nama_panggilan || "Pelanggan Tanpa Nama",
          customer_wa: cust?.nomor_wa || "-",
          customer_segmen: cust?.segmen || "Umum",
          customer_stempel: cust?.stempel_loyalitas ?? 0,
          nomor_meja: t.nomor_meja || "Meja 01",
          kategori: t.kategori,
          deskripsi_keluhan: t.deskripsi_keluhan,
          pic: t.pic,
          status: t.status || "Baru",
          waktu_masuk: t.waktu_masuk || new Date().toISOString(),
          waktu_selesai: t.waktu_selesai,
          diselesaikan_di_tempat: Boolean(t.diselesaikan_di_tempat),
          pesan_konfirmasi_terkirim: Boolean(t.pesan_konfirmasi_terkirim),
          kompensasi_item: t.kompensasi_item || undefined,
          kronologi_audit: auditSteps,
        };
      });
    }

    return DEMO_TICKETS;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    return DEMO_TICKETS;
  }
}

/**
 * Create a new complaint ticket
 */
export async function createTicket(
  formData: TicketFormData
): Promise<{ success: boolean; data?: TicketRecord; error?: string }> {
  await requireSession();
  const parsed = ticketSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tiket tidak valid",
    };
  }

  const {
    customer_id,
    kategori,
    deskripsi_keluhan,
    pic,
    diselesaikan_di_tempat,
    nomor_meja = "Meja 01",
    kompensasi_item,
  } = parsed.data;

  try {
    const supabase = await createClient();

    const { data: customer } = await supabase
      .from("customers")
      .select("id, nama_panggilan, nomor_wa, segmen, stempel_loyalitas")
      .eq("id", customer_id)
      .single();

    const targetCustomer =
      customer || INITIAL_DEMO_CUSTOMERS.find((c) => c.id === customer_id);

    const waktuMasuk = new Date().toISOString();
    const nowTime = new Date();
    const hhmm = `${String(nowTime.getHours()).padStart(2, "0")}:${String(
      nowTime.getMinutes()
    ).padStart(2, "0")}`;

    const kodeTiket = `#TKT-${Math.floor(100 + (Date.now() % 899))}`;
    const defaultAudit: TicketAuditStep[] = [
      {
        waktu: hhmm,
        deskripsi: `Tiket dibuat manual oleh kasir (${nomor_meja})`,
        severity: kategori === "Waktu Tunggu" ? "critical" : "warning",
      },
    ];

    let insertedId: string | null = null;
    const { data: v2Inserted, error: v2Err } = await supabase
      .from("tickets")
      .insert({
        customer_id,
        kategori,
        deskripsi_keluhan,
        pic,
        status: "Baru",
        waktu_masuk: waktuMasuk,
        waktu_selesai: null,
        diselesaikan_di_tempat,
        pesan_konfirmasi_terkirim: false,
        kode_tiket: kodeTiket,
        nomor_meja,
        kompensasi_item: kompensasi_item || null,
        kronologi_audit: defaultAudit as unknown as Json,
      })
      .select("id")
      .single();

    if (!v2Err && v2Inserted) {
      insertedId = v2Inserted.id;
    } else {
      const { data: v1Inserted } = await supabase
        .from("tickets")
        .insert({
          customer_id,
          kategori,
          deskripsi_keluhan,
          pic,
          status: "Baru",
          waktu_masuk: waktuMasuk,
          waktu_selesai: null,
          diselesaikan_di_tempat,
          pesan_konfirmasi_terkirim: false,
        })
        .select("id")
        .single();
      insertedId = v1Inserted?.id || null;
    }

    const newTicket: TicketRecord = {
      id: insertedId || `TKT-${Date.now().toString().slice(-3)}`,
      kode_tiket: kodeTiket,
      customer_id,
      customer_nama: targetCustomer?.nama_panggilan || "Pelanggan",
      customer_wa: targetCustomer?.nomor_wa || "-",
      customer_segmen: targetCustomer?.segmen || "Umum",
      customer_stempel: targetCustomer?.stempel_loyalitas ?? 0,
      nomor_meja,
      kategori,
      deskripsi_keluhan,
      pic,
      status: "Baru",
      waktu_masuk: waktuMasuk,
      waktu_selesai: null,
      diselesaikan_di_tempat,
      pesan_konfirmasi_terkirim: false,
      kompensasi_item: kompensasi_item || "1x Es Teh Jumbo Rp0",
      kronologi_audit: defaultAudit,
    };

    DEMO_TICKETS.unshift(newTicket);
    revalidatePath("/keluhan");
    revalidatePath("/dashboard");
    return { success: true, data: newTicket };
  } catch (err) {
    console.error("Error creating ticket:", err);
    return { success: false, error: "Gagal membuat tiket keluhan." };
  }
}

/**
 * Update ticket status (Baru -> Diproses -> Selesai)
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: StatusTiket,
  sendWaNotification: boolean = false
): Promise<{ success: boolean; data?: Partial<TicketRecord>; error?: string }> {
  await requireSession();
  const waktuSelesai =
    newStatus === "Selesai" ? new Date().toISOString() : null;

  try {
    const supabase = await createClient();
    await supabase
      .from("tickets")
      .update({
        status: newStatus,
        waktu_selesai: waktuSelesai,
        pesan_konfirmasi_terkirim: sendWaNotification,
      })
      .eq("id", ticketId);
  } catch {
    // Graceful demo fallback
  }

  const found = DEMO_TICKETS.find((t) => t.id === ticketId);
  if (found) {
    found.status = newStatus;
    if (waktuSelesai) found.waktu_selesai = waktuSelesai;
    if (sendWaNotification) found.pesan_konfirmasi_terkirim = true;
  }

  revalidatePath("/keluhan");
  revalidatePath("/dashboard");
  return {
    success: true,
    data: {
      status: newStatus,
      waktu_selesai: waktuSelesai,
      pesan_konfirmasi_terkirim: sendWaNotification,
    },
  };
}

/**
 * Mark confirmation WA sent explicitly
 */
export async function markTicketWaSent(ticketId: string): Promise<boolean> {
  await requireSession();
  try {
    const supabase = await createClient();
    await supabase
      .from("tickets")
      .update({ pesan_konfirmasi_terkirim: true })
      .eq("id", ticketId);
  } catch {
    // Graceful demo fallback
  }

  const found = DEMO_TICKETS.find((t) => t.id === ticketId);
  if (found) found.pesan_konfirmasi_terkirim = true;

  revalidatePath("/keluhan");
  return true;
}

/**
 * Record compensation item (Es Teh Jumbo Rp0) on a ticket and update status to Diproses
 */
export async function grantTicketCompensation(
  ticketId: string,
  kompensasiItem: string = "1x Es Teh Jumbo Solo (Rp 0)"
): Promise<{ success: boolean }> {
  await requireSession();
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tickets")
      .update({ kompensasi_item: kompensasiItem, status: "Diproses" })
      .eq("id", ticketId);
    if (error) {
      await supabase
        .from("tickets")
        .update({ status: "Diproses" })
        .eq("id", ticketId);
    }
  } catch {
    // Graceful demo fallback
  }

  const found = DEMO_TICKETS.find((t) => t.id === ticketId);
  if (found) {
    found.kompensasi_item = kompensasiItem;
    if (found.status === "Baru") found.status = "Diproses";
  }

  revalidatePath("/keluhan");
  return { success: true };
}
