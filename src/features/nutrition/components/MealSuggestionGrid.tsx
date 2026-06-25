import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";

interface MealSuggestionGridProps {
  onSelectRecipe?: (recipeId: string) => void;
}

export default function MealSuggestionGrid({
  onSelectRecipe,
}: MealSuggestionGridProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-950">Gợi ý hôm nay</h3>
        <button type="button" className="text-sm font-bold text-pink-500">
          Xem thêm
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {mealRecipes.map((meal) => (
          <button
            key={meal.id}
            type="button"
            onClick={() => onSelectRecipe?.(meal.id)}
            className="overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-100"
          >
            <div className="relative flex h-28 items-center justify-center bg-linear-to-br from-pink-50 to-amber-50 text-6xl">
              {meal.emoji}
              <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white text-pink-500 shadow-sm">
                ♡
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-400">
                {meal.prepMinutes} phút · {meal.calories} kcal
              </p>
              <h4 className="mt-1 min-h-10 text-sm font-black leading-5 text-slate-950">
                {meal.title}
              </h4>
              <div className="mt-3 flex flex-wrap gap-1">
                {meal.nutritionTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-pink-50 px-2 py-1 text-[10px] font-bold text-pink-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
