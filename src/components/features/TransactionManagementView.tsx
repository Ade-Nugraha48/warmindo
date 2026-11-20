"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Gift,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Send,
  UtensilsCrossed,
} from "lucide-react";
import {
  createTransaction,
  grantCompensation,
  markOrderServed,
  searchCustomerByWa,
} from "@/app/(admin)/transaksi/actions";
import { PosOrderPanel } from "@/components/features/PosOrderPanel";
import { LiveElapsedTimer } from "@/components/shared/LiveElapsedTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_LOYALTY_STAMPS } from "@/lib/constants";
import { formatRupiah, formatWaUrl, maskPhoneNumber } from "@/lib/formatters";
import type { Customer } from "@/types/database.types";
import type {
  CartLine,
  MenuCatalogItem,
  MenuCategoryKey,
  QuickReplyTemplate,
} from "@/types/pos.record";
import type {
  OrderItemLine,
  TransactionRecord,
} from "@/types/transaction.record";

interface TransactionManagementViewProps {
  initialTransactions: TransactionRecord[];
  menuCatalog: MenuCatalogItem[];
  initialCustomers: Customer[];
  quickReplies: QuickReplyTemplate[];
  initialNowMs: number;
  initialSearchQuery?: string;
}

const MENU_CATEGORIES: { key: MenuCategoryKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "indomie", label: "Indomie" },
  { key: "nasi", label: "Nasi & Magelangan" },
  { key: "minuman", label: "Minuman" },
  { key: "cemilan", label: "Gorengan & Snack" },
];

export function TransactionManagementView({
  initialTransactions,
  menuCatalog,
  initialCustomers,
  quickReplies,
  initialNowMs,
  initialSearchQuery = "",
}: TransactionManagementViewProps) {
  const [transactions, setTransactions] =
    React.useState<TransactionRecord[]>(initialTransactions);
  const [allCustomers, setAllCustomers] =
    React.useState<Customer[]>(initialCustomers);
  const [activeView, setActiveView] = React.useState<"pos" | "history">("pos");
  const [activeCategory, setActiveCategory] =
    React.useState<MenuCategoryKey>("all");
  const [menuSearch, setMenuSearch] = React.useState(initialSearchQuery);

  const [cart, setCart] = React.useState<CartLine[]>(() =>
    menuCatalog
      .slice(0, 2)
      .filter((m): m is MenuCatalogItem => Boolean(m))
      .map((menu) => ({
        menu,
        qty: 1,
        catatan: menu.default_note || "Pedas sedang",
      }))
  );

  const [waModalOpen, setWaModalOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [customerMode, setCustomerMode] = React.useState<"walkin" | "member">(
    "walkin"
  );
  const [guestName, setGuestName] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(initialCustomers[0] ?? null);
  const [customerQuery, setCustomerQuery] = React.useState("");
  const [customerResults, setCustomerResults] =
    React.useState<Customer[]>(initialCustomers);

  const [orderType, setOrderType] = React.useState<
    "Dine-in" | "Takeaway WA" | "Booking"
  >("Dine-in");
  const [tableNumber, setTableNumber] = React.useState("Meja 05");
  const [paymentMethod, setPaymentMethod] = React.useState<"Tunai" | "QRIS">(
    "QRIS"
  );
  const [promoBegadang, setPromoBegadang] = React.useState(true);
  const [claimReward, setClaimReward] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const subtotal = cart.reduce(
    (sum, line) => sum + line.menu.harga * line.qty,
    0
  );
  const discountAmount = promoBegadang ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const totalItemCount = cart.reduce((sum, l) => sum + l.qty, 0);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<MenuCategoryKey, number> = {
      all: menuCatalog.length,
      indomie: 0,
      nasi: 0,
      minuman: 0,
      cemilan: 0,
    };
    for (const item of menuCatalog) {
      counts[item.kategori] = (counts[item.kategori] ?? 0) + 1;
    }
    return counts;
  }, [menuCatalog]);

  const filteredMenu = React.useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return menuCatalog.filter((item) => {
      const catMatch =
        activeCategory === "all" || item.kategori === activeCategory;
      const qMatch =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [menuCatalog, activeCategory, menuSearch]);

  const cartQtyMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const line of cart) {
      map.set(line.menu.id, line.qty);
    }
    return map;
  }, [cart]);

  const addToCart = (item: MenuCatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.menu.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menu.id === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { menu: item, qty: 1, catatan: item.default_note }];
    });
  };

  const updateCartQty = (menuId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.menu.id === menuId ? { ...l, qty: l.qty + delta } : l
        )
        .filter((l) => l.qty > 0)
    );
  };

  const updateCartNote = (menuId: string, note: string) => {
    setCart((prev) =>
      prev.map((l) => (l.menu.id === menuId ? { ...l, catatan: note } : l))
    );
  };

  const removeCartItem = (menuId: string) => {
    setCart((prev) => prev.filter((l) => l.menu.id !== menuId));
  };

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!customerQuery.trim()) {
        setCustomerResults(allCustomers);
        return;
      }
      const res = await searchCustomerByWa(customerQuery);
      setCustomerResults(res);
    }, 200);
    return () => clearTimeout(timer);
  }, [customerQuery, allCustomers]);

  const handleCheckout = React.useCallback(async () => {
    if (cart.length === 0) {
      showToast("Keranjang masih kosong.");
      return;
    }

    const isWalkIn = customerMode === "walkin";
    if (!isWalkIn && !selectedCustomer) {
      showToast("Pilih Member CRM atau alihkan ke Tamu Umum.");
      return;
    }

    setIsSubmitting(true);
    const menuSummary = cart
      .map((l) => `${l.qty}x ${l.menu.nama}`)
      .join(", ");
    const orderLines: OrderItemLine[] = cart.map((l, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      nama: `${l.qty}x ${l.menu.nama}`,
      qty: l.qty,
      harga: l.menu.harga,
      catatan: l.catatan,
      stasiun: l.menu.stasiun_default,
      selesai: false,
    }));

    const res = await createTransaction({
      is_walkin: isWalkIn,
      customer_id: isWalkIn ? null : selectedCustomer!.id,
      guest_nama: isWalkIn ? guestName.trim() || undefined : undefined,
      menu_pesanan: menuSummary,
      jumlah_porsi: totalItemCount,
      total_harga: Math.max(1000, grandTotal),
      is_jam_sibuk: true,
      claim_reward: !isWalkIn && claimReward,
      nomor_meja: orderType === "Takeaway WA" ? "Takeaway" : tableNumber,
      tipe_pesanan: orderType,
      metode_bayar: paymentMethod,
      diskon_nominal: discountAmount,
      catatan_pesanan: cart.map((l) => l.catatan).join(" | "),
      order_items: orderLines,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setTransactions((prev) => [res.data!, ...prev]);
      if (!isWalkIn && selectedCustomer) {
        const updatedStamps = res.data.stempel_saat_ini;
        setSelectedCustomer((prev) =>
          prev ? { ...prev, stempel_loyalitas: updatedStamps } : prev
        );
        setAllCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id
              ? { ...c, stempel_loyalitas: updatedStamps }
              : c
          )
        );
      } else {
        setGuestName("");
      }
      setCart([]);
      setClaimReward(false);
      showToast(
        isWalkIn
          ? `Pesanan ${res.data.kode_order || ""} (${res.data.customer_nama}) dikirim ke Dapur.`
          : `Pesanan ${res.data.kode_order || ""} dikirim ke Dapur (stempel ${res.data.stempel_saat_ini}/${MAX_LOYALTY_STAMPS}).`
      );
    } else {
      showToast(res.error || "Gagal memproses pesanan.");
    }
  }, [
    cart,
    claimReward,
    customerMode,
    discountAmount,
    grandTotal,
    guestName,
    orderType,
    paymentMethod,
    selectedCustomer,
    tableNumber,
    totalItemCount,
  ]);

  const handlePrintReceipt = React.useCallback(() => {
    showToast("Mencetak struk ke printer thermal.");
  }, []);

  const handleSendWaReceipt = React.useCallback(() => {
    if (customerMode === "walkin" || !selectedCustomer) {
      showToast(
        "Mode Tamu Umum belum punya nomor WA. Gunakan tab Member CRM atau daftarkan member baru."
      );
      return;
    }
    const itemsText =
      cart.length > 0
        ? cart.map((l) => `- ${l.qty}x ${l.menu.nama}`).join("\n")
        : "- Pesanan Warmindo Sumber Rizki 2";
    const msg =
      `Halo Kak ${selectedCustomer.nama_panggilan}.\n` +
      `Rincian pesanan (${orderType} - ${tableNumber}):\n` +
      `${itemsText}\n` +
      `Total: ${formatRupiah(grandTotal)} (${paymentMethod})\n` +
      `Stempel Loyalitas: ${selectedCustomer.stempel_loyalitas ?? 0}/${MAX_LOYALTY_STAMPS}`;
    window.open(formatWaUrl(selectedCustomer.nomor_wa, msg), "_blank");
    showToast("Membuka WhatsApp struk digital.");
  }, [
    cart,
    customerMode,
    grandTotal,
    orderType,
    paymentMethod,
    selectedCustomer,
    tableNumber,
  ]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        e.preventDefault();
        void handleCheckout();
      } else if (e.key === "F9") {
        e.preventDefault();
        handlePrintReceipt();
      } else if (e.key === "F10") {
        e.preventDefault();
        handleSendWaReceipt();
      } else if (e.altKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault();
        setWaModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCheckout, handlePrintReceipt, handleSendWaReceipt]);

  const handleServeOrder = async (trxId: string) => {
    const res = await markOrderServed(trxId);
    if (res.success) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === trxId
            ? { ...t, waktu_saji: res.waktu_saji, status_dapur: "Selesai" }
            : t
        )
      );
      showToast("Pesanan selesai disajikan.");
    }
  };

  const handleGrantComp = async (trxId: string) => {
    const res = await grantCompensation(trxId);
    if (res.success) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === trxId ? { ...t, kompensasi_diberikan: true } : t
        )
      );
      showToast("Kompensasi Es Teh Rp0 dicatat.");
    }
  };

  const activeCustomerLabel =
    customerMode === "member"
      ? selectedCustomer?.nama_panggilan || "Pelanggan"
      : guestName.trim() || "Tamu Umum";
  const stampsCount = selectedCustomer?.stempel_loyalitas ?? 0;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium text-foreground tracking-tight">
            Kasir POS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Terima pesanan tamu umum maupun member CRM dan teruskan ke antrean
            dapur.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={activeView}
            onValueChange={(v) => setActiveView(v as "pos" | "history")}
          >
            <TabsList>
              <TabsTrigger value="pos">Buat Pesanan</TabsTrigger>
              <TabsTrigger value="history" className="tabular-nums">
                Riwayat Hari Ini ({transactions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type="button"
            variant="outline"
            onClick={() => setWaModalOpen(true)}
          >
            <MessageSquare data-icon="inline-start" />
            <span>Template WA</span>
          </Button>
        </div>
      </div>

      {activeView === "pos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Search + Full-Wrap Category Bar (no inner scrollbars) + Menu Grid */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Cari menu Indomie, Magelangan, Es Teh, atau camilan..."
                  className="pl-9 bg-card"
                />
              </div>

              <div
                role="group"
                aria-label="Filter kategori menu"
                className="flex flex-wrap items-center gap-1.5"
              >
                {MENU_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  const count = categoryCounts[cat.key] ?? 0;
                  return (
                    <Button
                      key={cat.key}
                      type="button"
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setActiveCategory(cat.key)}
                      className="rounded-full"
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`ml-1 text-[11px] tabular-nums ${
                          isActive
                            ? "text-primary-foreground/85"
                            : "text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {filteredMenu.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UtensilsCrossed />
                      </EmptyMedia>
                      <EmptyTitle>Menu tidak ditemukan</EmptyTitle>
                      <EmptyDescription>
                        Ubah kata kunci pencarian atau pilih kategori lain.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMenuSearch("");
                          setActiveCategory("all");
                        }}
                      >
                        Tampilkan semua menu
                      </Button>
                    </EmptyContent>
                  </Empty>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMenu.map((item) => {
                  const qtyInCart = cartQtyMap.get(item.id) ?? 0;
                  return (
                    <Card
                      key={item.id}
                      size="sm"
                      className={`justify-between transition-all ${
                        qtyInCart > 0
                          ? "ring-1 ring-primary/50 border-primary/40 shadow-xs"
                          : "hover:border-foreground/20"
                      }`}
                    >
                      <CardHeader>
                        <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.gambar_url}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                          {item.badge_tag && (
                            <span className="absolute top-2 left-2 rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                              {item.badge_tag}
                            </span>
                          )}
                          {qtyInCart > 0 && (
                            <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground tabular-nums shadow-xs">
                              {qtyInCart}x
                            </span>
                          )}
                        </div>
                        <CardTitle className="leading-snug text-sm">
                          {item.nama}
                        </CardTitle>
                      </CardHeader>

                      <CardFooter className="justify-between gap-2 pt-3 border-t">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {formatRupiah(item.harga)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.estimasi_menit}
                          </span>
                        </div>

                        {qtyInCart > 0 ? (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              onClick={() => updateCartQty(item.id, -1)}
                              aria-label={`Kurangi ${item.nama}`}
                            >
                              <Minus />
                            </Button>
                            <span className="text-xs font-semibold w-5 text-center tabular-nums">
                              {qtyInCart}
                            </span>
                            <Button
                              type="button"
                              size="icon-xs"
                              onClick={() => updateCartQty(item.id, 1)}
                              aria-label={`Tambah ${item.nama}`}
                            >
                              <Plus />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => addToCart(item)}
                          >
                            <Plus data-icon="inline-start" />
                            <span>Tambah</span>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Order Cart Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <PosOrderPanel
              cart={cart}
              customerMode={customerMode}
              onCustomerModeChange={setCustomerMode}
              guestName={guestName}
              onGuestNameChange={setGuestName}
              selectedCustomer={selectedCustomer}
              customerQuery={customerQuery}
              onCustomerQueryChange={setCustomerQuery}
              customerResults={customerResults}
              onSelectCustomer={(c) => {
                setSelectedCustomer(c);
                setClaimReward(false);
                setCustomerQuery("");
              }}
              onMemberCreated={(newCust) => {
                setAllCustomers((prev) => [newCust, ...prev]);
                setCustomerResults((prev) => [newCust, ...prev]);
                setSelectedCustomer(newCust);
                setCustomerMode("member");
                setClaimReward(false);
                setGuestName("");
                showToast(
                  `${newCust.nama_panggilan} terdaftar & dipilih (+1 stempel).`
                );
              }}
              onClearCart={() => setCart([])}
              onUpdateCartQty={updateCartQty}
              onUpdateCartNote={updateCartNote}
              onRemoveCartItem={removeCartItem}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              promoBegadang={promoBegadang}
              onPromoBegadangChange={setPromoBegadang}
              claimReward={claimReward}
              onClaimRewardChange={setClaimReward}
              subtotal={subtotal}
              discountAmount={discountAmount}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              onCheckout={handleCheckout}
              onPrintReceipt={handlePrintReceipt}
              onSendWaReceipt={handleSendWaReceipt}
            />
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UtensilsCrossed />
                </EmptyMedia>
                <EmptyTitle>Belum ada transaksi hari ini</EmptyTitle>
                <EmptyDescription>
                  Pesanan yang diproses kasir akan tercatat di sini beserta SLA.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Pesanan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Durasi SLA</TableHead>
                  <TableHead className="pr-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trx) => {
                  const elapsedMins =
                    ((trx.waktu_saji
                      ? new Date(trx.waktu_saji).getTime()
                      : initialNowMs) -
                      new Date(trx.waktu_pesan).getTime()) /
                    60000;
                  const isBreach = !trx.waktu_saji && elapsedMins > 20;
                  const isMemberTrx = Boolean(trx.customer_id);

                  return (
                    <TableRow key={trx.id}>
                      <TableCell className="pl-4">
                        <div className="font-semibold text-foreground tabular-nums">
                          {trx.kode_order || trx.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trx.nomor_meja || "Meja 01"} ·{" "}
                          {trx.tipe_pesanan || "Dine-in"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <span>{trx.customer_nama}</span>
                          {!isMemberTrx && (
                            <Badge variant="outline" className="text-[10px]">
                              Tamu
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {isMemberTrx
                            ? `${maskPhoneNumber(trx.customer_wa)} · ${trx.stempel_saat_ini}/${MAX_LOYALTY_STAMPS}`
                            : "Non-member"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-foreground truncate">
                          {trx.menu_pesanan}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground tabular-nums">
                        {formatRupiah(trx.total_harga)}
                      </TableCell>
                      <TableCell className="text-right">
                        {trx.waktu_saji ? (
                          <Badge
                            variant="success"
                            className="tabular-nums"
                          >
                            Selesai ({Math.round(elapsedMins)}m)
                          </Badge>
                        ) : (
                          <LiveElapsedTimer
                            sinceIso={trx.waktu_pesan}
                            initialNowMs={initialNowMs}
                            className={`font-semibold ${
                              isBreach ? "text-destructive" : "text-foreground"
                            }`}
                          />
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBreach && !trx.kompensasi_diberikan && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => void handleGrantComp(trx.id)}
                            >
                              <Gift data-icon="inline-start" />
                              <span>Es Teh Rp0</span>
                            </Button>
                          )}
                          {!trx.waktu_saji && (
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => void handleServeOrder(trx.id)}
                            >
                              Saji
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Quick Replies Modal */}
      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template WhatsApp Kasir</DialogTitle>
            <DialogDescription>Tujuan: {activeCustomerLabel}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {quickReplies.slice(0, 4).map((tpl) => {
              const populated = tpl.isi_pesan
                .replace("{nama_pelanggan}", activeCustomerLabel)
                .replace("{nomor_meja}", tableNumber)
                .replace("{menu_terlambat}", "Indomie Dok-Dok Nyemek")
                .replace(
                  "{kampus_pelanggan}",
                  customerMode === "member"
                    ? selectedCustomer?.segmen || "UPN"
                    : "UPN"
                )
                .replace(
                  "{sisa_stempel}",
                  String(customerMode === "member" ? stampsCount : 0)
                );

              return (
                <Card key={tpl.id} size="sm">
                  <CardHeader>
                    <CardTitle className="font-mono text-xs text-primary">
                      {tpl.shortcut} · {tpl.judul}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                      {populated}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        void navigator.clipboard.writeText(populated);
                        setCopiedId(tpl.id);
                        setTimeout(() => setCopiedId(null), 1600);
                      }}
                    >
                      {copiedId === tpl.id ? (
                        <Check
                          data-icon="inline-start"
                          className="text-emerald-600"
                        />
                      ) : (
                        <Copy data-icon="inline-start" />
                      )}
                      <span>{copiedId === tpl.id ? "Disalin" : "Salin"}</span>
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => {
                        if (
                          customerMode !== "member" ||
                          !selectedCustomer?.nomor_wa
                        ) {
                          showToast(
                            "Pilih Member CRM agar pesan WA bisa langsung dikirim."
                          );
                          return;
                        }
                        window.open(
                          formatWaUrl(selectedCustomer.nomor_wa, populated),
                          "_blank"
                        );
                        setWaModalOpen(false);
                      }}
                    >
                      <Send data-icon="inline-start" />
                      <span>Kirim</span>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
