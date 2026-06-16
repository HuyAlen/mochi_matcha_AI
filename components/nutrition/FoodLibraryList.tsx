import { foodLibrary } from "@/src/data/nutrition/foodLibrary";

const categoryLabel = {
  grain: "Tinh bột",
  protein: "Đạm",
  vegetable: "Rau củ",
  fruit: "Trái cây",
  fat: "Chất béo",
  dairy: "Sữa",
};

export default function FoodLibraryList() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Tìm kiếm món ăn, nguyên liệu..."
        />
      </div>

      {foodLibrary.map((food) => (
        <div
          key={food.id}
          className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-pink-50 text-4xl">
              {food.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-black text-slate-950">{food.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {categoryLabel[food.category]} · {food.ageFromMonths}+ tháng
                  </p>
                </div>
                <span className="rounded-full bg-lime-50 px-2 py-1 text-[10px] font-bold text-lime-700">
                  {food.nutrition.calories} kcal
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {food.benefits.slice(0, 3).map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
