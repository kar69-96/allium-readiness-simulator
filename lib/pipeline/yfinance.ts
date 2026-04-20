interface YahooSearchResult {
  ticker: string | null;
  shortName: string | null;
  sector: string | null;
  industry: string | null;
  businessSummary: string | null;
  country: string | null;
  employeeCount: number | null;
  annualRevenueUsd: number | null;
  marketCapUsd: number | null;
  website: string | null;
}

export async function fetchYahooData(companyName: string): Promise<YahooSearchResult> {
  const empty: YahooSearchResult = {
    ticker: null,
    shortName: null,
    sector: null,
    industry: null,
    businessSummary: null,
    country: null,
    employeeCount: null,
    annualRevenueUsd: null,
    marketCapUsd: null,
    website: null,
  };

  try {
    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}&quotesCount=1`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!searchRes.ok) return empty;

    const searchData = await searchRes.json();
    const quote = searchData?.quotes?.[0];
    if (!quote?.symbol) return empty;

    const ticker = quote.symbol as string;

    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile,financialData,defaultKeyStatistics,summaryDetail`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!summaryRes.ok) return { ...empty, ticker };

    const summaryData = await summaryRes.json();
    const result = summaryData?.quoteSummary?.result?.[0];
    if (!result) return { ...empty, ticker };

    const profile = result.assetProfile ?? {};
    const financial = result.financialData ?? {};
    const keyStats = result.defaultKeyStatistics ?? {};

    return {
      ticker,
      shortName: quote.shortname ?? quote.longname ?? null,
      sector: profile.sector ?? null,
      industry: profile.industry ?? null,
      businessSummary: profile.longBusinessSummary ?? null,
      country: profile.country ?? null,
      employeeCount: profile.fullTimeEmployees ?? null,
      annualRevenueUsd: financial.totalRevenue?.raw ?? null,
      marketCapUsd: keyStats.enterpriseValue?.raw ?? summaryData?.quoteSummary?.result?.[0]?.summaryDetail?.marketCap?.raw ?? null,
      website: profile.website ?? null,
    };
  } catch {
    return empty;
  }
}
