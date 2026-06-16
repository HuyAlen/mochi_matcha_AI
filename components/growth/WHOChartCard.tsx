import type { BabyId } from "@/types/baby";
import type { GrowthRecord, GrowthMetricType } from "@/types/growth";

interface WHOChartCardProps {
  babyId: BabyId;
  records: GrowthRecord[];
  metric: GrowthMetricType;
}

const metricConfig = {
  weight: {
    title: "Cân nặng",
    unit: "kg",
    getValue: (record: GrowthRecord) => record.weightKg,
  },
  height: {
    title: "Chiều cao",
    unit: "cm",
    getValue: (record: GrowthRecord) => record.heightCm,
  },
  head: {
    title: "Vòng đầu",
    unit: "cm",
    getValue: (record: GrowthRecord) => record.headCircumferenceCm,
  },
};

export default function WHOChartCard({
  babyId,
  records,
  metric,
}: WHOChartCardProps) {
  const config = metricConfig[metric];
  const babyRecords = records.filter((record) => record.babyId === babyId);
  const latest = babyRecords[babyRecords.length - 1];
  const values = babyRecords.map(config.getValue);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;

  const points = babyRecords.map((record, index) => {
    const value = config.getValue(record);
    const x =
      babyRecords.length === 1 ? 50 : (index / (babyRecords.length - 1)) * 100;
    const y = 90 - ((value - min) / (max - min)) * 70;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-black text-slate-950">
            {config.title} theo tháng
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Ước lượng theo dõi nội bộ, chưa thay thế biểu đồ WHO y khoa.
          </p>
        </div>

        <div className="rounded-2xl bg-pink-50 px-3 py-2 text-right">
          <p className="font-black text-pink-600">
            {config.getValue(latest)} {config.unit}
          </p>
          <p className="text-[10px] text-slate-400">Mới nhất</p>
        </div>
      </div>

      <div className="relative h-52 overflow-hidden rounded-3xl bg-linear-to-b from-pink-50 to-white p-4">
        <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-pink-100" />

        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point) => {
            const [cx, cy] = point.split(",");

            return (
              <circle
                key={point}
                cx={cx}
                cy={cy}
                r="2.8"
                fill="#ec4899"
                stroke="white"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
