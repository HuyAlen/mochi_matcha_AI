"use client";

import { babies } from "@/src/store/babyStore";
import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";
import type { BabyId } from "@/types/baby";
import type { MealEntry } from "@/types/meal";

interface MealEntryQuickAddProps {
  selectedBabyId: BabyId;
  selectedRecipeId: string;
  onAddMeal: (entry: Omit<MealEntry, "id" | "createdAt">) => void;
}

export default function MealEntryQuickAdd({
  selectedBabyId,
  selectedRecipeId,
  onAddMeal,
}: MealEntryQuickAddProps) {
  const baby = babies.find((item) => item.id === selectedBabyId);
  const recipe = mealRecipes.find((item) => item.id === selectedRecipeId);

  if (!recipe || !baby) return null;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-pink-500">Ghi nhận bữa ăn</p>
      <h3 className="mt-1 font-black text-slate-950">
        {baby.name} · {recipe.title}
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[50, 75, 100].map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() =>
              onAddMeal({
                babyId: selectedBabyId,
                recipeId: recipe.id,
                eatenPercent: percent,
                reaction: percent >= 75 ? "liked" : "normal",
              })
            }
            className="rounded-2xl bg-pink-50 px-3 py-3 text-sm font-black text-pink-600"
          >
            Ăn {percent}%
          </button>
        ))}
      </div>
    </div>
  );
}
