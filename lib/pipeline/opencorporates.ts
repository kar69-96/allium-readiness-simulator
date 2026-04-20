interface OpenCorporatesResult {
  legalJurisdiction: string | null;
  companyAgeYears: number | null;
}

export async function fetchOpenCorporates(companyName: string): Promise<OpenCorporatesResult> {
  const empty: OpenCorporatesResult = { legalJurisdiction: null, companyAgeYears: null };

  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&per_page=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "allium-readiness-simulator/1.0" },
    });
    if (!res.ok) return empty;

    const data = await res.json();
    const company = data?.results?.companies?.[0]?.company;
    if (!company) return empty;

    const jurisdiction = company.jurisdiction_code ?? null;
    const incorporationDate = company.incorporation_date ?? null;

    let ageYears: number | null = null;
    if (incorporationDate) {
      const founded = new Date(incorporationDate);
      const now = new Date();
      ageYears = Math.floor((now.getTime() - founded.getTime()) / (1000 * 60 * 60 * 24 * 365));
    }

    return {
      legalJurisdiction: jurisdiction,
      companyAgeYears: ageYears,
    };
  } catch {
    return empty;
  }
}
