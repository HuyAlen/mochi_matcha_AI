import { weeklyMenu } from "@/src/data/nutrition/weeklyMenus";

export default function WeeklyMenuCard() {
  return (
    <div className="space-y-3">
      {weeklyMenu.map((day) => (
        <article
          key={day.day}
          className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
        >
          <h3 className="font-black text-pink-600">{day.day}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-pink-50 p-3">
              <p className="text-xs font-bold text-pink-500">Sáng</p>
              <p className="mt-1 font-bold text-slate-800">{day.breakfast}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-500">Trưa</p>
              <p className="mt-1 font-bold text-slate-800">{day.lunch}</p>
            </div>
            <div className="rounded-2xl bg-lime-50 p-3">
              <p className="text-xs font-bold text-lime-600">Phụ</p>
              <p className="mt-1 font-bold text-slate-800">{day.snack}</p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3">
              <p className="text-xs font-bold text-purple-500">Tối</p>
              <p className="mt-1 font-bold text-slate-800">{day.dinner}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
