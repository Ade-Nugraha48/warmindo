import * as React from "react";
import { getTickets } from "@/app/(admin)/keluhan/actions";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { TicketManagementView } from "@/components/features/TicketManagementView";

export default async function KeluhanPage() {
  const [initialTickets, initialCustomers] = await Promise.all([
    getTickets(),
    getCustomers(),
  ]);

  return (
    <TicketManagementView
      initialTickets={initialTickets}
      customers={initialCustomers}
    />
  );
}
