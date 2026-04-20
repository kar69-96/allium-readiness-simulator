import Anthropic from "@anthropic-ai/sdk";
import { CompanyInput, SimulatorReport } from "@/types/report";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Allium Stablecoin Readiness Engine. Your job is to analyze a company's public profile and produce a structured stablecoin readiness report. You will receive a JSON object with everything publicly available about the company. Your output must also be a valid JSON object — no preamble, no markdown, no prose outside the JSON.

Scoring methodology:

Score each of the 5 dimensions on a 0–100 scale using the rubrics below. Then compute overall_score as a weighted sum.

Dimensions and weights:

1. payment_infrastructure (25%) — Does the company process digital payments at scale? Are they API-first? Do they use modern payment providers (Stripe, Adyen, Braintree)? Score higher for: fintech/payments/e-commerce verticals, large transaction volumes, API-driven architecture, existing multi-currency operations.

2. cross_border_exposure (25%) — What share of their business is international? Do they operate in high-cost corridors (LatAm, SEA, Africa, South Asia)? Score higher for: international revenue >20%, multiple operating countries, remittance or FX-heavy business models.

3. compliance_posture (20%) — Are they regulated? Do they have existing AML/KYC infrastructure? Score higher for: licensed financial institutions, public companies with SOX compliance, existing crypto/fintech regulatory licenses.

4. treasury_ops_maturity (15%) — Do they manage multi-currency balances? Is there a treasury function? Score higher for: companies with CFOs/treasury teams, multi-entity structures, existing FX hedging programs.

5. on_chain_readiness (15%) — Any existing blockchain exposure? Web3 integrations? Crypto acceptance? Developer team with blockchain familiarity? Score higher for: fintech with crypto features, Web3-adjacent companies, companies that have made public statements about crypto/stablecoin.

Dollar calculations:

revenue_unlock_usd: Estimate the annual revenue unlock from offering stablecoin settlement to customers or counterparties. Formula: estimated_annual_payment_volume × pct_cross_border × fee_delta × 0.3 (addressable share). Fee delta = difference between current average payment rail cost for their corridors (use World Bank RPW benchmark: 6.2% global average for cross-border) minus stablecoin settlement cost (0.3%). If payment volume is unknown, estimate from revenue using industry-specific payment volume multipliers (e.g. payments companies: 15–50x revenue; e-commerce: 3–8x; B2B SaaS: 0.5–1x).

cost_savings_usd: Estimate annual operational savings. Formula: (fx_spread_savings + float_liberation + reconciliation_overhead_reduction). FX spread: apply corridor-specific spread from provided FX data. Float liberation: assume 2-day settlement delay freed at 5% cost of capital. Reconciliation: assume 0.05% of payment volume.

Output format — return ONLY this JSON, no other text:

{
  "company_name": string,
  "industry": string,
  "hq_country": string,
  "employee_band": string,
  "revenue_range": string,
  "overall_score": number (0–100, integer),
  "score_tier": "Early adopter" | "Ready to launch" | "Strong candidate" | "Pilot recommended",
  "dimensions": {
    "payment_infrastructure": { "score": number, "rationale": string (1–2 sentences) },
    "cross_border_exposure": { "score": number, "rationale": string },
    "compliance_posture": { "score": number, "rationale": string },
    "treasury_ops_maturity": { "score": number, "rationale": string },
    "on_chain_readiness": { "score": number, "rationale": string }
  },
  "revenue_unlock_usd": number,
  "cost_savings_usd": number,
  "time_to_live_weeks": string (e.g. "4–6"),
  "top_use_cases": [string, string, string],
  "primary_gap": string (1 sentence — the #1 thing blocking faster adoption),
  "key_insight": string (2–3 sentences — the most important, specific finding for this company),
  "confidence": "high" | "medium" | "low",
  "confidence_note": string (explain what data was available or missing)
}`;

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

async function callClaude(input: CompanyInput, retryPrompt?: string): Promise<string> {
  const userContent = retryPrompt
    ? `${JSON.stringify(input)}\n\n${retryPrompt}`
    : JSON.stringify(input);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

export async function generateReport(input: CompanyInput): Promise<SimulatorReport> {
  let rawText = await callClaude(input);
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripMarkdownFences(rawText));
  } catch {
    // Retry once with explicit JSON instruction
    rawText = await callClaude(input, "Return only valid JSON. No markdown, no explanation, no preamble.");
    parsed = JSON.parse(stripMarkdownFences(rawText));
  }

  return parsed as SimulatorReport;
}
