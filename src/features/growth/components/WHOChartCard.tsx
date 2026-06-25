import type { BabyId } from "@/types/baby";
import type { GrowthMetricType, GrowthRecord } from "@/types/growth";

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

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default function WHOChartCard({
  babyId,
  records,
  metric,
}: WHOChartCardProps) {
  const config = metricConfig[metric];
  const babyRecords = records
    .filter((record) => record.babyId === babyId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (babyRecords.length === 0) {
    return (
      <section className="rounded-4xl bg-white p-6 text-center shadow-sm ring-1 ring-pink-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-pink-50 text-2xl">
          📈
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">
          Chưa có dữ liệu tăng trưởng
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          Khi có bản ghi cân nặng, chiều cao hoặc vòng đầu, biểu đồ sẽ hiển thị
          tại đây.
        </p>
      </section>
    );
  }

  const latest = babyRecords[babyRecords.length - 1];
  const values = babyRecords.map(config.getValue);
  const hasMultipleRecords = babyRecords.length > 1;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const min = hasMultipleRecords ? minValue - 0.5 : minValue - 1;
  const max = hasMultipleRecords ? maxValue + 0.5 : maxValue + 1;
  const range = Math.max(0.1, max - min);

  const pointData = babyRecords.map((record, index) => {
    const value = config.getValue(record);
    const x =
      babyRecords.length === 1 ? 50 : (index / (babyRecords.length - 1)) * 100;
    const y = 90 - ((value - min) / range) * 70;

    return {
      key: `${record.id}-${metric}`,
      x: x.toFixed(1),
      y: y.toFixed(1),
      value,
      date: formatShortDate(record.date),
    };
  });

  const polylinePoints = pointData.map((point) => `${point.x},${point.y}`);

  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-400">
            WHO Chart
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {config.title} theo tháng
          </h3>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
            Theo dõi nội bộ, chưa thay thế biểu đồ WHO y khoa.
          </p>
        </div>

        <div className="shrink-0 rounded-3xl bg-pink-50 px-4 py-3 text-center">
          <p className="text-xl font-black text-pink-600">
            {config.getValue(latest)}
          </p>
          <p className="text-xs font-black text-pink-500">{config.unit}</p>
          <p className="mt-1 text-[10px] font-bold text-slate-400">Mới nhất</p>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden rounded-4xl bg-linear-to-b from-pink-50 to-white px-4 pb-8 pt-5">
        <div className="absolute inset-x-5 top-1/4 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-5 top-1/2 border-t border-dashed border-pink-100" />
        <div className="absolute inset-x-5 top-3/4 border-t border-dashed border-pink-100" />

        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          {hasMultipleRecords ? (
            <polyline
              points={polylinePoints.join(" ")}
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {pointData.map((point) => (
            <g key={point.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hasMultipleRecords ? "2.8" : "4"}
                fill="#ec4899"
                stroke="white"
                strokeWidth="1.5"
              />
              {!hasMultipleRecords ? (
                <text
                  x={point.x}
                  y={Number(point.y) - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[4px] font-bold"
                >
                  {point.value} {config.unit}
                </text>
              ) : null}
            </g>
          ))}
        </svg>

        <div className="absolute inset-x-5 bottom-3 flex justify-between text-[10px] font-bold text-slate-400">
          <span>{pointData[0]?.date}</span>
          <span>{pointData[pointData.length - 1]?.date}</span>
        </div>
      </div>

      {!hasMultipleRecords ? (
        <p className="mt-3 rounded-2xl bg-pink-50 px-4 py-3 text-xs font-bold leading-5 text-slate-500">
          Cần ít nhất 2 lần đo để hiển thị đường xu hướng rõ hơn.
        </p>
      ) : null}
    </section>
  );
}
