import { SimulatorReport } from "@/types/report";

function getWebhookUrl(): string | null {
  return process.env.LEADS_WEBHOOK_URL ?? null;
}

export async function submitLead(slug: string, report: SimulatorReport): Promise<void> {
  const url = getWebhookUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "lead",
        timestamp: new Date().toISOString(),
        company: report.company_name,
        industry: report.industry,
        hq_country: report.hq_country,
        score: report.overall_score,
        score_tier: report.score_tier,
        revenue_unlock_usd: report.revenue_unlock_usd,
        cost_savings_usd: report.cost_savings_usd,
        top_use_cases: report.top_use_cases.join(", "),
        primary_gap: report.primary_gap,
        confidence: report.confidence,
        report_slug: slug,
        email: "",
      }),
    });
  } catch (err) {
    console.error("Leads webhook submission failed:", err);
  }
}

export async function submitEmail(
  email: string,
  slug: string,
  report: SimulatorReport
): Promise<void> {
  const url = getWebhookUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email_capture",
        timestamp: new Date().toISOString(),
        company: report.company_name,
        industry: report.industry,
        hq_country: report.hq_country,
        score: report.overall_score,
        score_tier: report.score_tier,
        revenue_unlock_usd: report.revenue_unlock_usd,
        cost_savings_usd: report.cost_savings_usd,
        top_use_cases: report.top_use_cases.join(", "),
        primary_gap: report.primary_gap,
        confidence: report.confidence,
        report_slug: slug,
        email,
      }),
    });
  } catch (err) {
    console.error("Leads webhook email capture failed:", err);
  }
}
