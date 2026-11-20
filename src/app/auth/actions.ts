"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginWithDemo(
  role: "kasir" | "pemilik" | "admin",
  shift: "pagi" | "malam" = "malam"
) {
  const cookieStore = await cookies();
  cookieStore.set("warmindo_demo_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("warmindo_shift", shift, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (role === "pemilik" || role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/transaksi");
  }
}

export async function setShiftCookie(shift: "pagi" | "malam") {
  const cookieStore = await cookies();
  cookieStore.set("warmindo_shift", shift, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("warmindo_demo_role");
  cookieStore.delete("warmindo_shift");

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
