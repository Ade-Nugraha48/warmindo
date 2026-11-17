import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: customers } = await supabase.from("customers").select("*");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-black font-sans">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Warmindo Sumber Rizki 2
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sistem CRM & Point of Sales
        </p>

        <div className="mt-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Koneksi Database Supabase
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Terhubung ({customers?.length ?? 0} Pelanggan)
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
