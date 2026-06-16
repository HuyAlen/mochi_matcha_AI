import type { GrowthSummary } from "@/types/growth";

interface GrowthTrendCardProps {
  summary: GrowthSummary;
}

export default function GrowthTrendCard({ summary }: GrowthTrendCardProps) {
  const trendText = {
    slow: "Tăng chậm",
    normal: "Ổn định",
    fast: "Tăng nhanh",
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Growth Trend</h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pink-50 p-4">
          <p className="text-2xl font-black text-pink-600">
            +{summary.weightChangeKg}kg
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Cân nặng tháng này
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4">
          <p className="text-2xl font-black text-purple-600">
            +{summary.heightChangeCm}cm
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Chiều cao tháng này
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-500">Xu hướng</p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {trendText[summary.trend]}
        </p>
      </div>
    </div>
  );
}
