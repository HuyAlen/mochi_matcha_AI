export type NutritionTab = "suggestion" | "library" | "weekly" | "shopping";

interface NutritionTabsProps {
  tab: NutritionTab;
  onChange: (tab: NutritionTab) => void;
}

const tabs: { id: NutritionTab; label: string }[] = [
  { id: "suggestion", label: "Gợi ý" },
  { id: "library", label: "Thư viện" },
  { id: "weekly", label: "Menu tuần" },
  { id: "shopping", label: "Mua sắm" },
];

export default function NutritionTabs({ tab, onChange }: NutritionTabsProps) {
  return (
    <div className="grid grid-cols-4 rounded-full bg-white p-1 shadow-sm ring-1 ring-pink-100">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-full px-2 py-3 text-xs font-bold transition ${
            tab === item.id
              ? "bg-pink-500 text-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
