import { babies } from "@/src/store/babyStore";
import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";
import type { MealEntry } from "@/types/meal";

interface MealHistoryCardProps {
  entries: MealEntry[];
}

export default function MealHistoryCard({ entries }: MealHistoryCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Bữa ăn gần đây</h3>

      <div className="mt-3 space-y-3">
        {entries.slice(0, 5).map((entry) => {
          const baby = babies.find((item) => item.id === entry.babyId);
          const recipe = mealRecipes.find((item) => item.id === entry.recipeId);

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{recipe?.emoji ?? "🍽️"}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {baby?.name} · {recipe?.title ?? "Bữa ăn"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Ăn {entry.eatenPercent}% ·{" "}
                    {new Date(entry.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <span className="text-lg">
                {entry.reaction === "liked" ? "💗" : "🙂"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
