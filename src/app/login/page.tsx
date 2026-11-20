"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Crown,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Loader2,
  MapPin,
  Moon,
  Receipt,
  Sun,
  User,
  UserCheck,
} from "lucide-react";
import { loginWithDemo } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");

  const [selectedRole, setSelectedRole] = React.useState<"kasir" | "pemilik">(
    "kasir"
  );
  const [shift, setShift] = React.useState<"pagi" | "malam">("malam");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState<
    "kasir" | "pemilik" | null
  >(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [infoToast, setInfoToast] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const email = identifier.includes("@")
        ? identifier.trim()
        : `${identifier.trim().toLowerCase()}@warmindo.com`;

      if (isSignUp) {
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) throw signUpError;

        if (authData.user) {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            role: "kasir",
            nama_lengkap: fullName || identifier,
            username: identifier.trim(),
            shift_default: shift === "pagi" ? "Pagi" : "Malam",
          });

          router.push("/transaksi");
          router.refresh();
          return;
        }
      }

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        const userRole = profile?.role ?? "kasir";
        const safeRedirect =
          redirectedFrom &&
          redirectedFrom.startsWith("/") &&
          !redirectedFrom.startsWith("//")
            ? redirectedFrom
            : null;
        if (userRole === "pemilik" || userRole === "admin") {
          router.push(safeRedirect || "/dashboard");
        } else {
          router.push(
            safeRedirect && !safeRedirect.startsWith("/dashboard")
              ? safeRedirect
              : "/transaksi"
          );
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Kredensial tidak valid. Periksa username/email dan kata sandi Anda.";
      if (msg.includes("Invalid login credentials")) {
        setErrorMsg(
          "Username atau PIN/Password salah. Untuk uji coba instan tanpa akun Supabase, gunakan tombol Demo di bawah."
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "kasir" | "pemilik") => {
    setSelectedRole(role);
    setErrorMsg(null);
    setDemoLoading(role);
    if (role === "kasir") {
      setIdentifier("santosa.kasir");
      setPassword("849201");
      setInfoToast(
        `Masuk sebagai Santosa (${
          shift === "pagi" ? "Shift Pagi" : "Shift Malam"
        })...`
      );
    } else {
      setIdentifier("rizki.owner@sumberrizki.id");
      setPassword("WarmindoSeturan2026#");
      setInfoToast("Masuk sebagai H. Rizki (Pemilik Outlet)...");
    }
    try {
      await loginWithDemo(role, shift);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setErrorMsg("Gagal masuk ke mode demo. Silakan coba lagi.");
      setDemoLoading(null);
    }
  };

  const isKasir = selectedRole === "kasir";

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-background font-sans">
      {/* LEFT HERO SHOWCASE */}
      <section className="relative lg:w-6/12 min-h-[260px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-warmindo.jpg"
            alt="Hidangan Warmindo Sumber Rizki 2 Seturan"
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/45" />
        </div>

        {/* Brand Identity */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="size-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-tight">
              SUMBER RIZKI
            </span>
            <p className="text-xs text-zinc-300">
              Warmindo Sumber Rizki 2, Seturan
            </p>
          </div>
        </div>

        {/* Core Product Statement */}
        <div className="relative z-10 max-w-lg my-8 lg:my-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
            Kasir POS, Antrean Dapur, dan CRM Pelanggan Seturan.
          </h1>
          <p className="mt-3 text-sm text-zinc-200 leading-relaxed">
            Catat pesanan meja, pantau waktu masak KDS, kelola kupon 10 stempel,
            dan balas keluhan pelanggan dari satu workspace.
          </p>
        </div>

        {/* Footer Location */}
        <div className="relative z-10 pt-4 hidden sm:flex items-center gap-2 text-xs text-zinc-300">
          <MapPin className="size-4 text-primary shrink-0" />
          <span>Jl. Seturan Raya No. 42, Depok, Sleman</span>
        </div>
      </section>

      {/* RIGHT AUTHENTICATION PANEL */}
      <section className="lg:w-6/12 min-h-screen flex flex-col justify-center px-5 sm:px-10 lg:px-14 py-10 bg-muted/30 relative z-20 border-l border-border">
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">
                {isSignUp ? "Daftar Akun Staf" : "Masuk ke SUMBER RIZKI"}
              </CardTitle>
              <CardDescription>
                Pilih peran untuk membuka workspace kasir atau pemilik.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              {/* Role Selector Tabs */}
              <Tabs
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as "kasir" | "pemilik")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="kasir">
                    <Receipt className="size-3.5" />
                    <span>Kasir Shift</span>
                  </TabsTrigger>
                  <TabsTrigger value="pemilik">
                    <Briefcase className="size-3.5" />
                    <span>Pemilik</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Concise Role Access Note */}
              <p className="px-3 py-2 rounded-lg bg-muted/60 border text-xs text-muted-foreground">
                {isKasir
                  ? "Akses Kasir: POS, Antrean Dapur, Pelanggan CRM, Keluhan, dan Quick Replies."
                  : "Akses Pemilik: Seluruh modul operasional ditambah Dashboard KPI dan omzet."}
              </p>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoToast && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-600/25 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>{infoToast}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="full-name" className="text-xs">
                      Nama Lengkap Staf / Pemilik
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Santosa"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="identifier" className="text-xs">
                    {isKasir
                      ? "Username / ID Karyawan / No. WhatsApp"
                      : "Email Pemilik Outlet / WhatsApp Terverifikasi"}
                  </Label>
                  <div className="relative">
                    <UserCheck className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        isKasir
                          ? "Contoh: santosa.kasir / 081298765432"
                          : "owner.seturan2@sumberrizki.id"
                      }
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-input" className="text-xs">
                      {isKasir
                        ? "PIN Kasir (6 Digit Angka)"
                        : "Kata Sandi Eksekutif"}
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      onClick={() =>
                        setErrorMsg(
                          "Hubungi Supervisor Shift atau Pemilik Outlet untuk reset PIN/Kata Sandi."
                        )
                      }
                      className="px-0 h-auto text-xs"
                    >
                      Lupa PIN / Sandi?
                    </Button>
                  </div>
                  <div className="relative">
                    <KeyRound className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="password-input"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isKasir ? "••••••" : "Masukkan kata sandi"}
                      className="pl-9 pr-10 font-mono tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Tampilkan / Sembunyikan PIN"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Shift Selector */}
                {isKasir && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-foreground">
                      Pilih Shift Kerja Saat Ini
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShift("pagi")}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          shift === "pagi"
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/40 hover:bg-muted"
                        }`}
                      >
                        <Sun className="size-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-foreground">
                            Shift Pagi
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            10:00 - 17:00
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShift("malam")}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          shift === "malam"
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/40 hover:bg-muted"
                        }`}
                      >
                        <Moon className="size-4 text-primary shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-foreground">
                            Shift Malam
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            17:00 - 04:00
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading || demoLoading !== null}
                    className="w-full font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {isSignUp
                            ? "Daftar & Masuk"
                            : isKasir
                            ? "Masuk Kasir POS"
                            : "Masuk Dashboard Pemilik"}
                        </span>
                        <ArrowRight data-icon="inline-end" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setIsSignUp((prev) => !prev);
                      setErrorMsg(null);
                    }}
                  >
                    {isSignUp
                      ? "Sudah punya akun? Masuk di sini"
                      : "Belum punya akun? Daftar staf"}
                  </Button>
                </div>
              </form>

              <div className="relative flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                  Atau masuk mode demo
                </span>
                <Separator className="flex-1" />
              </div>

              {/* 1-Click Quick Demo Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={demoLoading !== null}
                  onClick={() => handleQuickDemo("kasir")}
                  className="h-auto py-2.5 justify-start gap-2.5"
                >
                  <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {demoLoading === "kasir" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Demo Kasir
                    </p>
                    <p className="text-[11px] font-normal text-muted-foreground truncate">
                      Santosa (POS &amp; CRM)
                    </p>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={demoLoading !== null}
                  onClick={() => handleQuickDemo("pemilik")}
                  className="h-auto py-2.5 justify-start gap-2.5"
                >
                  <div className="size-8 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0">
                    {demoLoading === "pemilik" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Crown className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Demo Pemilik
                    </p>
                    <p className="text-[11px] font-normal text-muted-foreground truncate">
                      H. Rizki (Dashboard)
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
