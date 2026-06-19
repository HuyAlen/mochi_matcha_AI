import MemoryCard from "@/components/memory/MemoryCard";
import type { MemoryEntry } from "@/types/memory";

function monthKey(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function groupByMonth(memories: MemoryEntry[]) {
  return memories.reduce<Record<string, MemoryEntry[]>>((groups, memory) => {
    const key = monthKey(memory.date);

    return {
      ...groups,
      [key]: [...(groups[key] ?? []), memory],
    };
  }, {});
}

export default function MemoryTimeline({
  memories,
  onCreate,
  onToggleFavorite,
  onDelete,
}: {
  memories: MemoryEntry[];
  onCreate: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const grouped = groupByMonth(memories);
  const groupEntries = Object.entries(grouped);

  if (memories.length === 0) {
    return (
      <section className="rounded-4xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-pink-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-3xl">
          📸
        </div>
        <h3 className="mx-auto mt-4 max-w-sm text-xl font-black leading-7 text-slate-950">
          Khoảnh khắc đầu tiên đang chờ được ghi lại
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          Thử đổi bộ lọc hoặc tạo một kỷ niệm mới cho Mochi & Matcha.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-sm shadow-pink-200"
        >
          Tạo kỷ niệm đầu tiên
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {groupEntries.map(([month, monthMemories]) => (
        <div key={month} className="space-y-3">
          <div className="inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-pink-400 shadow-sm ring-1 ring-pink-100 backdrop-blur">
            {month}
          </div>

          <div className="space-y-3">
            {monthMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
