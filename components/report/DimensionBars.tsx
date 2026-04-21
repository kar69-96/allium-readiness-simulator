"use client";

import { useState } from "react";
import { SimulatorReport } from "@/types/report";

const DIMENSION_LABELS: Record<string, string> = {
  payment_infrastructure: "Payment Infrastructure",
  cross_border_exposure: "Cross-Border Exposure",
  compliance_posture: "Compliance Posture",
  treasury_ops_maturity: "Treasury Ops Maturity",
  on_chain_readiness: "On-Chain Readiness",
};

const DIMENSION_WEIGHTS: Record<string, string> = {
  payment_infrastructure: "25%",
  cross_border_exposure: "25%",
  compliance_posture: "20%",
  treasury_ops_maturity: "15%",
  on_chain_readiness: "15%",
};

function scoreConfig(score: number) {
  if (score >= 70) return { bar: "#059669", bg: "#D1FAE5", text: "#065F46" };
  if (score >= 45) return { bar: "#D97706", bg: "#FEF3C7", text: "#92400E" };
  return { bar: "#DC2626", bg: "#FEE2E2", text: "#991B1B" };
}

interface Props {
  dimensions: SimulatorReport["dimensions"];
}

export default function DimensionBars({ dimensions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="mb-1">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
          Dimension Breakdown
        </h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Click any dimension to read the rationale</p>
      </div>
      {Object.entries(dimensions).map(([key, dim]) => {
        const cfg = scoreConfig(dim.score);
        return (
          <div
            key={key}
            className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm"
          >
            <button
              className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#FAF8F4] transition-colors"
              onClick={() => setExpanded(expanded === key ? null : key)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {DIMENSION_LABELS[key]}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-[#9CA3AF]">wt {DIMENSION_WEIGHTS[key]}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                      {dim.score}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#F0EBE3] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${dim.score}%`, backgroundColor: cfg.bar }}
                  />
                </div>
              </div>
              <span className="text-[#9CA3AF] text-xs ml-2">{expanded === key ? "▲" : "▼"}</span>
            </button>
            {expanded === key && (
              <div className="px-5 pb-5 pt-1 text-sm text-[#6B7280] border-t border-[#F0EBE3] leading-relaxed">
                {dim.rationale}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
