import { predictNextWeight } from "@/src/services/growth/growthAnalyzer";
import type { Baby } from "@/types/baby";
import type { GrowthSummary } from "@/types/growth";

interface GrowthPredictionCardProps {
  baby: Baby;
  summary: GrowthSummary;
}

export default function GrowthPredictionCard({
  baby,
  summary,
}: GrowthPredictionCardProps) {
  const nextWeight = predictNextWeight(summary);
  const isNormal = summary.trend === "normal";

  return (
    <section className="rounded-4xl bg-linear-to-br from-pink-100 via-white to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-600">
        Mind AI Insight
      </p>

      <h3 className="mt-2 text-xl font-black leading-7 text-slate-950">
        {baby.nickname || baby.name} đang tăng trưởng{" "}
        {isNormal ? "ổn định" : "cần theo dõi thêm"} 🎉
      </h3>

      <div className="mt-4 rounded-3xl bg-white/70 p-4 ring-1 ring-white">
        <p className="text-sm font-black text-slate-950">
          Dự đoán tháng tới: khoảng {nextWeight}kg
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          Bé đang ở khoảng P{summary.estimatedWeightPercentile} cân nặng và P
          {summary.estimatedHeightPercentile} chiều cao. Dự đoán dựa trên tốc độ
          tăng gần đây và chỉ dùng để tham khảo, không thay thế tư vấn bác sĩ.
        </p>
      </div>
    </section>
  );
}
