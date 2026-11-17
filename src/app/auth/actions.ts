"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginWithDemo(role: "kasir" | "pemilik" | "admin") {
  const cookieStore = await cookies();
  cookieStore.set("warmindo_demo_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  if (role === "pemilik" || role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/pelanggan");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("warmindo_demo_role");

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
