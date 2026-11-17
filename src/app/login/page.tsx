"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginWithDemo } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [role, setRole] = React.useState<"kasir" | "pemilik">("kasir");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const email = identifier.includes("@")
        ? identifier.trim()
        : `${identifier.trim().toLowerCase()}@warmindo.com`;

      if (isSignUp) {
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) {
          throw signUpError;
        }

        if (authData.user) {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            role,
            nama_lengkap: fullName || identifier,
          });

          if (role === "pemilik") {
            router.push("/dashboard");
          } else {
            router.push("/pelanggan");
          }
          router.refresh();
          return;
        }
      }

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const userRole = profile?.role ?? "kasir";

        if (userRole === "pemilik" || userRole === "admin") {
          router.push(redirectedFrom || "/dashboard");
        } else {
          router.push(redirectedFrom || "/pelanggan");
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal masuk. Periksa username dan password Anda.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (selectedRole: "kasir" | "pemilik") => {
    setLoading(true);
    await loginWithDemo(selectedRole);
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
          <UtensilsCrossed className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Warmindo Sumber Rizki 2
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sistem CRM, Kasir & Monitoring Performa
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            {isSignUp ? "Daftar Akun Baru" : "Masuk ke Sistem"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Daftarkan akun staf baru dan pilih role pengguna"
              : "Masukkan username atau email staf untuk melanjutkan"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    placeholder="Contoh: Budi Santoso"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role Pengguna</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "kasir" | "pemilik")
                    }
                    className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring dark:border-zinc-800"
                  >
                    <option value="kasir">Kasir (Akses Operasional)</option>
                    <option value="pemilik">Pemilik (Akses Dashboard KPI)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Username atau Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="kasir / pemilik atau email@warmindo.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : isSignUp ? (
                "Buat Akun & Masuk"
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              {isSignUp
                ? "Sudah punya akun? Masuk di sini"
                : "Belum punya akun di database? Daftar staf baru"}
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-950/20">
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-400">
              Opsi Cepat Pengujian (Demo Mode)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleDemoLogin("kasir")}
              disabled={loading}
            >
              Login Kasir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleDemoLogin("pemilik")}
              disabled={loading}
            >
              Login Pemilik
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950 font-sans">
      <Suspense fallback={<div className="text-sm text-zinc-500">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
