import type { BabyId } from "@/types/baby";
import type { MealEntry, MealRecipe } from "@/types/meal";

export interface NutritionScore {
  score: number;
  proteinPercent: number;
  vegetablePercent: number;
  healthyFatPercent: number;
  insight: string;
}

export function calculateNutritionScore(
  babyId: BabyId,
  entries: MealEntry[],
  recipes: MealRecipe[],
): NutritionScore {
  const babyEntries = entries.filter((entry) => entry.babyId === babyId);
  const avgEaten =
    babyEntries.length > 0
      ? babyEntries.reduce((sum, entry) => sum + entry.eatenPercent, 0) /
        babyEntries.length
      : 0;

  const eatenRecipeIds = new Set(babyEntries.map((entry) => entry.recipeId));
  const eatenRecipes = recipes.filter((recipe) =>
    eatenRecipeIds.has(recipe.id),
  );

  const hasProtein = eatenRecipes.some((recipe) =>
    recipe.nutritionTags.some((tag) =>
      ["Protein", "DHA", "Omega-3"].includes(tag),
    ),
  );

  const hasHealthyFat = eatenRecipes.some((recipe) =>
    recipe.nutritionTags.some((tag) =>
      ["Chất béo tốt", "DHA", "Omega-3"].includes(tag),
    ),
  );

  const score = Math.round(
    Math.min(
      100,
      avgEaten * 0.7 + (hasProtein ? 15 : 0) + (hasHealthyFat ? 15 : 0),
    ),
  );

  return {
    score,
    proteinPercent: hasProtein ? 88 : 55,
    vegetablePercent: avgEaten >= 70 ? 80 : 58,
    healthyFatPercent: hasHealthyFat ? 90 : 62,
    insight:
      score >= 80
        ? "Bữa ăn hôm nay khá cân bằng, mẹ tiếp tục duy trì nhịp ăn hiện tại."
        : "Bé ăn chưa đều, mẹ có thể chia nhỏ khẩu phần và ưu tiên món mềm, dễ ăn.",
  };
}
