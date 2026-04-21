"use client";

import { useState, useEffect, FormEvent } from "react";

interface Props {
  slug: string;
  companyName: string;
  score: number;
  onClose: () => void;
}

export default function ShareModal({ slug, companyName, score, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleEmailShare(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    await fetch("/api/capture-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, slug }),
    }).catch(() => {});
    setEmailSent(true);
  }

  function handleTwitter() {
    const text = encodeURIComponent(
      `${companyName} scored ${score}/100 on the Allium Stablecoin Readiness Simulator. See the full breakdown:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  }

  function handleLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[#1A1A1A]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FAF8F4] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Share this report</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          {companyName} — Readiness Score {score}/100
        </p>

        {/* Copy link */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
            Share link
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F4] text-xs text-[#6B7280] truncate"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-[#B66AD1] hover:bg-purple-600 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Email share */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
            Send via email
          </p>
          {!emailSent ? (
            <form onSubmit={handleEmailShare} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-3 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F4] text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B66AD1] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!email.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F4] border border-[#E5E0D8] hover:bg-[#F0EBE3] disabled:opacity-40 text-[#1A1A1A] text-xs font-semibold transition-colors"
              >
                Send
              </button>
            </form>
          ) : (
            <p className="text-sm text-[#059669] font-medium">✓ Report sent to {email}</p>
          )}
        </div>

        {/* Social */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-3">
            Share via
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleTwitter}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E0D8] hover:bg-[#FAF8F4] text-sm font-medium text-[#1A1A1A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter / X
            </button>
            <button
              onClick={handleLinkedIn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E0D8] hover:bg-[#FAF8F4] text-sm font-medium text-[#1A1A1A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
