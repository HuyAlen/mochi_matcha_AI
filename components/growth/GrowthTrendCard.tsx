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

  const trendTone = {
    slow: "bg-amber-50 text-amber-600",
    normal: "bg-emerald-50 text-emerald-600",
    fast: "bg-pink-50 text-pink-600",
  };

  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <h3 className="text-lg font-black text-slate-950">
        Xu hướng tăng trưởng
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-pink-50 p-4">
          <p className="text-2xl font-black text-pink-600">
            +{summary.weightChangeKg}kg
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Cân nặng tháng này
          </p>
        </div>

        <div className="rounded-3xl bg-purple-50 p-4">
          <p className="text-2xl font-black text-purple-600">
            +{summary.heightChangeCm}cm
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Chiều cao tháng này
          </p>
        </div>
      </div>

      <div className={`mt-4 rounded-3xl p-4 ${trendTone[summary.trend]}`}>
        <p className="text-sm font-bold opacity-80">Xu hướng</p>
        <p className="mt-1 text-xl font-black">{trendText[summary.trend]}</p>
      </div>
    </section>
  );
}
