import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Also check for demo session cookie if Supabase auth isn't active
  const demoRoleCookie = request.cookies.get("warmindo_demo_role")?.value;
  const isAuthenticated = Boolean(user || demoRoleCookie);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pelanggan") ||
    pathname.startsWith("/transaksi") ||
    pathname.startsWith("/keluhan") ||
    pathname.startsWith("/promo");

  // Redirect unauthenticated users from protected routes to /login
  if (!isAuthenticated && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from /login or / to their appropriate home
  if (isAuthenticated && (isAuthRoute || pathname === "/")) {
    let role = demoRoleCookie;

    if (user && !role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "kasir";
    }

    const redirectPath = role === "pemilik" ? "/dashboard" : "/pelanggan";
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  // Enforce RBAC: Kasir cannot access /dashboard (FR 1.b)
  if (isAuthenticated && pathname.startsWith("/dashboard")) {
    let role = demoRoleCookie;
    if (user && !role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role;
    }

    if (role === "kasir") {
      const url = request.nextUrl.clone();
      url.pathname = "/pelanggan";
      return NextResponse.redirect(url);
    }
  }

  // Redirect root / to /login when not authenticated
  if (!isAuthenticated && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
