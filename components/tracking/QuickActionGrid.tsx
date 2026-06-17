import { babies } from "@/src/store/babyStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

const quickActions: {
  type: TrackingType;
  label: string;
  icon: string;
  unit: string;
  defaultValue: number;
  helper: string;
  featured?: boolean;
}[] = [
  {
    type: "milk",
    label: "Sữa",
    icon: "🍼",
    unit: "ml",
    defaultValue: 120,
    helper: "+120ml",
    featured: true,
  },
  {
    type: "sleep",
    label: "Ngủ",
    icon: "😴",
    unit: "giờ",
    defaultValue: 1,
    helper: "+1 giờ",
    featured: true,
  },
  {
    type: "meal",
    label: "Ăn dặm",
    icon: "🥣",
    unit: "bữa",
    defaultValue: 1,
    helper: "+1 bữa",
  },
  {
    type: "diaper",
    label: "Tã",
    icon: "🧷",
    unit: "lần",
    defaultValue: 1,
    helper: "+1 lần",
  },
];

interface QuickActionGridProps {
  selectedBabyId: BabyId;
  onAddEntry: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
}

export default function QuickActionGrid({
  selectedBabyId,
  onAddEntry,
}: QuickActionGridProps) {
  const baby = babies.find((item) => item.id === selectedBabyId) ?? babies[0];

  return (
    <div className="rounded-[2rem] bg-pink-50/70 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">Ghi nhanh</h3>
          <p className="mt-1 text-xs text-slate-500">
            Thêm nhanh cho {baby.name}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-pink-500 shadow-sm">
          1 chạm
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.type}
            type="button"
            onClick={() =>
              onAddEntry({
                babyId: selectedBabyId,
                type: action.type,
                value: action.defaultValue,
                unit: action.unit,
              })
            }
            className={`rounded-3xl p-4 text-left shadow-sm ring-1 transition active:scale-[0.98] ${
              action.featured
                ? "bg-white ring-pink-100"
                : "bg-white/75 ring-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                {action.icon}
              </span>
              <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400 shadow-sm">
                {action.helper}
              </span>
            </div>
            <p className="mt-3 font-black text-slate-950">{action.label}</p>
            <p className="mt-1 text-xs text-slate-500">Lưu ngay hôm nay</p>
          </button>
        ))}
      </div>
    </div>
  );
}
