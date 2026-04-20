interface Props {
  useCases: [string, string, string];
}

const PILL_COLORS = [
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "bg-purple-500/15 text-purple-300 border-purple-500/30",
];

export default function UseCasePills({ useCases }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Top Use Cases</h2>
      <div className="flex flex-wrap gap-3">
        {useCases.map((uc, i) => (
          <span
            key={uc}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${PILL_COLORS[i]}`}
          >
            {uc}
          </span>
        ))}
      </div>
    </div>
  );
}
