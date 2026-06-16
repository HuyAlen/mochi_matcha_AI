export default function NutritionInsightCard() {
  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">AI Nutrition</p>
      <h3 className="mt-2 font-black text-slate-950">
        Matcha ăn ít bữa chiều 3 ngày gần đây.
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Gợi ý thử bơ nghiền hoặc cháo mềm, chia lượng nhỏ hơn.
      </p>
    </div>
  );
}
