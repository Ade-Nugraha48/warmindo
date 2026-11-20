"use client";

import * as React from "react";
import {
  CheckCircle2,
  Gift,
  MessageSquare,
  Minus,
  Plus,
  Printer,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { AddCustomerDialog } from "@/components/features/AddCustomerDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_LOYALTY_STAMPS } from "@/lib/constants";
import { formatRupiah, maskPhoneNumber } from "@/lib/formatters";
import type { Customer } from "@/types/database.types";
import type { CartLine } from "@/types/pos.record";

const TABLE_OPTIONS = [
  { value: "Meja 01", label: "Meja 01" },
  { value: "Meja 02", label: "Meja 02" },
  { value: "Meja 03", label: "Meja 03" },
  { value: "Meja 04", label: "Meja 04" },
  { value: "Meja 05", label: "Meja 05" },
  { value: "Meja 06", label: "Meja 06" },
  { value: "Meja 07", label: "Meja 07" },
  { value: "Meja 08", label: "Meja 08" },
];

const PAYMENT_OPTIONS = [
  { value: "QRIS", label: "QRIS" },
  { value: "Tunai", label: "Tunai" },
];

interface PosOrderPanelProps {
  cart: CartLine[];
  customerMode: "walkin" | "member";
  onCustomerModeChange: (mode: "walkin" | "member") => void;
  guestName: string;
  onGuestNameChange: (val: string) => void;
  selectedCustomer: Customer | null;
  customerQuery: string;
  onCustomerQueryChange: (val: string) => void;
  customerResults: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  onMemberCreated: (cust: Customer) => void;
  onClearCart: () => void;
  onUpdateCartQty: (menuId: string, delta: number) => void;
  onUpdateCartNote: (menuId: string, note: string) => void;
  onRemoveCartItem: (menuId: string) => void;
  orderType: "Dine-in" | "Takeaway WA" | "Booking";
  onOrderTypeChange: (t: "Dine-in" | "Takeaway WA" | "Booking") => void;
  tableNumber: string;
  onTableNumberChange: (t: string) => void;
  paymentMethod: "Tunai" | "QRIS";
  onPaymentMethodChange: (m: "Tunai" | "QRIS") => void;
  promoBegadang: boolean;
  onPromoBegadangChange: (v: boolean) => void;
  claimReward: boolean;
  onClaimRewardChange: (v: boolean) => void;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  isSubmitting: boolean;
  onCheckout: () => void;
  onPrintReceipt: () => void;
  onSendWaReceipt: () => void;
}

export function PosOrderPanel({
  cart,
  customerMode,
  onCustomerModeChange,
  guestName,
  onGuestNameChange,
  selectedCustomer,
  customerQuery,
  onCustomerQueryChange,
  customerResults,
  onSelectCustomer,
  onMemberCreated,
  onClearCart,
  onUpdateCartQty,
  onUpdateCartNote,
  onRemoveCartItem,
  orderType,
  onOrderTypeChange,
  tableNumber,
  onTableNumberChange,
  paymentMethod,
  onPaymentMethodChange,
  promoBegadang,
  onPromoBegadangChange,
  claimReward,
  onClaimRewardChange,
  subtotal,
  discountAmount,
  grandTotal,
  isSubmitting,
  onCheckout,
  onPrintReceipt,
  onSendWaReceipt,
}: PosOrderPanelProps) {
  const [searchingMember, setSearchingMember] = React.useState(false);
  const stampsCount = selectedCustomer?.stempel_loyalitas ?? 0;
  const totalQty = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <Card className="sticky top-20 shadow-xs">
      <CardHeader className="border-b gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">
            Ringkasan Pesanan
          </CardTitle>
          <Badge variant="secondary" className="tabular-nums">
            {totalQty} item
          </Badge>
        </div>

        {/* Mode Pemesan: Tamu Umum (Non-Member) vs Member CRM */}
        <Tabs
          value={customerMode}
          onValueChange={(v) => {
            const nextMode = v as "walkin" | "member";
            onCustomerModeChange(nextMode);
            if (nextMode === "member" && !selectedCustomer) {
              setSearchingMember(true);
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="walkin" className="text-xs">
              <Users className="size-3.5" />
              <span>Tamu Umum</span>
            </TabsTrigger>
            <TabsTrigger value="member" className="text-xs">
              <UserCheck className="size-3.5" />
              <span>Member CRM</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {customerMode === "walkin" ? (
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="pos-walkin-guest"
                className="text-xs font-medium text-foreground"
              >
                Pemesan Baru / Non-Member
              </Label>
              <Badge variant="outline" className="text-[11px] bg-card">
                Tanpa Daftar
              </Badge>
            </div>
            <Input
              id="pos-walkin-guest"
              type="text"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              placeholder="Nama pemesan (opsional, misal: Budi)"
              className="h-8 text-xs bg-card"
            />
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[11px] text-muted-foreground">
                Mau kumpulkan stempel?
              </span>
              <AddCustomerDialog
                defaultName={guestName}
                onCustomerAdded={onMemberCreated}
                trigger={
                  <Button type="button" variant="outline" size="xs">
                    <UserPlus data-icon="inline-start" />
                    <span>Daftar Member (+1)</span>
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground truncate">
                  {selectedCustomer?.nama_panggilan || "Pilih Member CRM"}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {selectedCustomer?.nomor_wa
                    ? `${maskPhoneNumber(selectedCustomer.nomor_wa)} · ${selectedCustomer.segmen || "Umum"}`
                    : "Cari 4 digit akhir WA atau daftar member baru"}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setSearchingMember((prev) => !prev)}
                >
                  {searchingMember ? "Tutup" : selectedCustomer ? "Ganti" : "Cari"}
                </Button>
                <AddCustomerDialog
                  onCustomerAdded={onMemberCreated}
                  trigger={
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      aria-label="Daftar member baru"
                      title="Daftar member baru"
                    >
                      <UserPlus />
                    </Button>
                  }
                />
              </div>
            </div>

            {selectedCustomer && !searchingMember && (
              <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/35 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Stempel Loyalitas
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {stampsCount}/{MAX_LOYALTY_STAMPS}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: MAX_LOYALTY_STAMPS }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-colors ${
                        idx < stampsCount
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                {selectedCustomer.preferensi_racikan && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5 truncate">
                    <Sparkles className="size-3 text-primary shrink-0" />
                    <span className="truncate">
                      Racikan: {selectedCustomer.preferensi_racikan}
                    </span>
                  </p>
                )}
              </div>
            )}

            {(searchingMember || !selectedCustomer) && (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={customerQuery}
                    onChange={(e) => onCustomerQueryChange(e.target.value)}
                    placeholder="Ketik 4 digit akhir WA atau nama..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-border border rounded-lg bg-card">
                  {customerResults.length === 0 ? (
                    <div className="p-3 text-center flex flex-col items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Member tidak ditemukan.
                      </span>
                      <AddCustomerDialog
                        defaultName={customerQuery}
                        onCustomerAdded={onMemberCreated}
                        trigger={
                          <Button type="button" variant="outline" size="xs">
                            <UserPlus data-icon="inline-start" />
                            <span>Daftarkan sebagai Member</span>
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    customerResults.slice(0, 6).map((c) => {
                      const active = selectedCustomer?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            onSelectCustomer(c);
                            setSearchingMember(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 hover:bg-muted flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            active ? "bg-primary/5" : ""
                          }`}
                        >
                          <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                            {active && (
                              <CheckCircle2 className="size-3 text-primary shrink-0" />
                            )}
                            <span className="truncate">
                              {c.nama_panggilan} ({maskPhoneNumber(c.nomor_wa)})
                            </span>
                          </span>
                          <Badge
                            variant="secondary"
                            className="tabular-nums shrink-0"
                          >
                            {c.stempel_loyalitas ?? 0}/{MAX_LOYALTY_STAMPS}
                          </Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {stampsCount >= MAX_LOYALTY_STAMPS && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#16a34a]/25 bg-[#f0fdf4] px-3 py-2">
                <Label
                  htmlFor="pos-claim-reward"
                  className="flex items-center gap-2 text-xs font-medium text-[#15803d] cursor-pointer"
                >
                  <Gift className="size-3.5 shrink-0" />
                  <span>Tukar kupon penuh (Gratis 1 porsi)</span>
                </Label>
                <Checkbox
                  id="pos-claim-reward"
                  checked={claimReward}
                  onCheckedChange={(v) => onClaimRewardChange(Boolean(v))}
                />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Cart Items */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Item Pesanan
            </span>
            {cart.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" />
                <span>Kosongkan</span>
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 px-4 flex flex-col items-center justify-center text-center gap-1.5 text-muted-foreground">
              <ShoppingBag className="size-5 opacity-60" />
              <p className="text-xs">
                Belum ada item dipilih. Klik Tambah pada menu di sebelah kiri.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[240px] overflow-y-auto pr-1">
              {cart.map((line) => (
                <div
                  key={line.menu.id}
                  className="py-2.5 first:pt-0 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground truncate">
                      {line.menu.nama}
                    </span>
                    <span className="font-semibold text-foreground tabular-nums shrink-0">
                      {formatRupiah(line.menu.harga * line.qty)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="text"
                      value={line.catatan}
                      onChange={(e) =>
                        onUpdateCartNote(line.menu.id, e.target.value)
                      }
                      placeholder="Catatan racikan..."
                      className="h-7 text-xs bg-muted/40"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        onClick={() => onUpdateCartQty(line.menu.id, -1)}
                        aria-label={`Kurangi ${line.menu.nama}`}
                      >
                        <Minus />
                      </Button>
                      <span className="text-xs font-semibold w-5 text-center tabular-nums">
                        {line.qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        onClick={() => onUpdateCartQty(line.menu.id, 1)}
                        aria-label={`Tambah ${line.menu.nama}`}
                      >
                        <Plus />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemoveCartItem(line.menu.id)}
                        aria-label={`Hapus ${line.menu.nama}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Order Mode & Payment */}
        <div className="flex flex-col gap-3">
          <Tabs
            value={orderType}
            onValueChange={(v) =>
              onOrderTypeChange(v as "Dine-in" | "Takeaway WA" | "Booking")
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Dine-in" className="text-xs">
                Dine-in
              </TabsTrigger>
              <TabsTrigger value="Takeaway WA" className="text-xs">
                Takeaway
              </TabsTrigger>
              <TabsTrigger value="Booking" className="text-xs">
                Booking
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={tableNumber}
              onValueChange={(v) => v && onTableNumberChange(v)}
              items={TABLE_OPTIONS}
              disabled={orderType === "Takeaway WA"}
            >
              <SelectTrigger aria-label="Pilih nomor meja" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TABLE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                v && onPaymentMethodChange(v as "Tunai" | "QRIS")
              }
              items={PAYMENT_OPTIONS}
            >
              <SelectTrigger aria-label="Metode pembayaran" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PAYMENT_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="pos-promo-begadang"
              className="text-xs font-normal text-foreground cursor-pointer"
            >
              Promo Begadang Nugas (10%)
            </Label>
            <Checkbox
              id="pos-promo-begadang"
              checked={promoBegadang}
              onCheckedChange={(v) => onPromoBegadangChange(Boolean(v))}
            />
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatRupiah(subtotal)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span>Diskon 10%</span>
              <span className="tabular-nums">
                -{formatRupiah(discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total Bayar</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting || cart.length === 0}
          onClick={onCheckout}
          className="w-full font-semibold"
        >
          <Send data-icon="inline-start" />
          <span>{isSubmitting ? "Memproses..." : "Proses Pesanan (F8)"}</span>
        </Button>

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrintReceipt}
          >
            <Printer data-icon="inline-start" />
            <span>Struk (F9)</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSendWaReceipt}
          >
            <MessageSquare data-icon="inline-start" />
            <span>WA Struk (F10)</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
