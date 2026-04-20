export interface CompanyInput {
  company_name: string;
  ticker: string | null;
  sector: string | null;
  industry: string | null;
  business_description: string | null;
  hq_country: string | null;
  employee_count: number | null;
  annual_revenue_usd: number | null;
  market_cap_usd: number | null;
  geographic_revenue_segments: Record<string, number> | null;
  operating_countries: string[] | null;
  company_age_years: number | null;
  legal_jurisdiction: string | null;
  is_public: boolean;
  website: string | null;
  corridor_fx_costs: Record<string, number> | null;
  remittance_corridor_cost_pct: number | null;
  industry_stablecoin_benchmark: number | null;
}

export type ScoreTier =
  | "Early adopter"
  | "Ready to launch"
  | "Strong candidate"
  | "Pilot recommended";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DimensionScore {
  score: number;
  rationale: string;
}

export interface SimulatorReport {
  company_name: string;
  industry: string;
  hq_country: string;
  employee_band: string;
  revenue_range: string;
  overall_score: number;
  score_tier: ScoreTier;
  dimensions: {
    payment_infrastructure: DimensionScore;
    cross_border_exposure: DimensionScore;
    compliance_posture: DimensionScore;
    treasury_ops_maturity: DimensionScore;
    on_chain_readiness: DimensionScore;
  };
  revenue_unlock_usd: number;
  cost_savings_usd: number;
  time_to_live_weeks: string;
  top_use_cases: [string, string, string];
  primary_gap: string;
  key_insight: string;
  confidence: ConfidenceLevel;
  confidence_note: string;
}
