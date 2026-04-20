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
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Revenue Unlock</p>
        <p className="text-3xl font-bold text-emerald-400">{formatRange(revenueUnlock)}</p>
        <p className="text-xs text-gray-600 mt-1">annually</p>
      </div>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Cost Savings</p>
        <p className="text-3xl font-bold text-blue-400">{formatRange(costSavings)}</p>
        <p className="text-xs text-gray-600 mt-1">annually</p>
      </div>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Time to First Transaction</p>
        <p className="text-3xl font-bold text-purple-400">~{timeToLive}w</p>
        <p className="text-xs text-gray-600 mt-1">weeks to go live</p>
      </div>
    </div>
  );
}
