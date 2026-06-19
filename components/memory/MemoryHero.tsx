import type { MemoryEntry } from "@/types/memory";

function countFavorite(memories: MemoryEntry[]) {
  return memories.filter((memory) => memory.isFavorite).length;
}

export default function MemoryHero({ memories }: { memories: MemoryEntry[] }) {
  const total = memories.length;
  const favorites = countFavorite(memories);

  return (
    <section className="overflow-hidden rounded-4xl bg-linear-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
            Memory Book
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Kỷ niệm của Mochi & Matcha
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Lưu khoảnh khắc đầu đời, cột mốc và câu chuyện gia đình.
          </p>
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-pink-100">
          📖
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-3xl bg-white/80 p-3 ring-1 ring-pink-100">
          <p className="text-lg font-black text-slate-950">{total}</p>
          <p className="text-[11px] font-bold text-slate-400">Kỷ niệm</p>
        </div>
        <div className="rounded-3xl bg-white/80 p-3 ring-1 ring-pink-100">
          <p className="text-lg font-black text-slate-950">{favorites}</p>
          <p className="text-[11px] font-bold text-slate-400">Yêu thích</p>
        </div>
        <div className="rounded-3xl bg-white/80 p-3 ring-1 ring-pink-100">
          <p className="text-lg font-black text-slate-950">AI</p>
          <p className="text-[11px] font-bold text-slate-400">Ready</p>
        </div>
      </div>
    </section>
  );
}
