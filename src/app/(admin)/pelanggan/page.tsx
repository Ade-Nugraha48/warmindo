import * as React from "react";
import { connection } from "next/server";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import { CustomerManagementView } from "@/components/features/CustomerManagementView";
import { AdminPageSkeleton } from "@/components/shared/AdminPageSkeleton";

async function PelangganContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const [{ q }, initialCustomers] = await Promise.all([
    searchParams,
    getCustomers(),
  ]);

  return (
    <CustomerManagementView
      initialCustomers={initialCustomers}
      initialSearchQuery={q || ""}
    />
  );
}

export default function PelangganPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <React.Suspense fallback={<AdminPageSkeleton />}>
      <PelangganContent searchParams={searchParams} />
    </React.Suspense>
  );
}
