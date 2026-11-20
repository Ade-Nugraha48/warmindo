<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# AGENTS.md — Multi-Agent Engineering Governance & Workflow

> **Project:** `WarminDOS — Warmindo Sumber Rizki 2 (Seturan)`
> **Workspace Path:** `d:\Perkuliahan\Semester 5\MHP\project\warmindo`
> **Tech Stack & Context:** `Next.js 16.4.6 (App Router, Turbopack, Cache Components), React 19, TypeScript 5, Tailwind CSS v4 (Warm Hospitality & Operations Engine tokens), shadcn/ui, Supabase PostgreSQL (@supabase/ssr)`

## Project Architecture Summary
- **Routes (`src/app/`):**
  - `/login` — Split-hero RBAC login (Kasir Shift Pagi/Malam vs Pemilik Executive + 1-click Demo Auth)
  - `/dashboard` — Executive KPI & Owner Analytics (`pemilik` / `admin` only, guarded by `src/proxy.ts`)
  - `/transaksi` — Kasir & POS Operations (Menu catalog, CRM lookup, 10-stamp tracker, bottom order drawer, SLA monitor)
  - `/antrean-dapur` — Kitchen Display System (KDS Kanban & SLA Telemetry Table, per-item checklists, auto Es Teh compensation)
  - `/pelanggan` — CRM Pelanggan Single Customer View (10-stamp card, racikan preferences, promo opt-in toggle)
  - `/keluhan` — Ticketing & SLA Follow-up Engine (priority queue + Kanban toggle, KDS audit chronology, WA draft)
  - `/quick-replies` & `/promo` — WhatsApp Quick Replies (`/cmd` simulator + keyboard cheat sheet) & Passive Customer Reactivation (>14 days)
- **Database Schema:** `supabase_schema.sql` (v1 base) + `supabase_migration_v2.sql` (v2 extensions: `menu_items`, `wa_quick_replies`, 10-stamp constraint, KDS order fields, ticket audit chronology, `Mahasiswa YKPN` enum).

## Orchestrator Configuration & Team Protocol
- **Active Orchestrator:** `alan` (Principal Software Engineer) by default unless overridden at runtime.
- **Role Roster:** `alan` (PSE), `santosa` (LSE), `mirow` (SSE1 Backend), `khafid` (SSE2 Frontend), `anap` (Senior UI/UX Designer).
- **Workflow:** `PLAN` → `CODE` → `REVIEW` with strict cross-review integrity (no self-approval) and structured `[<agent> - Current Stage: PLAN | CODE | REVIEW]` handoffs.
