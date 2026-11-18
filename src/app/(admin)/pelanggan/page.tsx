import * as React from "react";
import { connection } from "next/server";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { CustomerManagementView } from "@/components/features/CustomerManagementView";

export const instant = false;

export default async function PelangganPage() {
  await connection();
  const initialCustomers = await getCustomers();

  return <CustomerManagementView initialCustomers={initialCustomers} />;
}
