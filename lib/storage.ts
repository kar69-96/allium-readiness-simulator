import { neon } from "@neondatabase/serverless";
import { SimulatorReport } from "@/types/report";

const SEVEN_DAYS_MS = 60 * 60 * 24 * 7 * 1000;

function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  return url || null;
}

let sqlInstance: ReturnType<typeof neon> | null = null;
let schemaInit: Promise<void> | null = null;

function getSql(): ReturnType<typeof neon> | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlInstance) sqlInstance = neon(url);
  return sqlInstance;
}

async function ensureSchema(sql: ReturnType<typeof neon>): Promise<void> {
  if (!schemaInit) {
    schemaInit = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS report_store (
          slug text PRIMARY KEY,
          payload jsonb NOT NULL,
          expires_at timestamptz NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS domain_cache (
          domain text PRIMARY KEY,
          slug text NOT NULL,
          expires_at timestamptz NOT NULL
        )
      `;
    })();
  }
  try {
    await schemaInit;
  } catch (e) {
    schemaInit = null;
    throw e;
  }
}

function parseReportPayload(raw: unknown): SimulatorReport | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as SimulatorReport;
    } catch {
      return null;
    }
  }
  return raw as SimulatorReport;
}

export async function storeReport(slug: string, report: SimulatorReport): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  const expires = new Date(Date.now() + SEVEN_DAYS_MS);
  await ensureSchema(sql);
  await sql`
    INSERT INTO report_store (slug, payload, expires_at)
    VALUES (${slug}, ${JSON.stringify(report)}::jsonb, ${expires})
    ON CONFLICT (slug) DO UPDATE SET
      payload = EXCLUDED.payload,
      expires_at = EXCLUDED.expires_at
  `;
}

export async function getReport(slug: string): Promise<SimulatorReport | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureSchema(sql);
    const rows = (await sql`
      SELECT payload FROM report_store
      WHERE slug = ${slug} AND expires_at > now()
    `) as { payload: unknown }[];
    const row = rows[0];
    if (!row) return null;
    return parseReportPayload(row.payload);
  } catch (e) {
    console.error("Postgres getReport failed:", e);
    return null;
  }
}

export async function cacheByDomain(domain: string, slug: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  const expires = new Date(Date.now() + SEVEN_DAYS_MS);
  await ensureSchema(sql);
  await sql`
    INSERT INTO domain_cache (domain, slug, expires_at)
    VALUES (${domain}, ${slug}, ${expires})
    ON CONFLICT (domain) DO UPDATE SET
      slug = EXCLUDED.slug,
      expires_at = EXCLUDED.expires_at
  `;
}

export async function getByDomain(domain: string): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureSchema(sql);
    const rows = (await sql`
      SELECT slug FROM domain_cache
      WHERE domain = ${domain} AND expires_at > now()
    `) as { slug: string }[];
    const row = rows[0];
    return row?.slug ?? null;
  } catch (e) {
    console.error("Postgres getByDomain failed:", e);
    return null;
  }
}
