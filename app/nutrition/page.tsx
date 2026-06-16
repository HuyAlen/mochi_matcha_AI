"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import BabyMealSelector from "@/components/nutrition/BabyMealSelector";
import FoodLibraryList from "@/components/nutrition/FoodLibraryList";
import MealEntryQuickAdd from "@/components/nutrition/MealEntryQuickAdd";
import MealHistoryCard from "@/components/nutrition/MealHistoryCard";
import MealSuggestionGrid from "@/components/nutrition/MealSuggestionGrid";
import NutritionInsightCard from "@/components/nutrition/NutritionInsightCard";
import NutritionScoreCard from "@/components/nutrition/NutritionScoreCard";
import NutritionTabs, {
  type NutritionTab,
} from "@/components/nutrition/NutritionTabs";
import ShoppingListCard from "@/components/nutrition/ShoppingListCard";
import WeeklyMenuCard from "@/components/nutrition/WeeklyMenuCard";
import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";
import { calculateNutritionScore } from "@/src/services/nutrition/nutritionAnalyzer";
import { useMealStore } from "@/src/store/mealStore";
import type { BabyId } from "@/types/baby";
import type { MealEntry } from "@/types/meal";

export default function NutritionPage() {
  const [tab, setTab] = useState<NutritionTab>("suggestion");
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [selectedRecipeId, setSelectedRecipeId] = useState("oat-banana");

  const entries = useMealStore(
    (state: { entries: MealEntry[] }) => state.entries,
  );

  const addMealEntry = useMealStore(
    (state: {
      addMealEntry: (entry: Omit<MealEntry, "id" | "createdAt">) => void;
    }) => state.addMealEntry,
  );

  const score = calculateNutritionScore(selectedBabyId, entries, mealRecipes);

  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Thực đơn & Dinh dưỡng
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gợi ý ăn dặm cá nhân hóa cho Mochi & Matcha.
          </p>
        </div>

        <NutritionTabs tab={tab} onChange={setTab} />

        <BabyMealSelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
        />

        {tab === "suggestion" && (
          <>
            <NutritionScoreCard score={score} />

            <MealSuggestionGrid onSelectRecipe={setSelectedRecipeId} />

            <MealEntryQuickAdd
              selectedBabyId={selectedBabyId}
              selectedRecipeId={selectedRecipeId}
              onAddMeal={addMealEntry}
            />

            <NutritionInsightCard />

            <MealHistoryCard entries={entries} />
          </>
        )}

        {tab === "library" && <FoodLibraryList />}

        {tab === "weekly" && <WeeklyMenuCard />}

        {tab === "shopping" && <ShoppingListCard />}
      </section>
    </AppShell>
  );
}
