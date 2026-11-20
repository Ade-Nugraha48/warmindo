"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DEMO_QUICK_REPLIES } from "@/lib/demo-data";
import type { QuickReplyTemplate } from "@/types/pos.record";

const DEMO_QUICK_REPLIES = [...INITIAL_DEMO_QUICK_REPLIES];

export async function getQuickReplies(): Promise<QuickReplyTemplate[]> {
  await connection();
  await requireSession();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wa_quick_replies")
      .select("*")
      .order("usage_count", { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        shortcut: row.shortcut,
        judul: row.judul,
        kategori: (row.kategori as QuickReplyTemplate["kategori"]) || "order",
        isi_pesan: row.isi_pesan,
        trigger_mode:
          (row.trigger_mode as QuickReplyTemplate["trigger_mode"]) ||
          "Manual Kasir",
        keyboard_shortcut: row.keyboard_shortcut,
        usage_count: row.usage_count ?? 0,
        is_primary_kasir: Boolean(row.is_primary_kasir),
      }));
    }

    return DEMO_QUICK_REPLIES;
  } catch {
    return DEMO_QUICK_REPLIES;
  }
}

export async function createQuickReply(payload: {
  shortcut: string;
  judul: string;
  kategori: QuickReplyTemplate["kategori"];
  isi_pesan: string;
  trigger_mode: QuickReplyTemplate["trigger_mode"];
}): Promise<{ success: boolean; data?: QuickReplyTemplate; error?: string }> {
  await requireSession();
  const normalizedShortcut = payload.shortcut.startsWith("/")
    ? payload.shortcut.trim().toLowerCase()
    : `/${payload.shortcut.trim().toLowerCase()}`;

  if (!normalizedShortcut || normalizedShortcut.length < 2) {
    return { success: false, error: "Shortcut (/cmd) minimal 2 karakter." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wa_quick_replies")
      .insert({
        shortcut: normalizedShortcut,
        judul: payload.judul.trim(),
        kategori: payload.kategori,
        isi_pesan: payload.isi_pesan.trim(),
        trigger_mode: payload.trigger_mode,
        usage_count: 0,
        is_primary_kasir: false,
      })
      .select()
      .single();

    if (!error && data) {
      const created: QuickReplyTemplate = {
        id: data.id,
        shortcut: data.shortcut,
        judul: data.judul,
        kategori: data.kategori as QuickReplyTemplate["kategori"],
        isi_pesan: data.isi_pesan,
        trigger_mode:
          (data.trigger_mode as QuickReplyTemplate["trigger_mode"]) ||
          "Manual Kasir",
        keyboard_shortcut: data.keyboard_shortcut,
        usage_count: data.usage_count ?? 0,
        is_primary_kasir: Boolean(data.is_primary_kasir),
      };
      revalidatePath("/quick-replies");
      return { success: true, data: created };
    }
  } catch {
    // Fallback below
  }

  const fallbackCreated: QuickReplyTemplate = {
    id: `qr-${Date.now()}`,
    shortcut: normalizedShortcut,
    judul: payload.judul.trim(),
    kategori: payload.kategori,
    isi_pesan: payload.isi_pesan.trim(),
    trigger_mode: payload.trigger_mode,
    keyboard_shortcut: null,
    usage_count: 0,
    is_primary_kasir: false,
  };
  DEMO_QUICK_REPLIES.unshift(fallbackCreated);
  revalidatePath("/quick-replies");
  return { success: true, data: fallbackCreated };
}

export async function updateQuickReplyTemplate(
  id: string,
  isiPesan: string,
  isPrimaryKasir?: boolean
): Promise<{ success: boolean }> {
  await requireSession();
  try {
    const supabase = await createClient();
    if (isPrimaryKasir) {
      await supabase
        .from("wa_quick_replies")
        .update({ is_primary_kasir: false })
        .neq("id", id);
    }
    await supabase
      .from("wa_quick_replies")
      .update({
        isi_pesan: isiPesan,
        ...(isPrimaryKasir !== undefined
          ? { is_primary_kasir: isPrimaryKasir }
          : {}),
      })
      .eq("id", id);
  } catch {
    // Fallback below
  }

  DEMO_QUICK_REPLIES.forEach((tpl) => {
    if (isPrimaryKasir) tpl.is_primary_kasir = tpl.id === id;
    if (tpl.id === id) tpl.isi_pesan = isiPesan;
  });

  revalidatePath("/quick-replies");
  return { success: true };
}
