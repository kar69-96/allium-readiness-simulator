import { SimulatorReport } from "@/types/report";

const INDUSTRY_BENCHMARKS: Record<string, number> = {
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
};

function findBenchmark(industry: string): { name: string; value: number } | null {
  const lower = industry.toLowerCase();
  for (const [k, v] of Object.entries(INDUSTRY_BENCHMARKS)) {
    if (lower.includes(k.toLowerCase())) return { name: k, value: v };
  }
  return null;
}

const COMPARISON_SECTORS = [
  { name: "Crypto", value: 85 },
  { name: "Payments", value: 41 },
  { name: "Fintech", value: 32 },
  { name: "Remittance", value: 38 },
  { name: "E-commerce", value: 14 },
  { name: "Banking", value: 12 },
  { name: "Technology", value: 9 },
  { name: "Retail", value: 5 },
];

interface Props {
  report: SimulatorReport;
}

export default function CompetitorBenchmark({ report }: Props) {
  const companyBenchmark = findBenchmark(report.industry);
  const readinessPercent = report.overall_score;

  const displaySectors = companyBenchmark
    ? COMPARISON_SECTORS.filter((s) => s.name !== companyBenchmark.name).slice(0, 5)
    : COMPARISON_SECTORS.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
          Industry Benchmark
        </h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Stablecoin adoption rates across verticals vs your readiness score
        </p>
      </div>

      <div className="space-y-3">
        {/* Company row */}
        <div className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-right">
            <span className="text-xs font-semibold text-[#B66AD1] truncate">
              {report.company_name.length > 12
                ? report.company_name.slice(0, 12) + "…"
                : report.company_name}
            </span>
            <span className="text-xs text-[#9CA3AF] block">readiness</span>
          </div>
          <div className="flex-1 relative h-5 bg-[#F0EBE3] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#B66AD1] transition-all duration-700"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#B66AD1] w-8 text-right">
            {readinessPercent}
          </span>
        </div>

        {/* Company's industry benchmark if found */}
        {companyBenchmark && (
          <div className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-right">
              <span className="text-xs font-semibold text-[#1A1A1A]">{companyBenchmark.name}</span>
              <span className="text-xs text-[#9CA3AF] block">industry avg</span>
            </div>
            <div className="flex-1 relative h-5 bg-[#F0EBE3] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6D28D9]/60 transition-all duration-700"
                style={{ width: `${companyBenchmark.value}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#6D28D9] w-8 text-right">
              {companyBenchmark.value}%
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[#F0EBE3] my-1" />

        {/* Other sectors */}
        {displaySectors.map((sector) => (
          <div key={sector.name} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-right">
              <span className="text-xs text-[#6B7280]">{sector.name}</span>
            </div>
            <div className="flex-1 relative h-3 bg-[#F0EBE3] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#D1C4E9] transition-all duration-700"
                style={{ width: `${sector.value}%` }}
              />
            </div>
            <span className="text-xs text-[#9CA3AF] w-8 text-right">{sector.value}%</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#9CA3AF] mt-4 border-t border-[#F0EBE3] pt-3">
        Industry adoption rates reflect % of companies in each vertical actively using stablecoins
        for payment or treasury operations. Source: World Bank RPW + industry surveys.
      </p>
    </div>
  );
}
