// Maps HQ country → ISO currency code
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  France: "EUR",
  Japan: "JPY",
  China: "CNY",
  India: "INR",
  Brazil: "BRL",
  Canada: "CAD",
  Australia: "AUD",
  Mexico: "MXN",
  Singapore: "SGD",
  "Hong Kong": "HKD",
  "South Korea": "KRW",
  Indonesia: "IDR",
  Philippines: "PHP",
  Vietnam: "VND",
  Nigeria: "NGN",
  Kenya: "KES",
  "South Africa": "ZAR",
  Argentina: "ARS",
  Colombia: "COP",
  Chile: "CLP",
  UAE: "AED",
};

// Top corridors by sending region
const CORRIDOR_TARGETS = ["USD", "EUR", "GBP"];

export async function fetchCorridorFxCosts(
  hqCountry: string | null
): Promise<Record<string, number> | null> {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey || !hqCountry) return null;

  const baseCurrency = COUNTRY_TO_CURRENCY[hqCountry];
  if (!baseCurrency) return null;

  try {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.result !== "success") return null;

    const rates = data.conversion_rates ?? {};
    const corridors: Record<string, number> = {};

    for (const target of CORRIDOR_TARGETS) {
      if (target !== baseCurrency && rates[target]) {
        // Estimate bid/ask spread as 1.5% (typical retail FX cost)
        const key = `${baseCurrency}_${target}`;
        corridors[key] = 0.015;
      }
    }

    return Object.keys(corridors).length > 0 ? corridors : null;
  } catch {
    return null;
  }
}
