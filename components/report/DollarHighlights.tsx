function formatRange(value: number): string {
  const low = value * 0.7;
  const high = value * 1.4;
  const fmt = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    style: "currency",
    currency: "USD",
  });
  return `${fmt.format(low)}–${fmt.format(high)}`;
}

interface Props {
  revenueUnlock: number;
  costSavings: number;
  timeToLive: string;
}

export default function DollarHighlights({ revenueUnlock, costSavings, timeToLive }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] text-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M6 7l4-4 4 4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Revenue Unlock</p>
        <p className="text-2xl font-bold text-[#059669]">{formatRange(revenueUnlock)}</p>
        <p className="text-xs text-[#9CA3AF] mt-1">annually</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] text-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10h14M7 6l-4 4 4 4" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Cost Savings</p>
        <p className="text-2xl font-bold text-[#7C3AED]">{formatRange(costSavings)}</p>
        <p className="text-xs text-[#9CA3AF] mt-1">annually</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] text-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="#D97706" strokeWidth="1.5" />
            <path d="M10 6v4l3 2" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Time to First Transaction</p>
        <p className="text-2xl font-bold text-[#D97706]">~{timeToLive}w</p>
        <p className="text-xs text-[#9CA3AF] mt-1">weeks to go live</p>
      </div>
    </div>
  );
}
