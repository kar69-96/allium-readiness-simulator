import { ScoreTier } from "@/types/report";

const TIER_COLORS: Record<ScoreTier, { bg: string; text: string; border: string }> = {
  "Early adopter": { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD" },
  "Ready to launch": { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "Strong candidate": { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  "Pilot recommended": { bg: "#E9D5FF", text: "#6B21A8", border: "#D8B4FE" },
};

const TIER_STROKE: Record<ScoreTier, string> = {
  "Early adopter": "#7C3AED",
  "Ready to launch": "#D97706",
  "Strong candidate": "#059669",
  "Pilot recommended": "#B66AD1",
};

interface Props {
  score: number;
  tier: ScoreTier;
  companyName: string;
}

export default function ScoreGauge({ score, tier, companyName }: Props) {
  const circumference = 2 * Math.PI * 54;
  const filled = (score / 100) * circumference;
  const colors = TIER_COLORS[tier];
  const stroke = TIER_STROKE[tier];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
        Stablecoin Readiness Score
      </p>
      <h1 className="text-3xl font-bold text-[#1A1A1A]">{companyName}</h1>

      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F0EBE3" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-[#1A1A1A]">{score}</span>
          <span className="text-xs text-[#9CA3AF]">/ 100</span>
        </div>
      </div>

      <span
        className="px-5 py-2 rounded-full text-sm font-semibold border"
        style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
      >
        {tier}
      </span>
    </div>
  );
}
