import type { MealEntry } from "@/types/meal";
import type { TrackingEntry } from "@/types/tracking";

interface AIDataSnapshotProps {
  trackingEntries: TrackingEntry[];
  mealEntries: MealEntry[];
}

export default function AIDataSnapshot({
  trackingEntries,
  mealEntries,
}: AIDataSnapshotProps) {
  const milkCount = trackingEntries.filter(
    (entry) => entry.type === "milk",
  ).length;
  const sleepCount = trackingEntries.filter(
    (entry) => entry.type === "sleep",
  ).length;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Dữ liệu AI đang đọc</h3>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-pink-50 p-3 text-center">
          <p className="text-xl font-black text-pink-600">{milkCount}</p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Cữ sữa</p>
        </div>
        <div className="rounded-2xl bg-purple-50 p-3 text-center">
          <p className="text-xl font-black text-purple-600">{sleepCount}</p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Giấc ngủ</p>
        </div>
        <div className="rounded-2xl bg-lime-50 p-3 text-center">
          <p className="text-xl font-black text-lime-600">
            {mealEntries.length}
          </p>
          <p className="mt-1 text-[10px] font-bold text-slate-500">Bữa ăn</p>
        </div>
      </div>
    </div>
  );
}
