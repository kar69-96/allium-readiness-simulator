interface Props {
  keyInsight: string;
  primaryGap: string;
}

export default function InsightBlock({ keyInsight, primaryGap }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 5v3l2 2" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#059669]">Key Insight</p>
        </div>
        <p className="text-sm text-[#374151] leading-relaxed">{keyInsight}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4v5M8 11v1" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="8" r="6.5" stroke="#DC2626" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#DC2626]">Primary Gap</p>
        </div>
        <p className="text-sm text-[#374151] leading-relaxed">{primaryGap}</p>
      </div>
    </div>
  );
}
