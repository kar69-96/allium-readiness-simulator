"use client";

import { useEffect, useState, FormEvent } from "react";

const STEPS = [
  "Searching public filings…",
  "Analyzing payment corridors…",
  "Modeling cross-border exposure…",
  "Calculating revenue unlock…",
  "Generating your report…",
];

interface Props {
  companyName: string;
  onEmailCapture: (email: string) => void;
}

export default function EmailCaptureScreen({ companyName, onEmailCapture }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    onEmailCapture(email.trim());
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#E5E0D8] bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="9" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="5" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="2" fill="#1A1A1A" />
          </svg>
          <span className="font-semibold text-[#1A1A1A] tracking-tight">Allium</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left: Progress */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1] mb-4">
                Analyzing
              </p>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">
                {companyName}
              </h2>
              <p className="text-[#6B7280] text-sm mb-8">
                Building your stablecoin readiness report…
              </p>

              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                      i < currentStep
                        ? "bg-[#B66AD1] text-white"
                        : i === currentStep
                        ? "bg-[#E9D5FF] border-2 border-[#B66AD1]"
                        : "bg-[#F5F0EA] border border-[#E5E0D8]"
                    }`}>
                      {i < currentStep ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : i === currentStep ? (
                        <div className="w-2 h-2 rounded-full bg-[#B66AD1] animate-pulse" />
                      ) : null}
                    </div>
                    <span className={`text-sm transition-all duration-300 ${
                      i < currentStep
                        ? "text-[#9CA3AF] line-through"
                        : i === currentStep
                        ? "text-[#1A1A1A] font-medium"
                        : "text-[#D1C4C4]"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#9CA3AF] mt-8">
              This usually takes 15–30 seconds
            </p>
          </div>

          {/* Right: Email capture */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-sm flex flex-col justify-between">
            {!submitted ? (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B66AD1] mb-4">
                    While you wait
                  </p>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                    Get this report
                    <br />
                    in your inbox
                  </h2>
                  <p className="text-[#6B7280] text-sm mb-8">
                    We'll send you the full readiness breakdown, score rationale,
                    and a custom implementation roadmap for {companyName}.
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-[#FAF8F4] text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B66AD1] focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!email.trim()}
                      className="w-full py-3 rounded-xl bg-[#B66AD1] hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                    >
                      Send me the report
                    </button>
                  </form>
                </div>

                <p className="text-xs text-[#9CA3AF] mt-4 text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E9D5FF] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#B66AD1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">You're on the list!</p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    We'll email the report to <strong>{email}</strong>
                  </p>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Your report is still loading — we'll redirect you automatically.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
