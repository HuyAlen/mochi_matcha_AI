import type {
  MemoryFilterBaby,
  MemoryFilterType,
  MemoryType,
} from "@/types/memory";

const babyOptions: { label: string; value: MemoryFilterBaby }[] = [
  { label: "Tất cả", value: "all" },
  { label: "🎀 Mochi", value: "mochi" },
  { label: "🌸 Matcha", value: "matcha" },
  { label: "👭 Cả hai", value: "both" },
];

const typeOptions: { label: string; icon: string; value: MemoryFilterType }[] =
  [
    { label: "Tất cả", icon: "💗", value: "all" },
    { label: "Đầu tiên", icon: "✨", value: "first_moment" },
    { label: "Cột mốc", icon: "🏆", value: "milestone" },
    { label: "Ảnh", icon: "📷", value: "photo" },
    { label: "Ghi chú", icon: "📝", value: "note" },
    { label: "Sức khỏe", icon: "🩺", value: "health" },
    { label: "Gia đình", icon: "👨‍👩‍👧‍👧", value: "family" },
  ];

export const memoryTypeLabels: Record<MemoryType, string> = {
  first_moment: "Khoảnh khắc đầu tiên",
  milestone: "Cột mốc",
  photo: "Ảnh kỷ niệm",
  note: "Ghi chú",
  health: "Sức khỏe",
  family: "Gia đình",
};

export const memoryTypeIcons: Record<MemoryType, string> = {
  first_moment: "✨",
  milestone: "🏆",
  photo: "📷",
  note: "📝",
  health: "🩺",
  family: "👨‍👩‍👧‍👧",
};

export function babyScopeLabel(value: string) {
  if (value === "mochi") return "Mochi";
  if (value === "matcha") return "Matcha";
  if (value === "both") return "Mochi & Matcha";

  return "Tất cả";
}

export default function MemoryFilters({
  babyFilter,
  typeFilter,
  onBabyChange,
  onTypeChange,
}: {
  babyFilter: MemoryFilterBaby;
  typeFilter: MemoryFilterType;
  onBabyChange: (filter: MemoryFilterBaby) => void;
  onTypeChange: (filter: MemoryFilterType) => void;
}) {
  return (
    <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
          Bộ lọc
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-950">Lọc kỷ niệm</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {babyOptions.map((option) => {
          const active = babyFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onBabyChange(option.value)}
              className={[
                "min-h-12 rounded-2xl px-2 py-2 text-[11px] font-black leading-4 transition sm:text-xs",
                active
                  ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                  : "bg-pink-50/70 text-slate-500",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {typeOptions.map((option) => {
          const active = typeFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onTypeChange(option.value)}
              className={[
                "min-h-12 rounded-2xl px-2 py-2 text-[11px] font-black leading-4 transition sm:text-xs",
                active
                  ? "bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-200"
                  : "bg-fuchsia-50/80 text-slate-500",
              ].join(" ")}
            >
              <span className="block text-base">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
