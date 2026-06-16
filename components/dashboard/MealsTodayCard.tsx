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

  const fallbackMeals = mealRecipes.slice(0, 3);
  const meals = todayMeals.length > 0 ? todayMeals : fallbackMeals;

  return (
    <Link
      href="/nutrition"
      className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-pink-500">🥣 Meals Today</p>
          <h3 className="mt-1 font-black text-slate-950">Ăn dặm hôm nay</h3>
        </div>
        <span className="text-slate-300">›</span>
      </div>

      <div className="mt-4 space-y-3">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-2xl">
                {meal.emoji}
              </span>
              <div>
                <p className="text-sm font-black text-slate-800">
                  {meal.title}
                </p>
                <p className="text-xs text-slate-400">
                  {mealTimeLabel[meal.mealTime]} · {meal.calories} kcal
                </p>
              </div>
            </div>
            <p className="text-xs font-bold text-pink-500">
              {meal.ageFromMonths}+m
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-2xl bg-pink-50 p-3 text-sm font-semibold leading-6 text-pink-700">
        💡 AI: Hôm nay đã có tinh bột, đạm và chất béo tốt cho bữa ăn dặm.
      </p>
    </Link>
  );
}
