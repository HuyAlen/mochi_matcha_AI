import type { GrowthMetricType } from "@/types/growth";

interface GrowthMetricTabsProps {
  metric: GrowthMetricType;
  onChange: (metric: GrowthMetricType) => void;
}

const tabs: { id: GrowthMetricType; label: string }[] = [
  { id: "weight", label: "Cân nặng" },
  { id: "height", label: "Chiều cao" },
  { id: "head", label: "Vòng đầu" },
];

export default function GrowthMetricTabs({
  metric,
  onChange,
}: GrowthMetricTabsProps) {
  return (
    <div className="grid grid-cols-3 rounded-full bg-white p-1 shadow-sm ring-1 ring-pink-100">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-full px-3 py-3 text-xs font-bold ${
            metric === item.id
              ? "bg-pink-500 text-white shadow-sm"
              : "text-slate-400"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
