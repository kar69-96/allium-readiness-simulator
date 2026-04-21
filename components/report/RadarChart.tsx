import { SimulatorReport } from "@/types/report";

const DIMENSIONS = [
  { key: "payment_infrastructure", label: "Payment\nInfra" },
  { key: "cross_border_exposure", label: "Cross-\nBorder" },
  { key: "compliance_posture", label: "Compliance" },
  { key: "treasury_ops_maturity", label: "Treasury\nOps" },
  { key: "on_chain_readiness", label: "On-Chain" },
] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function pentagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const { x, y } = polarToCartesian(cx, cy, r, (360 / 5) * i);
    return `${x},${y}`;
  }).join(" ");
}

interface Props {
  dimensions: SimulatorReport["dimensions"];
}

export default function RadarChart({ dimensions }: Props) {
  const cx = 160;
  const cy = 155;
  const maxR = 100;
  const labelR = 128;

  const scores = DIMENSIONS.map((d) => dimensions[d.key].score);

  const dataPoints = DIMENSIONS.map((_, i) => {
    const score = scores[i];
    const r = (score / 100) * maxR;
    return polarToCartesian(cx, cy, r, (360 / 5) * i);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const guideRatios = [0.25, 0.5, 0.75, 1];

  const labelAnchors = ["middle", "start", "start", "end", "end"];
  const labelDyOffsets = ["-0.5em", "0.3em", "0.3em", "0.3em", "0.3em"];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280] mb-1">
        Dimension Radar
      </h2>
      <p className="text-xs text-[#9CA3AF] mb-4">How each dimension contributes to your score</p>

      <div className="flex justify-center">
        <svg viewBox="0 0 320 310" width="100%" style={{ maxWidth: 340 }}>
          {/* Guide pentagons */}
          {guideRatios.map((ratio) => (
            <polygon
              key={ratio}
              points={pentagonPoints(cx, cy, maxR * ratio)}
              fill="none"
              stroke="#E5E0D8"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          {DIMENSIONS.map((_, i) => {
            const outer = polarToCartesian(cx, cy, maxR, (360 / 5) * i);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#E5E0D8"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={dataPolygon}
            fill="#B66AD1"
            fillOpacity="0.15"
            stroke="#B66AD1"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#B66AD1"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {/* Score labels on points */}
          {dataPoints.map((p, i) => (
            <text
              key={`score-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dy="-8"
              fontSize="9"
              fontWeight="600"
              fill="#B66AD1"
            >
              {scores[i]}
            </text>
          ))}

          {/* Axis labels */}
          {DIMENSIONS.map((dim, i) => {
            const pos = polarToCartesian(cx, cy, labelR, (360 / 5) * i);
            const lines = dim.label.split("\n");
            return (
              <text
                key={`label-${i}`}
                x={pos.x}
                y={pos.y}
                textAnchor={labelAnchors[i] as "middle" | "start" | "end"}
                fontSize="10"
                fill="#6B7280"
                fontWeight="500"
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={pos.x}
                    dy={li === 0 ? labelDyOffsets[i] : "1.1em"}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill="#E5E0D8" />
        </svg>
      </div>
    </div>
  );
}
