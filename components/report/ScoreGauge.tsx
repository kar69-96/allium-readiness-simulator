import { ScoreTier } from "@/types/report";

const TIER_COLORS: Record<ScoreTier, string> = {
  "Early adopter": "text-blue-400",
  "Ready to launch": "text-yellow-400",
  "Strong candidate": "text-emerald-400",
  "Pilot recommended": "text-purple-400",
};

const TIER_BG: Record<ScoreTier, string> = {
  "Early adopter": "bg-blue-500/20 border-blue-500/40",
  "Ready to launch": "bg-yellow-500/20 border-yellow-500/40",
  "Strong candidate": "bg-emerald-500/20 border-emerald-500/40",
  "Pilot recommended": "bg-purple-500/20 border-purple-500/40",
};

interface Props {
  score: number;
  tier: ScoreTier;
  companyName: string;
}

export default function ScoreGauge({ score, tier, companyName }: Props) {
  const circumference = 2 * Math.PI * 54;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-gray-400 text-sm uppercase tracking-widest">Stablecoin Readiness Score</p>
      <h1 className="text-3xl font-bold text-white">{companyName}</h1>

      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>

      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${TIER_BG[tier]} ${TIER_COLORS[tier]}`}>
        {tier}
      </span>
    </div>
  );
}
