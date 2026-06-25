const chartPoints = [
  { x: 0, y: 82 },
  { x: 18, y: 70 },
  { x: 36, y: 58 },
  { x: 54, y: 44 },
  { x: 72, y: 38 },
  { x: 90, y: 28 },
];

interface GrowthChartCardProps {
  latestWeight: string;
}

export default function GrowthChartCard({
  latestWeight,
}: GrowthChartCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-black text-slate-950">Cân nặng (kg)</h3>
          <p className="mt-1 text-xs text-slate-400">
            Theo dõi từ 01/05 đến 15/06
          </p>
        </div>
        <div className="rounded-2xl bg-pink-50 px-3 py-2 text-right">
          <p className="font-black text-pink-600">{latestWeight} kg</p>
          <p className="text-[10px] text-slate-400">15/06/2026</p>
        </div>
      </div>

      <div className="relative h-48 overflow-hidden rounded-3xl bg-linear-to-b from-pink-50 to-white p-4">
        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-pink-100" />

        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          <polyline
            points={chartPoints
              .map((point) => `${point.x},${point.y}`)
              .join(" ")}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {chartPoints.map((point) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="2.5"
              fill="#ec4899"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
