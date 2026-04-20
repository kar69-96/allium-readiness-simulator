export async function fetchGeographicSegments(
  ticker: string
): Promise<{ segments: Record<string, number> | null; operatingCountries: string[] | null }> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return { segments: null, operatingCountries: null };

  try {
    const url = `https://financialmodelingprep.com/api/v3/revenue-geographic-segmentation?symbol=${ticker}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { segments: null, operatingCountries: null };

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return { segments: null, operatingCountries: null };

    // Use the most recent year's data
    const latest = data[0];
    const segments: Record<string, number> = {};
    for (const [key, value] of Object.entries(latest)) {
      if (key !== "date" && typeof value === "number") {
        segments[key] = value;
      }
    }

    const operatingCountries = Object.keys(segments).filter((k) => k !== "Total");

    return {
      segments: Object.keys(segments).length > 0 ? segments : null,
      operatingCountries: operatingCountries.length > 0 ? operatingCountries : null,
    };
  } catch {
    return { segments: null, operatingCountries: null };
  }
}
