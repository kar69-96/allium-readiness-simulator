import { Redis } from "@upstash/redis";
import { SimulatorReport } from "@/types/report";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export async function storeReport(slug: string, report: SimulatorReport): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`report:${slug}`, JSON.stringify(report), { ex: SEVEN_DAYS });
}

export async function getReport(slug: string): Promise<SimulatorReport | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string>(`report:${slug}`);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as SimulatorReport);
  } catch {
    return null;
  }
}

export async function cacheByDomain(domain: string, slug: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`cache:${domain}`, slug, { ex: SEVEN_DAYS });
}

export async function getByDomain(domain: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<string>(`cache:${domain}`);
}
