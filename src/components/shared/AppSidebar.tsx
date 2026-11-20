"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanBarcode,
  FlameKindling,
  Users,
  TicketCheck,
  MessageSquareText,
  Megaphone,
  ChevronsUpDown,
  LogOut,
  Check,
  Store,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OUTLET_BRANCHES } from "@/lib/constants";
import { logoutAction } from "@/app/auth/actions";

export interface NavItemConfig {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export const SUMBER_RIZKI_NAV_ITEMS: NavItemConfig[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["pemilik", "admin"],
  },
  {
    title: "Kasir POS",
    href: "/transaksi",
    icon: ScanBarcode,
    roles: ["kasir", "pemilik", "admin"],
  },
  {
    title: "Antrean Dapur",
    href: "/antrean-dapur",
    icon: FlameKindling,
    roles: ["kasir", "pemilik", "admin"],
  },
  {
    title: "Pelanggan CRM",
    href: "/pelanggan",
    icon: Users,
    roles: ["kasir", "pemilik", "admin"],
  },
  {
    title: "Tiket Keluhan",
    href: "/keluhan",
    icon: TicketCheck,
    roles: ["kasir", "pemilik", "admin"],
  },
  {
    title: "Quick Replies WA",
    href: "/quick-replies",
    icon: MessageSquareText,
    roles: ["kasir", "pemilik", "admin"],
  },
  {
    title: "Promo & Reaktivasi",
    href: "/promo",
    icon: Megaphone,
    roles: ["kasir", "pemilik", "admin"],
  },
];

interface AppSidebarProps {
  userRole: string;
  userName: string;
  userEmail: string;
  userShift: string;
}

export function AppSidebar({
  userRole,
  userName,
  userEmail,
  userShift,
}: AppSidebarProps) {
  const pathname = usePathname();
  const normalizedRole = userRole.toLowerCase();
  const [selectedBranch, setSelectedBranch] = React.useState<string>(
    OUTLET_BRANCHES[0].shortName
  );

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Outlet Switcher Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SUMBER RIZKI</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedBranch}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-lg" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Cabang Outlet</DropdownMenuLabel>
                  {OUTLET_BRANCHES.map((branch) => (
                    <DropdownMenuItem
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch.shortName)}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">
                          {branch.shortName}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {branch.address}
                        </div>
                      </div>
                      {selectedBranch === branch.shortName && (
                        <Check className="size-3.5 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SUMBER_RIZKI_NAV_ITEMS.map((item) => {
                if (!item.roles.includes(normalizedRole)) {
                  return null;
                }
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive ? "shadow-xs font-medium" : "text-muted-foreground"
                      }
                    >
                      <Icon className={isActive ? "text-primary" : ""} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Account Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar size="default">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userShift}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="end"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <form action={logoutAction} className="w-full">
                    <DropdownMenuItem
                      render={<button type="submit" className="w-full" />}
                      nativeButton={true}
                      variant="destructive"
                    >
                      <LogOut />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
