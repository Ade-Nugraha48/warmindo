"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Loader2,
  Megaphone,
  MessageSquareText,
  Play,
  PlusCircle,
  Search,
  Send,
} from "lucide-react";
import {
  createQuickReply,
  updateQuickReplyTemplate,
} from "@/app/(admin)/quick-replies/actions";
import { BroadcastModal } from "@/components/features/BroadcastModal";
import { CampaignHistoryTable } from "@/components/features/CampaignHistoryTable";
import { PassiveCustomerTable } from "@/components/features/PassiveCustomerTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatWaUrl } from "@/lib/formatters";
import type {
  CampaignLogRecord,
  PassiveCustomer,
} from "@/types/campaign.record";
import type {
  QuickReplyCategory,
  QuickReplyTemplate,
} from "@/types/pos.record";

interface QuickRepliesViewProps {
  initialTemplates: QuickReplyTemplate[];
  passiveCustomers: PassiveCustomer[];
  campaignLogs: CampaignLogRecord[];
  initialSearchQuery?: string;
}

const TEMPLATE_CATEGORIES: { key: QuickReplyCategory; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "sla", label: "SLA" },
  { key: "order", label: "Order" },
  { key: "promo", label: "Promo" },
  { key: "facility", label: "Meja" },
  { key: "greeting", label: "Greeting" },
];

const NEW_CATEGORY_OPTIONS = [
  { value: "sla", label: "SLA" },
  { value: "order", label: "Pesanan" },
  { value: "promo", label: "Promo" },
  { value: "facility", label: "Meja / WiFi" },
  { value: "greeting", label: "Greeting" },
];

const NEW_TRIGGER_OPTIONS = [
  { value: "Manual Kasir", label: "Manual Kasir" },
  { value: "Auto KDS", label: "Auto KDS" },
  { value: "Auto CRM", label: "Auto CRM" },
];

export function QuickRepliesView({
  initialTemplates,
  passiveCustomers,
  campaignLogs,
  initialSearchQuery = "",
}: QuickRepliesViewProps) {
  const router = useRouter();
  const [templates, setTemplates] =
    React.useState<QuickReplyTemplate[]>(initialTemplates);
  const [activeSubPage, setActiveSubPage] = React.useState<
    "templates" | "reactivation"
  >("templates");
  const [activeCategory, setActiveCategory] =
    React.useState<QuickReplyCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);

  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>(
    initialTemplates[0]?.id || ""
  );
  const [editorText, setEditorText] = React.useState(
    initialTemplates[0]?.isi_pesan || ""
  );
  const [activeShortcut, setActiveShortcut] = React.useState(
    initialTemplates[0]?.shortcut || "/sla-teh"
  );
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [savingPrimary, setSavingPrimary] = React.useState(false);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = React.useState(false);
  const [newShortcut, setNewShortcut] = React.useState("/");
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] =
    React.useState<QuickReplyTemplate["kategori"]>("order");
  const [newTriggerMode, setNewTriggerMode] =
    React.useState<QuickReplyTemplate["trigger_mode"]>("Manual Kasir");
  const [newMessage, setNewMessage] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const populateVariables = React.useCallback((raw: string) => {
    return raw
      .replaceAll("{nama_pelanggan}", "Dimas Arya")
      .replaceAll("{nomor_meja}", "03")
      .replaceAll("{menu_terlambat}", "Indomie Dok-Dok Nyemek")
      .replaceAll("{kampus_pelanggan}", "UPN Veteran")
      .replaceAll("{kode_voucher}", "SETURAN-FREE-TEH")
      .replaceAll("{sisa_stempel}", "10");
  }, []);

  const previewText = React.useMemo(
    () => populateVariables(editorText),
    [editorText, populateVariables]
  );

  const loadTemplateToSimulator = React.useCallback(
    (tpl: QuickReplyTemplate) => {
      setSelectedTemplateId(tpl.id);
      setEditorText(tpl.isi_pesan);
      setActiveShortcut(tpl.shortcut);
    },
    []
  );

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const shortcutMap: Record<string, string> = {
        "1": "/menu-malam",
        "2": "/sla-teh",
        "3": "/tukar-stempel",
        "4": "/wifi-lemot",
      };
      const targetCmd = shortcutMap[e.key];
      if (targetCmd) {
        const found = templates.find((t) => t.shortcut === targetCmd);
        if (found) {
          e.preventDefault();
          loadTemplateToSimulator(found);
          showToast(`Memuat ${found.shortcut}`);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [templates, loadTemplateToSimulator]);

  const filteredTemplates = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((tpl) => {
      const catOk =
        activeCategory === "all" || tpl.kategori === activeCategory;
      const qOk =
        !q ||
        tpl.shortcut.toLowerCase().includes(q) ||
        tpl.judul.toLowerCase().includes(q) ||
        tpl.isi_pesan.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [templates, activeCategory, searchQuery]);

  const insertVariable = (token: string) => {
    const el = textareaRef.current;
    if (!el) {
      setEditorText((prev) => `${prev} ${token}`.trim());
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = editorText.slice(0, start) + token + editorText.slice(end);
    setEditorText(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    }, 10);
  };

  const handleSavePrimary = async () => {
    if (!selectedTemplateId) return;
    setSavingPrimary(true);
    await updateQuickReplyTemplate(selectedTemplateId, editorText, true);
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplateId
          ? { ...t, isi_pesan: editorText, is_primary_kasir: true }
          : t
      )
    );
    setSavingPrimary(false);
    showToast("Template disimpan.");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;
    setIsCreating(true);
    const res = await createQuickReply({
      shortcut: newShortcut,
      judul: newTitle,
      kategori: newCategory,
      isi_pesan: newMessage,
      trigger_mode: newTriggerMode,
    });
    setIsCreating(false);
    if (res.success && res.data) {
      setTemplates((prev) => [res.data!, ...prev]);
      loadTemplateToSimulator(res.data);
      setCreateModalOpen(false);
      setNewShortcut("/");
      setNewTitle("");
      setNewMessage("");
      showToast(`Template ${res.data.shortcut} dibuat.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[28px] leading-8 font-medium text-foreground tracking-tight">
            Quick Replies WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
            {templates.length} template respon cepat dan kampanye pelanggan pasif.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={activeSubPage}
            onValueChange={(v) =>
              setActiveSubPage(v as "templates" | "reactivation")
            }
          >
            <TabsList>
              <TabsTrigger value="templates">Template (/cmd)</TabsTrigger>
              <TabsTrigger value="reactivation">Reaktivasi Pasif</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type="button"
            variant="outline"
            onClick={() => setBroadcastModalOpen(true)}
          >
            <Megaphone data-icon="inline-start" />
            <span>Broadcast</span>
          </Button>

          <Button type="button" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle data-icon="inline-start" />
            <span>Tambah Template</span>
          </Button>
        </div>
      </div>

      {activeSubPage === "templates" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Search, Categories & Template List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari /shortcut atau judul..."
                  className="pl-9"
                />
              </div>

              <Tabs
                value={activeCategory}
                onValueChange={(v) =>
                  setActiveCategory(v as QuickReplyCategory)
                }
              >
                <TabsList className="flex-wrap h-auto">
                  {TEMPLATE_CATEGORIES.map((tab) => (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {filteredTemplates.length === 0 ? (
                  <div className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MessageSquareText />
                        </EmptyMedia>
                        <EmptyTitle>Template tidak ditemukan</EmptyTitle>
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
                            setSearchQuery("");
                            setActiveCategory("all");
                          }}
                        >
                          Tampilkan semua template
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </div>
                ) : (
                  filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => loadTemplateToSimulator(tpl)}
                        className={`p-4 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className="font-mono"
                            >
                              {tpl.shortcut}
                            </Badge>
                            <span className="text-sm font-semibold text-foreground truncate">
                              {tpl.judul}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {tpl.isi_pesan}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary">{tpl.trigger_mode}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadTemplateToSimulator(tpl);
                            }}
                            aria-label={`Muat ${tpl.shortcut}`}
                          >
                            <Play />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              const populated = populateVariables(
                                tpl.isi_pesan
                              );
                              void navigator.clipboard.writeText(populated);
                              setCopiedId(tpl.id);
                              setTimeout(() => setCopiedId(null), 1600);
                              showToast(`Teks ${tpl.shortcut} disalin.`);
                            }}
                            aria-label={`Salin ${tpl.shortcut}`}
                          >
                            {copiedId === tpl.id ? (
                              <Check className="text-emerald-600" />
                            ) : (
                              <Copy />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Message Editor & WA Preview */}
          <Card className="lg:col-span-5 sticky top-20">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold">
                Editor &amp; Pratinjau WhatsApp
              </CardTitle>
              <CardDescription>
                Shortcut aktif:{" "}
                <span className="font-mono font-medium text-foreground">
                  {activeShortcut}
                </span>
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="font-mono">
                  Alt+1..4
                </Badge>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* Live Preview WhatsApp Chat Frame */}
              <div className="rounded-xl bg-muted/50 border p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                  <span className="font-medium text-foreground">
                    Simulasi Chat: Dimas Arya
                  </span>
                  <span className="tabular-nums">Meja 03</span>
                </div>
                <div className="ml-auto w-[94%] rounded-xl rounded-tr-xs border border-[#16a34a]/20 bg-[#f0fdf4] p-3 flex flex-col gap-1.5">
                  <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                    {previewText}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#15803d] tabular-nums">
                    <span>19:42</span>
                    <Check className="size-3" />
                  </div>
                </div>
              </div>

              {/* Variable Chips */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Sisipkan variabel:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "{nama_pelanggan}",
                    "{nomor_meja}",
                    "{menu_terlambat}",
                    "{kode_voucher}",
                    "{sisa_stempel}",
                  ].map((token) => (
                    <Button
                      key={token}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => insertVariable(token)}
                      className="font-mono"
                    >
                      {token}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="template-editor-text" className="text-xs">
                  Isi Template
                </Label>
                <Textarea
                  ref={textareaRef}
                  id="template-editor-text"
                  rows={4}
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  className="text-xs leading-relaxed resize-none"
                />
              </div>
            </CardContent>

            <CardFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingPrimary}
                onClick={handleSavePrimary}
                className="flex-1"
              >
                {savingPrimary ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  window.open(
                    formatWaUrl("081398765432", previewText),
                    "_blank"
                  );
                  showToast("Membuka WhatsApp.");
                }}
              >
                <Send data-icon="inline-start" />
                <span>Tes Kirim WA</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Pelanggan Pasif (&gt;14 Hari)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kontak yang lama tidak berkunjung dengan izin promo WA aktif.
              </p>
            </div>
            <PassiveCustomerTable
              initialCustomers={passiveCustomers}
              onLogRecorded={() => router.refresh()}
            />
          </div>

          <CampaignHistoryTable logs={campaignLogs} />
        </div>
      )}

      {/* Create Template Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Template Baru</DialogTitle>
            <DialogDescription>
              Simpan shortcut cepat untuk balasan WhatsApp kasir atau CRM.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-new-shortcut" className="text-xs">
                  Shortcut (/cmd) *
                </Label>
                <Input
                  id="qr-new-shortcut"
                  type="text"
                  required
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="/menu-spesial"
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Kategori</Label>
                <Select
                  value={newCategory}
                  onValueChange={(v) =>
                    v &&
                    setNewCategory(v as QuickReplyTemplate["kategori"])
                  }
                  items={NEW_CATEGORY_OPTIONS}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {NEW_CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qr-new-title" className="text-xs">
                  Judul Template *
                </Label>
                <Input
                  id="qr-new-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Promo Paket Malam"
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Trigger</Label>
                <Select
                  value={newTriggerMode}
                  onValueChange={(v) =>
                    v &&
                    setNewTriggerMode(v as QuickReplyTemplate["trigger_mode"])
                  }
                  items={NEW_TRIGGER_OPTIONS}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {NEW_TRIGGER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qr-new-message" className="text-xs">
                Isi Pesan *
              </Label>
              <Textarea
                id="qr-new-message"
                required
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Gunakan {nama_pelanggan}, {nomor_meja}..."
                className="text-xs"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                <span>Simpan Template</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BroadcastModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        onBroadcastSuccess={() => router.refresh()}
      />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
