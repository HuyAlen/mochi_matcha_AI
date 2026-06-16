import { predictNextWeight } from "@/src/services/growth/growthAnalyzer";
import type { GrowthSummary } from "@/types/growth";

interface GrowthPredictionCardProps {
  summary: GrowthSummary;
}

export default function GrowthPredictionCard({
  summary,
}: GrowthPredictionCardProps) {
  const nextWeight = predictNextWeight(summary);

  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">AI Growth Prediction</p>
      <h3 className="mt-2 text-lg font-black text-slate-950">
        Dự đoán tháng tới: khoảng {nextWeight}kg
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Dự đoán dựa trên tốc độ tăng gần đây. Đây là gợi ý tham khảo, không thay
        thế tư vấn bác sĩ.
      </p>
    </div>
  );
}
