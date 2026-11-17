"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Ticket,
  Megaphone,
  UtensilsCrossed,
  LogOut,
  Shield,
  UserCheck,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({
  userRole = "kasir",
  userEmail = "staff@warmindo.com",
  userName = "Staf Warmindo",
}: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: "Dashboard KPI",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["pemilik", "admin"],
      description: "Analisis performa & SLA",
    },
    {
      title: "Data Pelanggan",
      href: "/pelanggan",
      icon: Users,
      roles: ["kasir", "pemilik", "admin"],
      description: "Single customer view",
    },
    {
      title: "Transaksi & Stempel",
      href: "/transaksi",
      icon: Receipt,
      roles: ["kasir", "pemilik", "admin"],
      description: "POS harian & loyalitas",
    },
    {
      title: "Keluhan & Saran",
      href: "/keluhan",
      icon: Ticket,
      roles: ["kasir", "pemilik", "admin"],
      description: "Ticketing & tracking SLA",
    },
    {
      title: "Promo & Reaktivasi",
      href: "/promo",
      icon: Megaphone,
      roles: ["kasir", "pemilik", "admin"],
      description: "Broadcast & WhatsApp link",
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 font-sans">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
          <UtensilsCrossed className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
            Warmindo Sumber Rizki 2
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            CRM & POS Platform
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Menu Utama
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isAuthorized = item.roles.includes(userRole.toLowerCase());

            if (!isAuthorized) {
              return null;
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className={`size-4.5 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`} />
                <div className="flex-1">
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 flex items-center justify-between rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              {userRole.toLowerCase() === "pemilik" ? (
                <Shield className="size-4" />
              ) : (
                <UserCheck className="size-4" />
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {userName}
              </span>
              <span className="truncate text-[10px] text-zinc-500">
                {userEmail}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] uppercase font-bold tracking-wider ${
              userRole.toLowerCase() === "pemilik"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {userRole}
          </Badge>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="size-3.5" />
            Keluar (Logout)
          </Button>
        </form>
      </div>
    </aside>
  );
}
