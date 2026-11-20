import * as React from "react";
import { connection } from "next/server";
import { getTickets } from "@/app/(admin)/keluhan/actions";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { getServerNowMs } from "@/lib/server-time";
import { TicketManagementView } from "@/components/features/TicketManagementView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function KeluhanContent() {
  await connection();
  const [initialTickets, initialCustomers, initialNowMs] = await Promise.all([
    getTickets(),
    getCustomers(),
    getServerNowMs(),
  ]);

  return (
    <TicketManagementView
      initialTickets={initialTickets}
      customers={initialCustomers}
      initialNowMs={initialNowMs}
    />
  );
}

export default function KeluhanPage() {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <KeluhanContent />
    </React.Suspense>
  );
}
