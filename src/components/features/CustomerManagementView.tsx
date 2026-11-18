"use client";

import * as React from "react";
import { Search, X, Users, Gift, UserCheck, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerTable } from "@/components/features/CustomerTable";
import { AddCustomerDialog } from "@/components/features/AddCustomerDialog";
import { getCustomers } from "@/app/(admin)/pelanggan/actions";
import type { Customer } from "@/types/database.types";

interface CustomerManagementViewProps {
  initialCustomers: Customer[];
}

export function CustomerManagementView({
  initialCustomers,
}: CustomerManagementViewProps) {
  const [customers, setCustomers] = React.useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSegment, setSelectedSegment] = React.useState<string>("Semua");
  const [isLoading, setIsLoading] = React.useState(false);

  // Filter segments
  const segments = ["Semua", "Mahasiswa UPN", "Mahasiswa Atma Jaya", "Umum"];

  // Fetch / filter customers when search term or segment changes
  React.useEffect(() => {
    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getCustomers(searchTerm, selectedSegment);
        setCustomers(results);
      } catch (err) {
        console.error("Failed to search customers:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedSegment]);

  const handleCustomerAdded = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  // Metrics
  const totalCustomers = customers.length;
  const readyForReward = customers.filter(
    (c) => (c.stempel_loyalitas ?? 0) >= 5
  ).length;
  const promoConsented = customers.filter((c) => c.setuju_promo).length;

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Users className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Data Pelanggan (Single Customer View)
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Database profil member, tracking stempel loyalitas, dan preferensi promo (FR 2.1 – FR 2.5).
          </p>
        </div>

        {/* Action Button: Dialog Tambah Pelanggan */}
        <AddCustomerDialog onCustomerAdded={handleCustomerAdded} />
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <UserCheck className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Total Member Terdaftar</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {totalCustomers} Pelanggan
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Gift className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Siap Klaim Bonus (5/5)</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {readyForReward} Member
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Setuju Promo WhatsApp</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {promoConsented} Kontak
            </div>
          </div>
        </div>
      </div>

      {/* Search and Segment Filtering Controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-3.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Bar Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama atau 4 digit terakhir nomor WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            Menampilkan <span className="font-semibold text-zinc-700 dark:text-zinc-200">{customers.length}</span> data
          </div>
        </div>

        {/* Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-xs text-zinc-400 mr-1 shrink-0 font-medium">Filter Segmen:</span>
          {segments.map((seg) => {
            const isSelected = selectedSegment === seg;
            return (
              <button
                key={seg}
                type="button"
                onClick={() => setSelectedSegment(seg)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-white font-semibold shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {seg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Customers Table */}
      <CustomerTable customers={customers} isLoading={isLoading} />
    </div>
  );
}
