import { describe, it, expect, vi, beforeEach } from "vitest";
import { SimulatorReport } from "@/types/report";

const mockSql = vi.fn();

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockSql,
}));

const MOCK_REPORT: SimulatorReport = {
  company_name: "Acme Corp",
  industry: "Fintech",
  hq_country: "US",
  employee_band: "500–1000",
  revenue_range: "$100M–$500M",
  overall_score: 72,
  score_tier: "Strong candidate",
  dimensions: {
    payment_infrastructure: { score: 80, rationale: "API-first" },
    cross_border_exposure: { score: 70, rationale: "Global ops" },
    compliance_posture: { score: 65, rationale: "SOX compliant" },
    treasury_ops_maturity: { score: 75, rationale: "CFO function" },
    on_chain_readiness: { score: 60, rationale: "No crypto exposure" },
  },
  revenue_unlock_usd: 5000000,
  cost_savings_usd: 1200000,
  time_to_live_weeks: "6–10",
  top_use_cases: ["Cross-border settlement", "Treasury management", "Vendor payments"],
  primary_gap: "Lacks crypto custody infrastructure",
  key_insight: "Strong cross-border exposure makes stablecoin settlement compelling.",
  confidence: "high",
  confidence_note: "Public company with full financials available.",
};

describe("storage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Reset module-level singletons between tests
  });

  describe("getReport — no DATABASE_URL", () => {
    it("returns null when DATABASE_URL is absent", async () => {
      const originalUrl = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;

      // Re-import so module-level getSql() sees no URL
      const { getReport } = await import("@/lib/storage");
      const result = await getReport("any-slug");
      expect(result).toBeNull();

      process.env.DATABASE_URL = originalUrl;
    });
  });

  describe("getReport — with DATABASE_URL", () => {
    beforeEach(() => {
      process.env.DATABASE_URL = "postgres://mock";
    });

    it("returns null when no rows found", async () => {
      mockSql.mockResolvedValue([]);
      const { getReport } = await import("@/lib/storage");
      const result = await getReport("missing-slug");
      expect(result).toBeNull();
    });

    it("returns parsed report when row found", async () => {
      // First call = ensureSchema (CREATE TABLE × 2), subsequent = SELECT
      mockSql
        .mockResolvedValueOnce([]) // CREATE TABLE report_store
        .mockResolvedValueOnce([]) // CREATE TABLE domain_cache
        .mockResolvedValueOnce([{ payload: MOCK_REPORT }]); // SELECT

      const { getReport } = await import("@/lib/storage");
      const result = await getReport("valid-slug");
      expect(result).not.toBeNull();
      expect(result?.company_name).toBe("Acme Corp");
      expect(result?.overall_score).toBe(72);
    });

    it("returns null and logs error on DB exception", async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error("DB connection failed"));

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { getReport } = await import("@/lib/storage");
      const result = await getReport("bad-slug");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("getReport"),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("parses report payload from JSON string", async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ payload: JSON.stringify(MOCK_REPORT) }]);

      const { getReport } = await import("@/lib/storage");
      const result = await getReport("slug-with-string-payload");
      expect(result?.company_name).toBe("Acme Corp");
    });
  });

  describe("storeReport — no DATABASE_URL", () => {
    it("no-ops silently when DATABASE_URL is absent", async () => {
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;

      const { storeReport } = await import("@/lib/storage");
      await expect(storeReport("slug", MOCK_REPORT)).resolves.toBeUndefined();
      expect(mockSql).not.toHaveBeenCalled();
    });
  });

  describe("storeReport — with DATABASE_URL", () => {
    beforeEach(() => {
      process.env.DATABASE_URL = "postgres://mock";
    });

    it("inserts report with slug and 7-day expiry", async () => {
      mockSql.mockResolvedValue([]);
      const { storeReport } = await import("@/lib/storage");
      await storeReport("test-slug", MOCK_REPORT);
      // Verify INSERT was called (last call)
      expect(mockSql).toHaveBeenCalled();
    });
  });

  describe("getByDomain / cacheByDomain", () => {
    beforeEach(() => {
      process.env.DATABASE_URL = "postgres://mock";
    });

    it("getByDomain returns null when no rows", async () => {
      mockSql.mockResolvedValue([]);
      const { getByDomain } = await import("@/lib/storage");
      const result = await getByDomain("acme");
      expect(result).toBeNull();
    });

    it("getByDomain returns slug when found", async () => {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ slug: "abc123" }]);
      const { getByDomain } = await import("@/lib/storage");
      const result = await getByDomain("acme");
      expect(result).toBe("abc123");
    });

    it("cacheByDomain no-ops when DATABASE_URL absent", async () => {
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;
      const { cacheByDomain } = await import("@/lib/storage");
      await expect(cacheByDomain("acme", "slug")).resolves.toBeUndefined();
    });
  });
});
