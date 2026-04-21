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

vi.mock("@/lib/storage", () => ({
  getReport: vi.fn(),
}));

function makeRequest(slug: string): [NextRequest, { params: Promise<{ slug: string }> }] {
  const req = new NextRequest(`http://localhost/api/report/${slug}`);
  const params = Promise.resolve({ slug });
  return [req, { params }];
}

describe("GET /api/report/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with report when slug exists", async () => {
    const { getReport } = await import("@/lib/storage");
    vi.mocked(getReport).mockResolvedValue(MOCK_REPORT);

    const { GET } = await import("@/app/api/report/[slug]/route");
    const [req, ctx] = makeRequest("valid-slug");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.company_name).toBe("Acme Corp");
    expect(body.overall_score).toBe(72);
  });

  it("returns 404 when slug does not exist", async () => {
    const { getReport } = await import("@/lib/storage");
    vi.mocked(getReport).mockResolvedValue(null);

    const { GET } = await import("@/app/api/report/[slug]/route");
    const [req, ctx] = makeRequest("missing-slug");
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it("calls getReport with the correct slug", async () => {
    const { getReport } = await import("@/lib/storage");
    vi.mocked(getReport).mockResolvedValue(MOCK_REPORT);

    const { GET } = await import("@/app/api/report/[slug]/route");
    const [req, ctx] = makeRequest("abc123xyz");
    await GET(req, ctx);
    expect(getReport).toHaveBeenCalledWith("abc123xyz");
  });
});
