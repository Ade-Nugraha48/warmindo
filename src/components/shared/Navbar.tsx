"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  UtensilsCrossed,
  LayoutDashboard,
  Users,
  Receipt,
  Ticket,
  Megaphone,
  LogOut,
  Shield,
  UserCheck,
} from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  userRole?: string;
  userName?: string;
}

export function Navbar({
  userRole = "kasir",
  userName = "Staf Warmindo",
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    {
      title: "Dashboard KPI",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["pemilik", "admin"],
    },
    {
      title: "Data Pelanggan",
      href: "/pelanggan",
      icon: Users,
      roles: ["kasir", "pemilik", "admin"],
    },
    {
      title: "Transaksi & Stempel",
      href: "/transaksi",
      icon: Receipt,
      roles: ["kasir", "pemilik", "admin"],
    },
    {
      title: "Keluhan & Saran",
      href: "/keluhan",
      icon: Ticket,
      roles: ["kasir", "pemilik", "admin"],
    },
    {
      title: "Promo & Reaktivasi",
      href: "/promo",
      icon: Megaphone,
      roles: ["kasir", "pemilik", "admin"],
    },
  ];

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard KPI";
    if (pathname.startsWith("/pelanggan")) return "Data Pelanggan (CRM)";
    if (pathname.startsWith("/transaksi")) return "Transaksi & Stempel";
    if (pathname.startsWith("/keluhan")) return "Keluhan & Saran (Helpdesk)";
    if (pathname.startsWith("/promo")) return "Promo & Reaktivasi";
    return "Sistem Warmindo";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950 font-sans">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden text-zinc-600 dark:text-zinc-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-white lg:hidden">
            <UtensilsCrossed className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {getPageTitle()}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: User Role & Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-zinc-500">Masuk sebagai:</span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {userName}
          </span>
        </div>

        <Badge
          variant="secondary"
          className={`text-[11px] uppercase font-bold tracking-wider ${
            userRole.toLowerCase() === "pemilik"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          {userRole}
        </Badge>

        <form action={logoutAction} className="hidden sm:block">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 gap-1.5"
          >
            <LogOut className="size-3.5" />
            Keluar
          </Button>
        </form>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-zinc-200 bg-white p-4 shadow-lg lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const isAuthorized = item.roles.includes(userRole.toLowerCase());

              if (!isAuthorized) return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-amber-500 text-white font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                {userRole.toLowerCase() === "pemilik" ? (
                  <Shield className="size-3.5" />
                ) : (
                  <UserCheck className="size-3.5" />
                )}
                <span>{userName}</span>
              </div>
              <span className="font-semibold capitalize">({userRole})</span>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400"
              >
                <LogOut className="size-3.5" />
                Keluar (Logout)
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
