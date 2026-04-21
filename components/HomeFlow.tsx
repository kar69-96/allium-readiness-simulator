"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CompanyInput from "./CompanyInput";
import EmailCaptureScreen from "./EmailCaptureScreen";
import { SimulatorReport } from "@/types/report";

type Step = "input" | "loading";

export default function HomeFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const slugRef = useRef<string | null>(null);
  const pendingEmailRef = useRef<string | null>(null);

  async function handleSubmit(name: string) {
    setCompanyName(name);
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: name }),
      });

      const raw = await res.text();
      let payload: { slug?: string; report?: SimulatorReport; error?: string } | null = null;
      if (raw.trim()) {
        try {
          payload = JSON.parse(raw);
        } catch {
          throw new Error(
            res.ok
              ? "Invalid response from server. Please try again."
              : `Request failed (${res.status}). Please try again.`
          );
        }
      }

      if (!res.ok) {
        throw new Error(payload?.error ?? `Request failed (${res.status}). Please try again.`);
      }

      if (!payload?.slug) {
        throw new Error("Invalid response from server. Please try again.");
      }

      slugRef.current = payload.slug;

      if (payload.report) {
        sessionStorage.setItem(`report_${payload.slug}`, JSON.stringify(payload.report));
      }

      if (pendingEmailRef.current) {
        fetch("/api/capture-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingEmailRef.current, slug: payload.slug }),
        }).catch(() => {});
      }

      router.push(`/report/${payload.slug}`);
    } catch (err) {
      setStep("input");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleEmailCapture(email: string) {
    if (slugRef.current) {
      fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug: slugRef.current }),
      }).catch(() => {});
    } else {
      pendingEmailRef.current = email;
    }
  }

  if (step === "loading") {
    return (
      <EmailCaptureScreen
        companyName={companyName}
        onEmailCapture={handleEmailCapture}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Top announcement bar */}
      <div className="w-full bg-[#E9D5FF] text-center py-2 px-4 text-xs font-medium text-purple-800 tracking-wide">
        Powered by Allium — The System of Record for Onchain Finance →{" "}
        <a
          href="https://www.allium.so"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-purple-900"
        >
          allium.so
        </a>
      </div>

      {/* Header */}
      <header className="w-full border-b border-[#E5E0D8] bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="9" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="5" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2" fill="#1A1A1A" />
            </svg>
            <span className="font-semibold text-[#1A1A1A] tracking-tight">Allium</span>
          </div>
          <a
            href="https://www.allium.so/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-widest bg-[#B66AD1] text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
          >
            Contact
          </a>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1]">
              Stablecoin Readiness
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
              Is your company ready
              <br />
              <span className="text-[#B66AD1]">for stablecoins?</span>
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed max-w-lg mx-auto">
              Get an instant AI-generated readiness score, revenue unlock estimate,
              and cost savings analysis — no account required.
            </p>
          </div>

          <CompanyInput onSubmit={handleSubmit} error={error} />

          <p className="text-xs text-[#9CA3AF] text-center max-w-sm mx-auto">
            Reports generated from public data and AI analysis. No login required.
            Results cached for 7 days.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] py-6 text-center">
        <p className="text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} Allium · System of Record for Onchain Finance
        </p>
      </footer>
    </main>
  );
}
