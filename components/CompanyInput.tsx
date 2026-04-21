"use client";

import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (companyName: string) => void;
  error?: string | null;
}

export default function CompanyInput({ onSubmit, error }: Props) {
  const [companyName, setCompanyName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    onSubmit(companyName.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name (e.g. Stripe, Remitly, Shopify)"
          className="flex-1 px-5 py-4 text-base rounded-xl border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B66AD1] focus:border-transparent shadow-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!companyName.trim()}
          className="px-6 py-4 rounded-xl bg-[#B66AD1] hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide transition-colors shadow-sm whitespace-nowrap"
        >
          Analyze →
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </form>
  );
}
