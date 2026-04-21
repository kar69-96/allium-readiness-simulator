"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import LoadingAnimation from "./LoadingAnimation";

export default function CompanyInput() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName.trim() }),
      });

      const raw = await res.text();
      let payload: { slug?: string; error?: string } | null = null;
      if (raw.trim()) {
        try {
          payload = JSON.parse(raw) as { slug?: string; error?: string };
        } catch {
          throw new Error(
            res.ok
              ? "Invalid response from server. Please try again."
              : `Request failed (${res.status}). Please try again.`
          );
        }
      }

      if (!res.ok) {
        throw new Error(
          payload?.error ?? `Request failed (${res.status}). Please try again.`
        );
      }

      if (!payload?.slug) {
        throw new Error("Invalid response from server. Please try again.");
      }

      router.push(`/report/${payload.slug}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (loading) return <LoadingAnimation />;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      <div className="relative">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name (e.g. Stripe, Remitly, Shopify)"
          className="w-full px-5 py-4 text-lg rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          autoFocus
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={!companyName.trim() || loading}
        className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-lg transition-colors"
      >
        Generate Readiness Report
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </form>
  );
}
