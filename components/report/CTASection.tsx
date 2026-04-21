"use client";

import { useState } from "react";
import { SimulatorReport } from "@/types/report";
import { ConfidenceLevel } from "@/types/report";
import ShareModal from "./ShareModal";

const CONFIDENCE_STYLES: Record<ConfidenceLevel, { bg: string; text: string; border: string }> = {
  high: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  low: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

interface Props {
  report: SimulatorReport;
  slug: string;
}

export default function CTASection({ report, slug }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const styles = CONFIDENCE_STYLES[report.confidence];

  return (
    <>
      <div className="space-y-5">
        {/* Confidence note */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ backgroundColor: styles.bg, borderColor: styles.border }}
        >
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0"
            style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}
          >
            {report.confidence} confidence
          </span>
          <p className="text-sm" style={{ color: styles.text }}>{report.confidence_note}</p>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.allium.so/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#B66AD1] hover:bg-purple-600 text-white font-semibold transition-colors text-center shadow-sm"
          >
            Book a Full Analysis →
          </a>
          <button
            onClick={() => setShareOpen(true)}
            className="py-4 px-6 rounded-2xl border border-[#E5E0D8] bg-white hover:bg-[#FAF8F4] text-[#1A1A1A] font-semibold transition-colors shadow-sm"
          >
            Share This Report ↗
          </button>
        </div>
      </div>

      {shareOpen && (
        <ShareModal
          slug={slug}
          companyName={report.company_name}
          score={report.overall_score}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
