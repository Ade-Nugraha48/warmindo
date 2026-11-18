"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DEMO_CUSTOMERS, INITIAL_DEMO_CAMPAIGN_LOGS } from "@/lib/demo-data";
import type { JenisKampanye } from "@/types/database.types";
import type { PassiveCustomer, CampaignLogRecord } from "@/types/campaign.record";

const DEMO_CUSTOMERS = INITIAL_DEMO_CUSTOMERS;
const DEMO_CAMPAIGN_LOGS = [...INITIAL_DEMO_CAMPAIGN_LOGS];

/**
 * Fetch passive customers based on minimum inactive days and optional label
 */
export async function getPassiveCustomers(
  minDays: number = 14,
  filterLabel?: string
): Promise<PassiveCustomer[]> {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("terakhir_transaksi", { ascending: true, nullsFirst: true });

    const rawCustomers = (!error && data && data.length > 0) ? data : DEMO_CUSTOMERS;
    const now = Date.now();

    const passiveList: PassiveCustomer[] = rawCustomers.map((c) => {
      let hariPasif = 30; // default for never transacted
      if (c.terakhir_transaksi) {
        const lastTrx = new Date(c.terakhir_transaksi).getTime();
        hariPasif = Math.max(0, Math.floor((now - lastTrx) / (1000 * 60 * 60 * 24)));
      } else if (c.created_at) {
        const created = new Date(c.created_at).getTime();
        hariPasif = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
      }

      return {
        id: c.id,
        nama_panggilan: c.nama_panggilan,
        nomor_wa: c.nomor_wa,
        segmen: c.segmen,
        label: c.label,
        setuju_promo: Boolean(c.setuju_promo),
        stempel_loyalitas: c.stempel_loyalitas ?? 0,
        terakhir_transaksi: c.terakhir_transaksi,
        hari_pasif: hariPasif,
      };
    });

    let filtered = passiveList;

    if (minDays > 0) {
      filtered = filtered.filter((c) => c.hari_pasif >= minDays);
    }

    if (filterLabel && filterLabel !== "ALL") {
      filtered = filtered.filter((c) => c.label === filterLabel);
    }

    return filtered.sort((a, b) => b.hari_pasif - a.hari_pasif);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }

    const now = Date.now();
    let filtered = DEMO_CUSTOMERS.map((c) => {
      let hariPasif = 30;
      if (c.terakhir_transaksi) {
        const lastTrx = new Date(c.terakhir_transaksi).getTime();
        hariPasif = Math.max(0, Math.floor((now - lastTrx) / (1000 * 60 * 60 * 24)));
      }
      return {
        id: c.id,
        nama_panggilan: c.nama_panggilan,
        nomor_wa: c.nomor_wa,
        segmen: c.segmen,
        label: c.label,
        setuju_promo: Boolean(c.setuju_promo),
        stempel_loyalitas: c.stempel_loyalitas ?? 0,
        terakhir_transaksi: c.terakhir_transaksi,
        hari_pasif: hariPasif,
      };
    });

    if (minDays > 0) {
      filtered = filtered.filter((c) => c.hari_pasif >= minDays);
    }

    if (filterLabel && filterLabel !== "ALL") {
      filtered = filtered.filter((c) => c.label === filterLabel);
    }

    return filtered.sort((a, b) => b.hari_pasif - a.hari_pasif);
  }
}

/**
 * Record a single marketing campaign outreach (e.g. click-to-chat WA)
 */
export async function recordCampaignLog(
  customerId: string,
  jenis: JenisKampanye,
  customerNama: string,
  customerWa: string
): Promise<{ success: boolean; message: string }> {
  const newLog: CampaignLogRecord = {
    id: `CMP-${Date.now().toString().slice(-4)}`,
    customer_id: customerId,
    customer_nama: customerNama,
    customer_wa: customerWa,
    jenis_kampanye: jenis,
    waktu_kirim: new Date().toISOString(),
    berhasil_reaktivasi: false,
  };

  try {
    const supabase = await createClient();
    await supabase.from("campaign_logs").insert({
      customer_id: customerId,
      jenis_kampanye: jenis,
      waktu_kirim: newLog.waktu_kirim,
      berhasil_reaktivasi: false,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    // Graceful fallback to in-memory log
  }

  DEMO_CAMPAIGN_LOGS.unshift(newLog);
  revalidatePath("/promo");
  return { success: true, message: `Pesan ${jenis} tercatat untuk ${customerNama}.` };
}

/**
 * Broadcast "Begadang Nugas" promo to all Member Malam who agreed to promos
 */
export async function broadcastBegadangNugas(): Promise<{
  success: boolean;
  message: string;
  count: number;
  recipients: { id: string; nama: string; wa: string }[];
}> {
  try {
    const supabase = await createClient();
    const { data: dbRecipients } = await supabase
      .from("customers")
      .select("id, nama_panggilan, nomor_wa, setuju_promo, label")
      .eq("label", "Member Malam")
      .eq("setuju_promo", true);

    const targetList = (dbRecipients && dbRecipients.length > 0)
      ? dbRecipients.map((r) => ({
          id: r.id,
          nama: r.nama_panggilan,
          wa: r.nomor_wa,
        }))
      : DEMO_CUSTOMERS.filter((c) => c.label === "Member Malam" && c.setuju_promo).map((c) => ({
          id: c.id,
          nama: c.nama_panggilan,
          wa: c.nomor_wa,
        }));

    const now = new Date().toISOString();

    if (targetList.length > 0) {
      try {
        const inserts = targetList.map((t) => ({
          customer_id: t.id,
          jenis_kampanye: "Begadang Nugas" as JenisKampanye,
          waktu_kirim: now,
          berhasil_reaktivasi: false,
        }));
        await supabase.from("campaign_logs").insert(inserts);
      } catch (insertErr) {
        if (
          typeof insertErr === "object" &&
          insertErr !== null &&
          "digest" in insertErr &&
          typeof (insertErr as { digest: unknown }).digest === "string"
        ) {
          throw insertErr;
        }
      }

      // Add to demo logs
      targetList.forEach((t, idx) => {
        DEMO_CAMPAIGN_LOGS.unshift({
          id: `CMP-BN-${Date.now().toString().slice(-4)}-${idx + 1}`,
          customer_id: t.id,
          customer_nama: t.nama,
          customer_wa: t.wa,
          jenis_kampanye: "Begadang Nugas",
          waktu_kirim: now,
          berhasil_reaktivasi: false,
        });
      });
    }

    revalidatePath("/promo");

    return {
      success: true,
      message: `Berhasil memicu broadcast Begadang Nugas ke ${targetList.length} pelanggan Member Malam.`,
      count: targetList.length,
      recipients: targetList,
    };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }

    const targetList = DEMO_CUSTOMERS.filter(
      (c) => c.label === "Member Malam" && c.setuju_promo
    ).map((c) => ({
      id: c.id,
      nama: c.nama_panggilan,
      wa: c.nomor_wa,
    }));

    const now = new Date().toISOString();
    targetList.forEach((t, idx) => {
      DEMO_CAMPAIGN_LOGS.unshift({
        id: `CMP-BN-${Date.now().toString().slice(-4)}-${idx + 1}`,
        customer_id: t.id,
        customer_nama: t.nama,
        customer_wa: t.wa,
        jenis_kampanye: "Begadang Nugas",
        waktu_kirim: now,
        berhasil_reaktivasi: false,
      });
    });

    revalidatePath("/promo");

    return {
      success: true,
      message: `Berhasil memicu broadcast Begadang Nugas ke ${targetList.length} pelanggan Member Malam.`,
      count: targetList.length,
      recipients: targetList,
    };
  }
}

/**
 * Fetch campaign history logs
 */
export async function getCampaignLogs(): Promise<CampaignLogRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaign_logs")
      .select(`
        id,
        customer_id,
        jenis_kampanye,
        waktu_kirim,
        berhasil_reaktivasi,
        customers (
          nama_panggilan,
          nomor_wa
        )
      `)
      .order("waktu_kirim", { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      return data.map((log) => {
        const cust = log.customers as unknown as {
          nama_panggilan: string;
          nomor_wa: string;
        } | null;

        return {
          id: log.id,
          customer_id: log.customer_id,
          customer_nama: cust?.nama_panggilan || "Pelanggan Terhapus",
          customer_wa: cust?.nomor_wa || "-",
          jenis_kampanye: log.jenis_kampanye,
          waktu_kirim: log.waktu_kirim || new Date().toISOString(),
          berhasil_reaktivasi: Boolean(log.berhasil_reaktivasi),
        };
      });
    }

    return DEMO_CAMPAIGN_LOGS;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string"
    ) {
      throw err;
    }
    return DEMO_CAMPAIGN_LOGS;
  }
}
