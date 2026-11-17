import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function HomePage() {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("warmindo_demo_role")?.value;

  if (demoRole === "pemilik" || demoRole === "admin") {
    redirect("/dashboard");
  } else if (demoRole === "kasir") {
    redirect("/pelanggan");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "pemilik" || profile?.role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/pelanggan");
  }
}
