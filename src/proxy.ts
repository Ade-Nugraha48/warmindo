import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, UserRole } from "@/types/database.types";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/pelanggan",
  "/transaksi",
  "/antrean-dapur",
  "/keluhan",
  "/quick-replies",
  "/promo",
];

const VALID_ROLES = new Set<string>(["admin", "kasir", "pemilik"]);

function getValidDemoRole(cookieValue: string | undefined): UserRole | null {
  if (!cookieValue || !VALID_ROLES.has(cookieValue)) return null;
  return cookieValue as UserRole;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const demoRole = getValidDemoRole(
    request.cookies.get("warmindo_demo_role")?.value
  );
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createServerClient<Database>> | null = null;

  if (!demoRole && hasSupabaseCookie && supabaseUrl && supabaseKey) {
    supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const isAuthenticated = Boolean(user || demoRole);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login";
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Redirect unauthenticated users from protected routes or root / to /login
  if (!isAuthenticated && (isProtectedRoute || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (isProtectedRoute) {
      url.searchParams.set("redirectedFrom", pathname);
    }
    return NextResponse.redirect(url);
  }

  // Resolve user role cleanly when needed
  const resolveRole = async (): Promise<UserRole> => {
    if (demoRole) return demoRole;
    if (user && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role && VALID_ROLES.has(profile.role)) {
        return profile.role as UserRole;
      }
    }
    return "kasir";
  };

  // Redirect authenticated users from /login or / to their home module
  if (isAuthenticated && (isAuthRoute || pathname === "/")) {
    const role = await resolveRole();
    const redirectPath =
      role === "pemilik" || role === "admin" ? "/dashboard" : "/transaksi";
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  // Enforce RBAC: Only pemilik or admin can access /dashboard (FR 1.b)
  if (isAuthenticated && pathname.startsWith("/dashboard")) {
    const role = await resolveRole();
    if (role !== "pemilik" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/transaksi";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
