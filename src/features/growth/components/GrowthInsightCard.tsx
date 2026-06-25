import type { Baby } from "@/types/baby";
import type { GrowthSummary } from "@/types/growth";

interface GrowthInsightCardProps {
  baby: Baby;
  summary: GrowthSummary;
}

export default function GrowthInsightCard({
  baby,
  summary,
}: GrowthInsightCardProps) {
  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">Mind AI nhận xét</p>
      <h3 className="mt-2 font-black text-slate-950">
        {baby.name} đang tăng trưởng{" "}
        {summary.trend === "normal" ? "ổn định" : "cần theo dõi"} 🎉
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Bé đang ở khoảng P{summary.estimatedWeightPercentile} cân nặng và P
        {summary.estimatedHeightPercentile} chiều cao. Mẹ nên tiếp tục ghi nhận
        hàng tháng để AI phát hiện xu hướng sớm hơn.
      </p>
    </div>
  );
}
