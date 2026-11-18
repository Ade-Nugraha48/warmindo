import * as React from "react";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { CustomerManagementView } from "@/components/features/CustomerManagementView";

export default async function PelangganPage() {
  const initialCustomers = await getCustomers();

  return <CustomerManagementView initialCustomers={initialCustomers} />;
}
