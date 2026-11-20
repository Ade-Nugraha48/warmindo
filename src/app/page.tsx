import * as React from "react";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth-guard";

async function RootRedirect(): Promise<React.ReactNode> {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "pemilik" || session.role === "admin") {
    redirect("/dashboard");
  }
  redirect("/transaksi");
}

export default function HomePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RootRedirect />
    </React.Suspense>
  );
}
