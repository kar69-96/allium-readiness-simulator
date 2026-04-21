import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { SimulatorReport } from "@/types/report";

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

vi.mock("@/lib/pipeline", () => ({
  assembleCompanyInput: vi.fn().mockResolvedValue({ company_name: "Acme Corp" }),
}));

vi.mock("@/lib/claude", () => ({
  generateReport: vi.fn().mockResolvedValue(MOCK_REPORT),
}));

vi.mock("@/lib/storage", () => ({
  storeReport: vi.fn().mockResolvedValue(undefined),
  cacheByDomain: vi.fn().mockResolvedValue(undefined),
  getByDomain: vi.fn().mockResolvedValue(null),
  getReport: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/leads", () => ({
  submitLead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-slug-01"),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/simulate", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";

    // Restore default mock behaviours after resetAllMocks
    const { assembleCompanyInput } = await import("@/lib/pipeline");
    const { generateReport } = await import("@/lib/claude");
    const { getByDomain, getReport, storeReport, cacheByDomain } = await import("@/lib/storage");
    const { submitLead } = await import("@/lib/leads");
    vi.mocked(assembleCompanyInput).mockResolvedValue({ company_name: "Acme Corp" } as never);
    vi.mocked(generateReport).mockResolvedValue(MOCK_REPORT);
    vi.mocked(getByDomain).mockResolvedValue(null);
    vi.mocked(getReport).mockResolvedValue(null);
    vi.mocked(storeReport).mockResolvedValue(undefined);
    vi.mocked(cacheByDomain).mockResolvedValue(undefined);
    vi.mocked(submitLead).mockResolvedValue(undefined);

    const { nanoid } = await import("nanoid");
    vi.mocked(nanoid).mockReturnValue("test-slug-01" as never);
  });

  it("returns 503 when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("@/app/api/simulate/route");
    const res = await POST(makeRequest({ company_name: "Acme" }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it("returns 400 when company_name is missing", async () => {
    const { POST } = await import("@/app/api/simulate/route");
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/company_name is required/i);
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("@/app/api/simulate/route");
    const req = new NextRequest("http://localhost/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns cached report when domain cache hit exists", async () => {
    const { getByDomain, getReport } = await import("@/lib/storage");
    vi.mocked(getByDomain).mockResolvedValue("cached-slug");
    vi.mocked(getReport).mockResolvedValue(MOCK_REPORT);

    const { POST } = await import("@/app/api/simulate/route");
    const res = await POST(makeRequest({ company_name: "Acme Corp" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.slug).toBe("cached-slug");
    expect(body.report.company_name).toBe("Acme Corp");
  });

  it("generates and returns a new report on cache miss", async () => {
    const { POST } = await import("@/app/api/simulate/route");
    const res = await POST(makeRequest({ company_name: "Acme Corp" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe("test-slug-01");
    expect(body.report.company_name).toBe("Acme Corp");
    expect(body.report.overall_score).toBe(72);
    expect(body.cached).toBeUndefined();
  });

  it("returns 500 when report generation throws", async () => {
    const { generateReport } = await import("@/lib/claude");
    vi.mocked(generateReport).mockRejectedValue(new Error("Claude failed"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("@/app/api/simulate/route");
    const res = await POST(makeRequest({ company_name: "Acme Corp" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/generation failed/i);
    consoleSpy.mockRestore();
  });

  it("calls submitLead fire-and-forget after successful generation", async () => {
    const { submitLead } = await import("@/lib/leads");
    const { POST } = await import("@/app/api/simulate/route");
    await POST(makeRequest({ company_name: "Acme Corp" }));
    expect(submitLead).toHaveBeenCalledWith("test-slug-01", MOCK_REPORT);
  });
});
