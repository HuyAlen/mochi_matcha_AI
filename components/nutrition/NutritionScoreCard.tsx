import type { NutritionScore } from "@/src/services/nutrition/nutritionAnalyzer";

interface NutritionScoreCardProps {
  score: NutritionScore;
}

export default function NutritionScoreCard({ score }: NutritionScoreCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-pink-500">Nutrition Score</p>
          <h3 className="mt-1 text-3xl font-black text-slate-950">
            {score.score}/100
          </h3>
        </div>
        <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-pink-100 to-purple-100 text-4xl">
          🥗
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {[
          ["Protein", score.proteinPercent],
          ["Rau củ", score.vegetablePercent],
          ["Chất béo tốt", score.healthyFatPercent],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-pink-400"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{score.insight}</p>
    </div>
  );
}
