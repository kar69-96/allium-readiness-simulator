import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompanyInput, SimulatorReport } from "@/types/report";

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

const MOCK_INPUT: CompanyInput = {
  company_name: "Acme Corp",
  ticker: "ACME",
  sector: "Technology",
  industry: "Fintech",
  business_description: "Payment processing",
  hq_country: "US",
  employee_count: 750,
  annual_revenue_usd: 200000000,
  market_cap_usd: 1000000000,
  geographic_revenue_segments: { US: 0.6, International: 0.4 },
  operating_countries: ["US", "UK", "DE"],
  company_age_years: 10,
  legal_jurisdiction: "Delaware",
  is_public: true,
  website: "https://acme.com",
  corridor_fx_costs: { "USD/MXN": 0.03 },
  remittance_corridor_cost_pct: 0.04,
  industry_stablecoin_benchmark: 0.65,
};

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

describe("claude", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("returns parsed SimulatorReport on successful call", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(MOCK_REPORT) }],
    });

    const { generateReport } = await import("@/lib/claude");
    const result = await generateReport(MOCK_INPUT);
    expect(result.company_name).toBe("Acme Corp");
    expect(result.overall_score).toBe(72);
    expect(result.score_tier).toBe("Strong candidate");
  });

  it("strips markdown fences from response", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: `\`\`\`json\n${JSON.stringify(MOCK_REPORT)}\n\`\`\`` }],
    });

    const { generateReport } = await import("@/lib/claude");
    const result = await generateReport(MOCK_INPUT);
    expect(result.company_name).toBe("Acme Corp");
  });

  it("retries once on JSON parse failure and succeeds", async () => {
    mockCreate
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "not valid json" }],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(MOCK_REPORT) }],
      });

    const { generateReport } = await import("@/lib/claude");
    const result = await generateReport(MOCK_INPUT);
    expect(result.company_name).toBe("Acme Corp");
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws after retry exhaustion on persistent invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "still not json" }],
    });

    const { generateReport } = await import("@/lib/claude");
    await expect(generateReport(MOCK_INPUT)).rejects.toThrow(
      "Claude returned invalid JSON after retry"
    );
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws when Claude returns unexpected content type", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "tool_use", id: "x", name: "y", input: {} }],
    });

    const { generateReport } = await import("@/lib/claude");
    await expect(generateReport(MOCK_INPUT)).rejects.toThrow(
      "Unexpected response type from Claude"
    );
  });

  it("sends company input JSON as user message", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(MOCK_REPORT) }],
    });

    const { generateReport } = await import("@/lib/claude");
    await generateReport(MOCK_INPUT);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].role).toBe("user");
    expect(callArgs.messages[0].content).toContain("Acme Corp");
    expect(callArgs.system).toContain("Allium Stablecoin Readiness Engine");
  });
});
