"use client";

import { useState } from "react";
import { SimulatorReport } from "@/types/report";
import { ConfidenceLevel } from "@/types/report";

const CONFIDENCE_BADGE: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  low: "bg-red-500/20 text-red-400 border-red-500/40",
};

interface Props {
  report: SimulatorReport;
  slug: string;
}

export default function CTASection({ report, slug }: Props) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleEmailCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug }),
      });
      setEmailSent(true);
    } catch {
      // Silently fail
    } finally {
      setEmailLoading(false);
    }
  }

  const bookingUrl = `https://meetings.hubspot.com/allium?company=${encodeURIComponent(report.company_name)}&score=${report.overall_score}`;

  return (
    <div className="space-y-6">
      {/* Confidence footnote */}
      <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${CONFIDENCE_BADGE[report.confidence]}`}>
          {report.confidence} confidence
        </span>
        <p className="text-sm text-gray-500">{report.confidence_note}</p>
      </div>

      {/* Primary CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors text-center"
        >
          Book a Full Analysis →
        </a>
        <button
          onClick={handleShare}
          className="py-4 px-6 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold transition-colors"
        >
          {copied ? "✓ Link Copied!" : "Share This Report"}
        </button>
      </div>

      {/* Email gate */}
      {!emailSent ? (
        <form onSubmit={handleEmailCapture} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Send this report to your inbox"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button
            type="submit"
            disabled={!email.trim() || emailLoading}
            className="px-5 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-medium text-sm transition-colors"
          >
            {emailLoading ? "…" : "Send"}
          </button>
        </form>
      ) : (
        <p className="text-center text-emerald-400 text-sm">Report sent! Check your inbox.</p>
      )}
    </div>
  );
}
