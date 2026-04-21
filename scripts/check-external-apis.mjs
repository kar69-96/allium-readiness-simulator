#!/usr/bin/env node
/**
 * Health checks for external services used by the pipeline (excludes Anthropic).
 * Loads ../.env if present. Does not print API keys or tokens.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

function loadDotEnv() {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

const ua = { "User-Agent": "allium-readiness-simulator/health-check" };

function ok(name, pass, detail) {
  const s = pass ? "OK" : "FAIL";
  console.log(`[${s}] ${name}${detail ? ` — ${detail}` : ""}`);
  return pass;
}

function warn(name, detail) {
  console.log(`[WARN] ${name}${detail ? ` — ${detail}` : ""}`);
}

function skip(name, reason) {
  console.log(`[SKIP] ${name} — ${reason}`);
}

async function main() {
  console.log("External API checks (Anthropic excluded)\n");

  /** Fails that usually mean wrong/missing credentials or bad KV config */
  let actionable = 0;
  /** Any non-OK check including IP-sensitive endpoints */
  let totalFailed = 0;

  // Yahoo Finance (search + quoteSummary on a known US ticker)
  try {
    const searchUrl =
      "https://query2.finance.yahoo.com/v1/finance/search?q=Apple&quotesCount=5";
    const r = await fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!ok("Yahoo Finance (search)", r.ok, `HTTP ${r.status}`)) {
      totalFailed++;
      actionable++;
    }
    const sumUrl =
      "https://query2.finance.yahoo.com/v10/finance/quoteSummary/AAPL?modules=assetProfile";
    const r2 = await fetch(sumUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (r2.status === 401) {
      warn(
        "Yahoo Finance (quoteSummary AAPL)",
        "HTTP 401 — Yahoo often blocks quoteSummary from cloud/datacenter IPs; may still work from your laptop"
      );
      totalFailed++;
    } else if (!ok("Yahoo Finance (quoteSummary AAPL)", r2.ok, `HTTP ${r2.status}`)) {
      totalFailed++;
      actionable++;
    }
  } catch (e) {
    ok("Yahoo Finance", false, String(e.message || e));
    totalFailed++;
    actionable++;
  }

  // OpenCorporates
  try {
    const url =
      "https://api.opencorporates.com/v0.4/companies/search?q=test&per_page=1";
    const r = await fetch(url, { headers: ua });
    if (r.status === 401) {
      warn(
        "OpenCorporates",
        "HTTP 401 — may require an API token or block some server IPs; pipeline treats failures as nulls"
      );
      totalFailed++;
    } else if (!ok("OpenCorporates", r.ok, `HTTP ${r.status}`)) {
      totalFailed++;
      actionable++;
    }
  } catch (e) {
    ok("OpenCorporates", false, String(e.message || e));
    totalFailed++;
    actionable++;
  }

  // FMP
  const fmpKey = process.env.FMP_API_KEY?.trim();
  if (!fmpKey) {
    skip("Financial Modeling Prep", "FMP_API_KEY not set");
  } else {
    try {
      const url = `https://financialmodelingprep.com/api/v3/revenue-geographic-segmentation?symbol=AAPL&apikey=${encodeURIComponent(fmpKey)}`;
      const r = await fetch(url);
      const text = await r.text();
      let detail = `HTTP ${r.status}`;
      if (r.ok) {
        try {
          const arr = JSON.parse(text);
          detail += Array.isArray(arr) ? ` (${arr.length} row(s))` : " (unexpected shape)";
        } catch {
          detail += " (non-JSON body)";
        }
      }
      if (!ok("Financial Modeling Prep", r.ok, detail)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("Financial Modeling Prep", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  // Abstract Company Enrichment
  const abstractKey = process.env.ABSTRACT_API_KEY?.trim();
  if (!abstractKey) {
    skip("Abstract API (company enrichment)", "ABSTRACT_API_KEY not set");
  } else {
    try {
      const url = `https://companyenrichment.abstractapi.com/v1/?api_key=${encodeURIComponent(abstractKey)}&name=${encodeURIComponent("Stripe")}`;
      const r = await fetch(url);
      const detail = `HTTP ${r.status}`;
      if (!ok("Abstract API (company enrichment)", r.ok, detail)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("Abstract API (company enrichment)", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  // ExchangeRate-API v6
  const erKey = process.env.EXCHANGERATE_API_KEY?.trim();
  if (!erKey) {
    skip("ExchangeRate-API", "EXCHANGERATE_API_KEY not set");
  } else {
    try {
      const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(erKey)}/latest/USD`;
      const r = await fetch(url);
      const j = r.ok ? await r.json().catch(() => null) : null;
      const pass = r.ok && j?.result === "success";
      if (!ok("ExchangeRate-API", pass, `HTTP ${r.status}${j?.result ? ` result=${j.result}` : ""}`)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("ExchangeRate-API", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  // Neon Postgres (report persistence)
  const dbUrl = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  if (!dbUrl) {
    skip("Neon Postgres", "DATABASE_URL or POSTGRES_URL not set");
  } else {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);
      const rows = await sql`SELECT 1 AS ok`;
      const pass = rows?.[0]?.ok === 1;
      if (!ok("Neon Postgres", pass, pass ? "SELECT 1" : `rows=${JSON.stringify(rows)}`)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("Neon Postgres", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  // Google Apps Script leads webhook (reachability only)
  const leadsUrl = process.env.LEADS_WEBHOOK_URL?.trim();
  if (!leadsUrl) {
    skip("Leads webhook (Google Apps Script)", "LEADS_WEBHOOK_URL not set");
  } else {
    try {
      const r = await fetch(leadsUrl, { method: "GET", redirect: "follow" });
      const reachable = r.status < 500;
      if (!ok("Leads webhook URL (GET reachability)", reachable, `HTTP ${r.status}`)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("Leads webhook URL", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  // HubSpot forms API (optional)
  const hubPortal = process.env.HUBSPOT_PORTAL_ID?.trim();
  const hubForm = process.env.HUBSPOT_FORM_GUID?.trim();
  if (!hubPortal || !hubForm) {
    skip("HubSpot forms API", "HUBSPOT_PORTAL_ID or HUBSPOT_FORM_GUID not set");
  } else {
    try {
      const url = `https://api.hsforms.com/submissions/v3/integration/submit/${hubPortal}/${hubForm}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: [] }),
      });
      const pass = r.status < 500;
      const detail = `HTTP ${r.status} (minimal POST; 4xx often means reachable but invalid payload)`;
      if (!ok("HubSpot forms API (submit endpoint)", pass, detail)) {
        totalFailed++;
        actionable++;
      }
    } catch (e) {
      ok("HubSpot forms API", false, String(e.message || e));
      totalFailed++;
      actionable++;
    }
  }

  console.log("\n[—] World Bank / benchmarks: embedded data in lib/pipeline/worldbank.ts (no HTTP)");

  console.log(
    `\nDone. ${totalFailed ? `${totalFailed} check(s) not fully OK (${actionable} actionable).` : "All executed checks passed."}`
  );
  if (totalFailed && !actionable) {
    console.log("Exit 0: only IP/environment warnings (see [WARN] lines).");
  }
  process.exit(actionable ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
