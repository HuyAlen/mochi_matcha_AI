import type { GrowthSummary } from "@/types/growth";

interface GrowthStatsCardProps {
  summary: GrowthSummary;
}

export default function GrowthStatsCard({ summary }: GrowthStatsCardProps) {
  const stats = [
    [`${summary.latestWeightKg} kg`, "Cân nặng"],
    [`${summary.latestHeightCm} cm`, "Chiều cao"],
    [`${summary.latestHeadCircumferenceCm} cm`, "Vòng đầu"],
  ];

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Thông tin hiện tại</h3>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="font-black text-slate-950">{value}</p>
            <p className="mt-1 text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pink-50 p-3 text-center">
          <p className="text-xl font-black text-pink-600">
            P{summary.estimatedWeightPercentile}
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Percentile cân nặng
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-3 text-center">
          <p className="text-xl font-black text-purple-600">
            P{summary.estimatedHeightPercentile}
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Percentile chiều cao
          </p>
        </div>
      </div>
    </div>
  );
}
