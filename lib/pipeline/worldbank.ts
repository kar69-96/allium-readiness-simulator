// World Bank Remittance Prices Worldwide — average cost by sending country
// Source: World Bank RPW database, updated quarterly
// Values represent percentage cost of sending $200 equivalent
const REMITTANCE_COSTS: Record<string, number> = {
  "United States": 5.8,
  "United Kingdom": 5.2,
  Germany: 6.1,
  France: 8.4,
  Japan: 6.5,
  Australia: 5.9,
  Canada: 5.7,
  "Saudi Arabia": 6.3,
  UAE: 4.8,
  Singapore: 4.2,
  "South Africa": 9.1,
  Nigeria: 8.7,
  India: 6.0,
  China: 7.2,
  Brazil: 7.8,
  Mexico: 4.9,
  Philippines: 5.4,
  Indonesia: 6.8,
  Russia: 7.1,
  default: 6.2, // World Bank global average
};

export function getRemittanceCostPct(hqCountry: string | null): number {
  if (!hqCountry) return REMITTANCE_COSTS.default;
  return REMITTANCE_COSTS[hqCountry] ?? REMITTANCE_COSTS.default;
}

// Industry stablecoin adoption benchmarks (% of peers actively using stablecoins)
export const INDUSTRY_STABLECOIN_BENCHMARKS: Record<string, number> = {
  "Financial Services": 18,
  Fintech: 32,
  Payments: 41,
  "E-commerce": 14,
  Remittance: 38,
  "B2B SaaS": 7,
  Gaming: 22,
  Crypto: 85,
  Banking: 12,
  Insurance: 6,
  Retail: 5,
  Manufacturing: 3,
  Healthcare: 4,
  Technology: 9,
  default: 8,
};

export function getIndustryBenchmark(sector: string | null, industry: string | null): number {
  const key = industry ?? sector ?? "";
  for (const [k, v] of Object.entries(INDUSTRY_STABLECOIN_BENCHMARKS)) {
    if (key.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return INDUSTRY_STABLECOIN_BENCHMARKS.default;
}
