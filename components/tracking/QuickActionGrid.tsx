import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

const quickActions: {
  type: TrackingType;
  label: string;
  icon: string;
  unit: string;
  defaultValue: number;
}[] = [
  { type: "milk", label: "Sữa", icon: "🍼", unit: "ml", defaultValue: 120 },
  { type: "sleep", label: "Ngủ", icon: "😴", unit: "giờ", defaultValue: 1 },
  { type: "meal", label: "Ăn dặm", icon: "🍽️", unit: "bữa", defaultValue: 1 },
  { type: "diaper", label: "Tã", icon: "🧷", unit: "lần", defaultValue: 1 },
  {
    type: "temperature",
    label: "Nhiệt độ",
    icon: "🌡️",
    unit: "°C",
    defaultValue: 37,
  },
  {
    type: "medicine",
    label: "Thuốc",
    icon: "💊",
    unit: "lần",
    defaultValue: 1,
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
  return (
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
          className="rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"
        >
          <div className="text-3xl">{action.icon}</div>
          <p className="mt-2 font-bold text-slate-900">{action.label}</p>
          <p className="text-xs text-slate-500">
            +{action.defaultValue} {action.unit}
          </p>
        </button>
      ))}
    </div>
  );
}
