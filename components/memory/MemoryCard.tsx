import {
  babyScopeLabel,
  memoryTypeIcons,
  memoryTypeLabels,
} from "@/components/memory/MemoryFilters";
import type { MemoryEntry } from "@/types/memory";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function MemoryCard({
  memory,
  onToggleFavorite,
  onDelete,
}: {
  memory: MemoryEntry;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="relative pl-7">
      <div className="absolute left-2 top-7 h-full w-px bg-pink-100" />
      <div className="absolute left-0 top-5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white ring-4 ring-pink-50">
        ●
      </div>

      <div className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        {memory.photoUrl ? (
          <img
            src={memory.photoUrl}
            alt={memory.title}
            className="mb-4 h-56 w-full rounded-3xl object-cover"
          />
        ) : null}

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
            {memoryTypeIcons[memory.type]}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-pink-400">
                  {memoryTypeLabels[memory.type]} •{" "}
                  {babyScopeLabel(memory.babyId)}
                </p>
                <h3 className="mt-1 text-lg font-black leading-6 text-slate-950">
                  {memory.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onToggleFavorite(memory.id)}
                className={[
                  "rounded-full px-2.5 py-1 text-sm font-black",
                  memory.isFavorite
                    ? "bg-pink-500 text-white"
                    : "bg-pink-50 text-pink-400",
                ].join(" ")}
                aria-label="Toggle favorite"
              >
                ♥
              </button>
            </div>

            {memory.note ? (
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {memory.note}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                {formatDate(memory.date)}
              </span>

              <button
                type="button"
                onClick={() => onDelete(memory.id)}
                className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-500"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
