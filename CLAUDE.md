# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server on localhost:3000
npm run build      # production build (also runs TypeScript check)
npm run lint       # ESLint
```

No test framework is configured yet. When adding tests, use Vitest (compatible with Next.js App Router without jest-environment-jsdom hacks).

## Architecture

This is a **Next.js 14 App Router** lead generation tool for Allium. A user enters a company name, receives an AI-generated stablecoin readiness report, and a lead record is silently appended to a Google Sheet.

### Request flow

```
POST /api/simulate
  └─ lib/pipeline/index.ts        ← orchestrates all data sources in parallel
       ├─ yfinance.ts             ← ticker, revenue, sector, HQ country (Yahoo Finance)
       ├─ fmp.ts                  ← geographic revenue segments (Financial Modeling Prep)
       ├─ abstractapi.ts          ← fallback enrichment for private companies
       ├─ opencorporates.ts       ← legal jurisdiction, company age
       ├─ exchangerate.ts         ← corridor FX spreads
       └─ worldbank.ts            ← hardcoded RPW remittance cost table + industry benchmarks
  └─ lib/claude.ts                ← assembles CompanyInput → Claude API → SimulatorReport JSON
  └─ lib/storage.ts               ← Neon Postgres: store by slug + cache by domain (DATABASE_URL)
  └─ lib/leads.ts                 ← fire-and-forget POST to Google Apps Script webhook
```

Report pages are served from `/report/[slug]` as server components — they fetch from `/api/report/[slug]` which reads from Postgres. No client-side Claude calls ever happen.

### Key design constraints

- **Every pipeline module is independently fault-tolerant**: each wraps its fetch in try/catch and returns `null` fields on failure. The Claude call proceeds even with partial data.
- **Claude does all scoring and dollar math**: the system prompt embeds the full scoring rubric and formulas. `lib/claude.ts` is a single function `generateReport(input: CompanyInput): Promise<SimulatorReport>` with one retry on JSON parse failure.
- **Dollar figures are displayed as ranges**: multiply point estimate by 0.7 (low) and 1.4 (high), formatted with `Intl.NumberFormat` compact notation. This happens in `DollarHighlights.tsx`.
- **Postgres is optional**: `lib/storage.ts` checks for `DATABASE_URL` (or `POSTGRES_URL`) at runtime and silently skips persistence if absent. The app works without DB configured (reports won't be shareable by URL).
- **Leads webhook is fire-and-forget**: `submitLead` in `lib/leads.ts` is called with `.catch()` only — it never blocks the response. Destination is a Google Apps Script URL in `LEADS_WEBHOOK_URL`.

### Types

`types/report.ts` is the single source of truth. `CompanyInput` is the assembled pipeline payload sent to Claude. `SimulatorReport` is Claude's structured JSON output. Both must stay in sync with the Claude system prompt in `lib/claude.ts`.

### Environment variables

Only `ANTHROPIC_API_KEY` is required to run end-to-end. All others degrade gracefully when absent: FMP/AbstractAPI/ExchangeRate calls return nulls, Postgres skips persistence without `DATABASE_URL`, `LEADS_WEBHOOK_URL` skips lead logging.

### Path alias

`@/*` resolves to the repo root (not `src/`). Import as `@/lib/...`, `@/types/...`, `@/components/...`.
