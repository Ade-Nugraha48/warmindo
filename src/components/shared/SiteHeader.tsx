"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search, Send } from "lucide-react";
import { BroadcastModal } from "@/components/features/BroadcastModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transaksi": "Kasir POS",
  "/antrean-dapur": "Antrean Dapur",
  "/pelanggan": "Pelanggan CRM",
  "/keluhan": "Tiket Keluhan",
  "/quick-replies": "Quick Replies WA",
  "/promo": "Promo & Reaktivasi",
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [globalQuery, setGlobalQuery] = React.useState("");
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const matchedTitle =
    Object.entries(ROUTE_TITLES).find(([prefix]) =>
      pathname.startsWith(prefix)
    )?.[1] ?? "Workspace";

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalQuery.trim();
    if (!q) return;

    if (q.startsWith("/")) {
      router.push(`/quick-replies?q=${encodeURIComponent(q)}`);
    } else if (/^\d{4,}$/.test(q) || q.toLowerCase().includes("08")) {
      router.push(`/pelanggan?q=${encodeURIComponent(q)}`);
    } else if (q.toLowerCase().includes("meja")) {
      router.push(`/antrean-dapur?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/transaksi?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-card/95 backdrop-blur-sm px-4 lg:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-1 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:inline-flex">
                <span className="text-muted-foreground">SUMBER RIZKI</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {matchedTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={handleGlobalSearch}
            className="relative hidden sm:flex items-center w-60 md:w-72"
          >
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Cari menu, WA, meja, /cmd..."
              className="pl-8 pr-12 h-9 bg-background/60 border-border/80 rounded-lg text-xs"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 items-center rounded border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </form>

          {!pathname.startsWith("/transaksi") && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/transaksi" />}
              nativeButton={false}
              className="hidden md:inline-flex"
            >
              <Plus data-icon="inline-start" />
              <span>Order Baru</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBroadcastOpen(true)}
          >
            <Send data-icon="inline-start" />
            <span className="hidden md:inline">Broadcast WA</span>
          </Button>
        </div>
      </header>

      <BroadcastModal
        open={broadcastOpen}
        onOpenChange={setBroadcastOpen}
        onBroadcastSuccess={() => router.refresh()}
      />
    </>
  );
}
