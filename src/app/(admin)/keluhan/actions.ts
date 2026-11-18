"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ticketSchema, type TicketFormData } from "@/types/ticket.schema";
import { INITIAL_DEMO_TICKETS, INITIAL_DEMO_CUSTOMERS } from "@/lib/demo-data";
import type { StatusTiket } from "@/types/database.types";
import type { TicketRecord } from "@/types/ticket.record";

const DEMO_TICKETS = INITIAL_DEMO_TICKETS;

/**
 * Fetch all tickets
 */
export async function getTickets(): Promise<TicketRecord[]> {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        customers (
          id,
          nama_panggilan,
          nomor_wa
        )
      `)
      .order("waktu_masuk", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((t) => {
        const cust = t.customers as unknown as {
          id: string;
          nama_panggilan: string;
          nomor_wa: string;
        } | null;

        return {
          id: t.id,
          customer_id: t.customer_id,
          customer_nama: cust?.nama_panggilan || "Pelanggan Tanpa Nama",
          customer_wa: cust?.nomor_wa || "-",
          kategori: t.kategori,
          deskripsi_keluhan: t.deskripsi_keluhan,
          pic: t.pic,
          status: t.status || "Baru",
          waktu_masuk: t.waktu_masuk || new Date().toISOString(),
          waktu_selesai: t.waktu_selesai,
          diselesaikan_di_tempat: Boolean(t.diselesaikan_di_tempat),
          pesan_konfirmasi_terkirim: Boolean(t.pesan_konfirmasi_terkirim),
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
  const parsed = ticketSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Input tiket tidak valid",
    };
  }

  const { customer_id, kategori, deskripsi_keluhan, pic, diselesaikan_di_tempat } =
    parsed.data;

  try {
    const supabase = await createClient();

    const { data: customer } = await supabase
      .from("customers")
      .select("id, nama_panggilan, nomor_wa")
      .eq("id", customer_id)
      .single();

    const targetCustomer =
      customer || INITIAL_DEMO_CUSTOMERS.find((c) => c.id === customer_id);

    const waktuMasuk = new Date().toISOString();

    const { data: inserted, error: insertError } = await supabase
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
      .select()
      .single();

    const newTicket: TicketRecord = {
      id: inserted ? inserted.id : `TK-${Date.now().toString().slice(-4)}`,
      customer_id,
      customer_nama: targetCustomer?.nama_panggilan || "Pelanggan",
      customer_wa: targetCustomer?.nomor_wa || "-",
      kategori,
      deskripsi_keluhan,
      pic,
      status: "Baru",
      waktu_masuk: waktuMasuk,
      waktu_selesai: null,
      diselesaikan_di_tempat,
      pesan_konfirmasi_terkirim: false,
    };

    if (insertError || !inserted) {
      DEMO_TICKETS.unshift(newTicket);
    } else {
      DEMO_TICKETS.unshift(newTicket);
    }

    revalidatePath("/keluhan");
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
  const waktuSelesai = newStatus === "Selesai" ? new Date().toISOString() : null;

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

    const found = DEMO_TICKETS.find((t) => t.id === ticketId);
    if (found) {
      found.status = newStatus;
      if (waktuSelesai) found.waktu_selesai = waktuSelesai;
      if (sendWaNotification) found.pesan_konfirmasi_terkirim = true;
    }

    revalidatePath("/keluhan");
    return {
      success: true,
      data: {
        status: newStatus,
        waktu_selesai: waktuSelesai,
        pesan_konfirmasi_terkirim: sendWaNotification,
      },
    };
  } catch {
    const found = DEMO_TICKETS.find((t) => t.id === ticketId);
    if (found) {
      found.status = newStatus;
      if (waktuSelesai) found.waktu_selesai = waktuSelesai;
      if (sendWaNotification) found.pesan_konfirmasi_terkirim = true;
    }

    revalidatePath("/keluhan");
    return {
      success: true,
      data: {
        status: newStatus,
        waktu_selesai: waktuSelesai,
        pesan_konfirmasi_terkirim: sendWaNotification,
      },
    };
  }
}

/**
 * Mark confirmation WA sent explicitly
 */
export async function markTicketWaSent(ticketId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    await supabase
      .from("tickets")
      .update({ pesan_konfirmasi_terkirim: true })
      .eq("id", ticketId);

    const found = DEMO_TICKETS.find((t) => t.id === ticketId);
    if (found) found.pesan_konfirmasi_terkirim = true;

    revalidatePath("/keluhan");
    return true;
  } catch {
    const found = DEMO_TICKETS.find((t) => t.id === ticketId);
    if (found) found.pesan_konfirmasi_terkirim = true;
    revalidatePath("/keluhan");
    return true;
  }
}
