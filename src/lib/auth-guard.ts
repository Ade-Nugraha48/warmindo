import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

const VALID_ROLES = new Set<UserRole>(["admin", "kasir", "pemilik"]);

export interface SessionContext {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
  userEmail: string;
  shift: "pagi" | "malam";
  isDemo: boolean;
}

export function isValidRole(value: string | undefined): value is UserRole {
  return Boolean(value && VALID_ROLES.has(value as UserRole));
}

export const getSessionContext = cache(
  async (): Promise<SessionContext | null> => {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("warmindo_demo_role")?.value;
    const shiftCookie =
      cookieStore.get("warmindo_shift")?.value === "pagi" ? "pagi" : "malam";

    if (isValidRole(demoRole)) {
      const isOwner = demoRole === "pemilik" || demoRole === "admin";
      return {
        isAuthenticated: true,
        role: demoRole,
        userName: isOwner ? "H. Rizki" : "Santosa",
        userEmail: isOwner ? "owner@sumberrizki.id" : "santosa.kasir@sumberrizki.id",
        shift: shiftCookie,
        isDemo: true,
      };
    }

    const hasSupabaseCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith("sb-"));
    if (!hasSupabaseCookie) {
      return null;
    }

    try {
      const supabase = await createClient(cookieStore);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, nama_lengkap, shift_default")
        .eq("id", user.id)
        .single();

      const resolvedRole: UserRole = isValidRole(profile?.role)
        ? profile.role
        : "kasir";

      return {
        isAuthenticated: true,
        role: resolvedRole,
        userName: profile?.nama_lengkap || user.email?.split("@")[0] || "Staf",
        userEmail: user.email || `${resolvedRole}@sumberrizki.id`,
        shift:
          profile?.shift_default?.toLowerCase() === "pagi"
            ? "pagi"
            : shiftCookie,
        isDemo: false,
      };
    } catch {
      return null;
    }
  }
);

export async function requireSession(
  allowedRoles?: UserRole[]
): Promise<SessionContext> {
  const session = await getSessionContext();
  if (!session) {
    throw new Error("Unauthorized: Sesi login tidak ditemukan.");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error(
      "Forbidden: Anda tidak memiliki hak akses untuk operasi ini."
    );
  }
  return session;
}
