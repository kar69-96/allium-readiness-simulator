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

vi.mock("@/lib/leads", () => ({
  submitEmail: vi.fn().mockResolvedValue(undefined),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/capture-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/capture-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const { POST } = await import("@/app/api/capture-email/route");
    const res = await POST(makeRequest({ slug: "abc" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when slug is missing", async () => {
    const { POST } = await import("@/app/api/capture-email/route");
    const res = await POST(makeRequest({ email: "user@example.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("@/app/api/capture-email/route");
    const req = new NextRequest("http://localhost/api/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when report not found for slug", async () => {
    const { getReport } = await import("@/lib/storage");
    vi.mocked(getReport).mockResolvedValue(null);

    const { POST } = await import("@/app/api/capture-email/route");
    const res = await POST(makeRequest({ email: "user@example.com", slug: "bad-slug" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it("returns 200 and calls submitEmail on valid request", async () => {
    const { getReport } = await import("@/lib/storage");
    vi.mocked(getReport).mockResolvedValue(MOCK_REPORT);

    const { submitEmail } = await import("@/lib/leads");
    const { POST } = await import("@/app/api/capture-email/route");
    const res = await POST(makeRequest({ email: "user@example.com", slug: "valid-slug" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(submitEmail).toHaveBeenCalledWith("user@example.com", "valid-slug", MOCK_REPORT);
  });
});
