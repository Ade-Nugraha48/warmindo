import * as React from "react";
import { connection } from "next/server";
import { getTickets } from "@/app/(admin)/keluhan/actions";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { TicketManagementView } from "@/components/features/TicketManagementView";

export const instant = false;

export default async function KeluhanPage() {
  await connection();
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
