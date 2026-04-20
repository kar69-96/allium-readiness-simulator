import CompanyInput from "@/components/CompanyInput";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center space-y-6 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-widest">
          Powered by Allium
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Stablecoin Readiness
          <br />
          <span className="text-emerald-400">Simulator</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
          Enter any company name to receive an instant AI-generated readiness score,
          revenue unlock estimate, and cost savings analysis — no account required.
        </p>
      </div>

      <CompanyInput />

      <p className="mt-8 text-xs text-gray-700 text-center max-w-sm">
        Reports are generated from public data and AI analysis. No login required.
        Results are cached for 7 days.
      </p>
    </main>
  );
}
