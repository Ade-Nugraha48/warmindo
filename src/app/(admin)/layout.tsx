import * as React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("warmindo_demo_role")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = demoRole || "kasir";
  let userName = demoRole
    ? demoRole === "pemilik"
      ? "Bpk. Rizki (Pemilik)"
      : "Kasir Warmindo"
    : "Staf Warmindo";
  const userEmail = user?.email || `${userRole}@warmindo.com`;

  if (user && !demoRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, nama_lengkap")
      .eq("id", user.id)
      .single();

    if (profile) {
      userRole = profile.role;
      userName = profile.nama_lengkap;
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar userRole={userRole} userName={userName} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
