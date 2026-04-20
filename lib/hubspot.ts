import { SimulatorReport } from "@/types/report";

function getFormUrl(): string | null {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (!portalId || !formGuid) return null;
  return `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
}

export async function submitLead(slug: string, report: SimulatorReport): Promise<void> {
  const url = getFormUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [
          { name: "company", value: report.company_name },
          { name: "stablecoin_readiness_score", value: String(report.overall_score) },
          { name: "score_tier", value: report.score_tier },
          { name: "revenue_unlock_usd", value: String(report.revenue_unlock_usd) },
          { name: "cost_savings_usd", value: String(report.cost_savings_usd) },
          { name: "top_use_cases", value: report.top_use_cases.join(", ") },
          { name: "primary_gap", value: report.primary_gap },
          { name: "industry", value: report.industry },
          { name: "hq_country", value: report.hq_country },
          { name: "report_slug", value: slug },
        ],
      }),
    });
  } catch (err) {
    console.error("HubSpot lead submission failed:", err);
  }
}

export async function submitEmail(
  email: string,
  slug: string,
  report: SimulatorReport
): Promise<void> {
  const url = getFormUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [
          { name: "email", value: email },
          { name: "company", value: report.company_name },
          { name: "stablecoin_readiness_score", value: String(report.overall_score) },
          { name: "report_slug", value: slug },
        ],
      }),
    });
  } catch (err) {
    console.error("HubSpot email capture failed:", err);
  }
}
