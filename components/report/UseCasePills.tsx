interface Props {
  useCases: [string, string, string];
}

const PILL_STYLES = [
  { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD", icon: "💡" },
  { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD", icon: "🔗" },
  { bg: "#F0FDF4", text: "#065F46", border: "#6EE7B7", icon: "⚡" },
];

export default function UseCasePills({ useCases }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280] mb-4">
        Top Use Cases
      </h2>
      <div className="flex flex-col gap-3">
        {useCases.map((uc, i) => {
          const style = PILL_STYLES[i];
          return (
            <div
              key={uc}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <span className="text-lg">{style.icon}</span>
              <span className="text-sm font-medium" style={{ color: style.text }}>
                {uc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
