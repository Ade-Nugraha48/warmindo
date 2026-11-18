import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAnalytics } from "@/app/(admin)/dashboard/actions";
import { DashboardView } from "@/components/features/DashboardView";

export const instant = false;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("warmindo_demo_role")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = demoRole;

  if (user && !demoRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role;
  }

  // Enforce RBAC: Halaman ini hanya bisa diakses jika role = pemilik (atau admin) (FR 1.b)
  if (userRole === "kasir") {
    redirect("/pelanggan");
  }

  // Redirect unauthenticated user to login
  if (!user && !userRole) {
    redirect("/login");
  }

  const analytics = await getDashboardAnalytics();

  return <DashboardView analytics={analytics} />;
}
