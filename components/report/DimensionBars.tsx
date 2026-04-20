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

function scoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 45) return "bg-yellow-500";
  return "bg-red-500";
}

interface Props {
  dimensions: SimulatorReport["dimensions"];
}

export default function DimensionBars({ dimensions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Dimension Breakdown</h2>
      {Object.entries(dimensions).map(([key, dim]) => (
        <div key={key} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <button
            className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpanded(expanded === key ? null : key)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">{DIMENSION_LABELS[key]}</span>
                <span className="text-xs text-gray-500 ml-2 shrink-0">
                  weight {DIMENSION_WEIGHTS[key]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${scoreColor(dim.score)}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-8 text-right">{dim.score}</span>
              </div>
            </div>
            <span className="text-gray-600 text-xs">{expanded === key ? "▲" : "▼"}</span>
          </button>
          {expanded === key && (
            <div className="px-5 pb-4 text-sm text-gray-400 border-t border-gray-800 pt-3">
              {dim.rationale}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
