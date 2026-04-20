interface Props {
  keyInsight: string;
  primaryGap: string;
}

export default function InsightBlock({ keyInsight, primaryGap }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-xl p-5">
        <p className="text-xs text-emerald-500 uppercase tracking-widest mb-2 font-semibold">Key Insight</p>
        <p className="text-gray-200 text-sm leading-relaxed">{keyInsight}</p>
      </div>
      <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-5">
        <p className="text-xs text-red-400 uppercase tracking-widest mb-2 font-semibold">Primary Gap</p>
        <p className="text-gray-300 text-sm">{primaryGap}</p>
      </div>
    </div>
  );
}
