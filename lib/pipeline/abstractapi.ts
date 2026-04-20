interface AbstractCompanyResult {
  website: string | null;
  employeeCount: number | null;
  annualRevenueUsd: number | null;
  country: string | null;
  industry: string | null;
}

export async function fetchAbstractCompany(
  companyName: string
): Promise<AbstractCompanyResult> {
  const apiKey = process.env.ABSTRACT_API_KEY;
  const empty: AbstractCompanyResult = {
    website: null,
    employeeCount: null,
    annualRevenueUsd: null,
    country: null,
    industry: null,
  };

  if (!apiKey) return empty;

  try {
    const url = `https://companyenrichment.abstractapi.com/v1/?api_key=${apiKey}&name=${encodeURIComponent(companyName)}`;
    const res = await fetch(url);
    if (!res.ok) return empty;

    const data = await res.json();
    if (!data || data.error) return empty;

    const revenueMap: Record<string, number> = {
      "1-10m": 5_000_000,
      "10-50m": 30_000_000,
      "50-100m": 75_000_000,
      "100-250m": 175_000_000,
      "250-500m": 375_000_000,
      "500m-1b": 750_000_000,
      "1-10b": 5_000_000_000,
      "10b+": 15_000_000_000,
    };

    const employeeMap: Record<string, number> = {
      "1-10": 5,
      "11-50": 30,
      "51-200": 125,
      "201-500": 350,
      "501-1000": 750,
      "1001-5000": 3000,
      "5001-10000": 7500,
      "10001+": 25000,
    };

    const revenueRange = (data.annual_revenue ?? "").toLowerCase();
    const employeeRange = (data.employees ?? "").toLowerCase();

    return {
      website: data.domain ?? null,
      employeeCount: employeeMap[employeeRange] ?? null,
      annualRevenueUsd: revenueMap[revenueRange] ?? null,
      country: data.country ?? null,
      industry: data.industry ?? null,
    };
  } catch {
    return empty;
  }
}
