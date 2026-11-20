import * as React from "react";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SiteHeader } from "@/components/shared/SiteHeader";

async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }

  const userShift =
    session.role === "pemilik" || session.role === "admin"
      ? "Pemilik Outlet"
      : session.shift === "pagi"
      ? "Kasir Shift Pagi"
      : "Kasir Shift Malam";

  return (
    <SidebarProvider>
      <AppSidebar
        userRole={session.role}
        userName={session.userName}
        userEmail={session.userEmail}
        userShift={userShift}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-sidebar p-2">
          <div className="min-h-[calc(100vh-1rem)] rounded-xl bg-background border shadow-sm p-6" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </React.Suspense>
  );
}
