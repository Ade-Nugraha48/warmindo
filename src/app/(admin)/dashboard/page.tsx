import * as React from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth-guard";
import { getDashboardAnalytics } from "@/app/(admin)/dashboard/actions";
import { DashboardView } from "@/components/features/DashboardView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function DashboardContent() {
  await connection();
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "pemilik" && session.role !== "admin") {
    redirect("/transaksi");
  }

  const analytics = await getDashboardAnalytics();
  return <DashboardView analytics={analytics} />;
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <DashboardContent />
    </React.Suspense>
  );
}
