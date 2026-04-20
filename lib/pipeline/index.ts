import { CompanyInput } from "@/types/report";
import { fetchYahooData } from "./yfinance";
import { fetchGeographicSegments } from "./fmp";
import { fetchAbstractCompany } from "./abstractapi";
import { fetchOpenCorporates } from "./opencorporates";
import { fetchCorridorFxCosts } from "./exchangerate";
import { getRemittanceCostPct, getIndustryBenchmark } from "./worldbank";

export async function assembleCompanyInput(companyName: string): Promise<CompanyInput> {
  // Run all data sources concurrently; each is independently fault-tolerant
  const [yahoo, abstract, opencorp] = await Promise.all([
    fetchYahooData(companyName),
    fetchAbstractCompany(companyName),
    fetchOpenCorporates(companyName),
  ]);

  // FMP requires ticker from Yahoo; ExchangeRate requires HQ country
  const hqCountry = yahoo.country ?? abstract.country ?? null;

  const [fmpData, corridorFx] = await Promise.all([
    yahoo.ticker ? fetchGeographicSegments(yahoo.ticker) : Promise.resolve({ segments: null, operatingCountries: null }),
    fetchCorridorFxCosts(hqCountry),
  ]);

  const sector = yahoo.sector ?? abstract.industry ?? null;
  const industry = yahoo.industry ?? abstract.industry ?? null;

  return {
    company_name: companyName,
    ticker: yahoo.ticker,
    sector,
    industry,
    business_description: yahoo.businessSummary,
    hq_country: hqCountry,
    employee_count: yahoo.employeeCount ?? abstract.employeeCount ?? null,
    annual_revenue_usd: yahoo.annualRevenueUsd ?? abstract.annualRevenueUsd ?? null,
    market_cap_usd: yahoo.marketCapUsd,
    geographic_revenue_segments: fmpData.segments,
    operating_countries: fmpData.operatingCountries,
    company_age_years: opencorp.companyAgeYears,
    legal_jurisdiction: opencorp.legalJurisdiction,
    is_public: yahoo.ticker !== null,
    website: yahoo.website ?? abstract.website ?? null,
    corridor_fx_costs: corridorFx,
    remittance_corridor_cost_pct: getRemittanceCostPct(hqCountry),
    industry_stablecoin_benchmark: getIndustryBenchmark(sector, industry),
  };
}
