import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("leads", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LEADS_WEBHOOK_URL;
  });

  describe("submitLead", () => {
    it("no-ops when LEADS_WEBHOOK_URL is absent", async () => {
      delete process.env.LEADS_WEBHOOK_URL;
      const { submitLead } = await import("@/lib/leads");
      await submitLead("slug-123", MOCK_REPORT);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("POSTs to LEADS_WEBHOOK_URL with correct body", async () => {
      process.env.LEADS_WEBHOOK_URL = "https://script.google.com/webhook";
      const { submitLead } = await import("@/lib/leads");
      await submitLead("slug-123", MOCK_REPORT);

      expect(fetch).toHaveBeenCalledOnce();
      const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toBe("https://script.google.com/webhook");
      expect(options.method).toBe("POST");

      const body = JSON.parse(options.body);
      expect(body.type).toBe("lead");
      expect(body.company).toBe("Acme Corp");
      expect(body.score).toBe(72);
      expect(body.report_slug).toBe("slug-123");
      expect(body.email).toBe("");
      expect(typeof body.timestamp).toBe("string");
    });

    it("does not throw when fetch fails", async () => {
      process.env.LEADS_WEBHOOK_URL = "https://script.google.com/webhook";
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { submitLead } = await import("@/lib/leads");
      await expect(submitLead("slug-123", MOCK_REPORT)).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe("submitEmail", () => {
    it("no-ops when LEADS_WEBHOOK_URL is absent", async () => {
      delete process.env.LEADS_WEBHOOK_URL;
      const { submitEmail } = await import("@/lib/leads");
      await submitEmail("user@example.com", "slug-123", MOCK_REPORT);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("POSTs with type=email_capture and email field set", async () => {
      process.env.LEADS_WEBHOOK_URL = "https://script.google.com/webhook";
      const { submitEmail } = await import("@/lib/leads");
      await submitEmail("user@example.com", "slug-123", MOCK_REPORT);

      const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.type).toBe("email_capture");
      expect(body.email).toBe("user@example.com");
      expect(body.report_slug).toBe("slug-123");
    });

    it("does not throw when fetch fails", async () => {
      process.env.LEADS_WEBHOOK_URL = "https://script.google.com/webhook";
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { submitEmail } = await import("@/lib/leads");
      await expect(
        submitEmail("user@example.com", "slug-123", MOCK_REPORT)
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });
});
