"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SimulatorReport } from "@/types/report";
import ScoreGauge from "@/components/report/ScoreGauge";
import DollarHighlights from "@/components/report/DollarHighlights";
import RadarChart from "@/components/report/RadarChart";
import DimensionBars from "@/components/report/DimensionBars";
import UseCasePills from "@/components/report/UseCasePills";
import InsightBlock from "@/components/report/InsightBlock";
import CompetitorBenchmark from "@/components/report/CompetitorBenchmark";
import CTASection from "@/components/report/CTASection";

interface Props {
  slug: string;
  initialReport: SimulatorReport | null;
}

export default function ReportClientPage({ slug, initialReport }: Props) {
  const [report, setReport] = useState<SimulatorReport | null>(initialReport);
  const [checked, setChecked] = useState(initialReport !== null);

  useEffect(() => {
    if (report) return;
    try {
      const cached = sessionStorage.getItem(`report_${slug}`);
      if (cached) {
        setReport(JSON.parse(cached) as SimulatorReport);
      }
    } catch {
      // sessionStorage unavailable or parse error
    }
    setChecked(true);
  }, [slug, report]);

  if (!checked) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B66AD1] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E9D5FF] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 10v8M16 21v1" stroke="#B66AD1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="16" r="13" stroke="#B66AD1" strokeWidth="2" />
          </svg>
        </div>
        <div>
          <p className="text-[#1A1A1A] font-semibold text-lg">Report not found</p>
          <p className="text-[#6B7280] text-sm mt-1">This report has expired or could not be found.</p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-[#B66AD1] hover:bg-purple-600 text-white font-semibold transition-colors"
        >
          Generate a new report
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      {/* Top bar */}
      <div className="w-full bg-[#E9D5FF] text-center py-2 px-4 text-xs font-medium text-purple-800 tracking-wide">
        Powered by Allium —{" "}
        <a
          href="https://www.allium.so"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-purple-900"
        >
          The System of Record for Onchain Finance
        </a>
      </div>

      {/* Header */}
      <header className="w-full border-b border-[#E5E0D8] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="9" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="5" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2" fill="#1A1A1A" />
            </svg>
            <span className="font-semibold text-[#1A1A1A] tracking-tight">Allium</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            ← New report
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Hero: score + metadata */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#FAF8F4] to-[#F3EBF8] px-8 py-10 text-center">
            <ScoreGauge
              score={report.overall_score}
              tier={report.score_tier}
              companyName={report.company_name}
            />
          </div>
          <div className="border-t border-[#E5E0D8] px-8 py-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B66AD1]" />
                {report.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B66AD1]" />
                {report.hq_country}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B66AD1]" />
                {report.employee_band} employees
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B66AD1]" />
                {report.revenue_range}
              </span>
            </div>
          </div>
        </div>

        {/* Financial impact */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1]">
              Financial Impact
            </p>
            <h2 className="text-xl font-bold text-[#1A1A1A] mt-0.5">
              Estimated value of going onchain
            </h2>
          </div>
          <DollarHighlights
            revenueUnlock={report.revenue_unlock_usd}
            costSavings={report.cost_savings_usd}
            timeToLive={report.time_to_live_weeks}
          />
        </div>

        {/* Radar + Dimension breakdown side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RadarChart dimensions={report.dimensions} />
          <DimensionBars dimensions={report.dimensions} />
        </div>

        {/* Use cases + Industry benchmark side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UseCasePills useCases={report.top_use_cases} />
          <CompetitorBenchmark report={report} />
        </div>

        {/* Key insights */}
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1]">
              Analysis
            </p>
            <h2 className="text-xl font-bold text-[#1A1A1A] mt-0.5">
              Key findings
            </h2>
          </div>
          <InsightBlock keyInsight={report.key_insight} primaryGap={report.primary_gap} />
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm p-8">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1] mb-2">
              Next Steps
            </p>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              Ready to move forward?
            </h2>
            <p className="text-[#6B7280] text-sm mt-2 max-w-sm mx-auto">
              Our team can help you design a custom stablecoin implementation roadmap tailored
              to {report.company_name}&apos;s specific profile.
            </p>
          </div>
          <CTASection report={report} slug={slug} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#9CA3AF] pb-4">
          Report generated by Allium Stablecoin Readiness Engine ·{" "}
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </main>
  );
}
