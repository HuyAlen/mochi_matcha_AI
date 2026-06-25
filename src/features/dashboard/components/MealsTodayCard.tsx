"use client";

import Link from "next/link";
import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";
import { useMealStore } from "@/src/store/mealStore";
import type { MealEntry } from "@/types/meal";

const mealTimeLabel = {
  breakfast: "Sáng",
  lunch: "Trưa",
  snack: "Phụ",
  dinner: "Tối",
};

export default function MealsTodayCard() {
  const entries = useMealStore(
    (state: { entries: MealEntry[] }) => state.entries,
  );

  const recentRecipeIds = new Set(
    entries.slice(0, 4).map((entry) => entry.recipeId),
  );

  const todayMeals = mealRecipes
    .filter((recipe) => recentRecipeIds.has(recipe.id))
    .slice(0, 3);

  const meals = todayMeals.length > 0 ? todayMeals : mealRecipes.slice(0, 3);

  return (
    <Link
      href="/nutrition"
      className="block rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Dinh dưỡng
          </p>
          <h3 className="mt-1 font-black text-slate-950">Ăn dặm hôm nay</h3>
        </div>
        <span className="text-xl font-light text-slate-300">›</span>
      </div>

      <div className="mt-4 space-y-3">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                {meal.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-800">
                  {meal.title}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {mealTimeLabel[meal.mealTime]} · {meal.calories} kcal
                </p>
              </div>
            </div>
            <p className="shrink-0 text-xs font-bold text-pink-500">
              {meal.ageFromMonths}+m
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}
