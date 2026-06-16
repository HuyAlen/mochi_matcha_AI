import AppShell from "@/components/layout/AppShell";
import MemoryTimeline from "@/components/timeline/MemoryTimeline";

export default function TimelinePage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Kỷ niệm</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lưu lại khoảnh khắc đáng nhớ của Mochi & Matcha.
          </p>
        </div>

        <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
          <p className="text-sm font-bold text-purple-700">Memory Book</p>
          <h3 className="mt-2 text-lg font-black text-slate-950">
            Những cột mốc đầu đời của hai bé
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sau này AI có thể tự tạo album năm đầu đời từ tracking và hình ảnh.
          </p>
        </div>

        <MemoryTimeline />
      </section>
    </AppShell>
  );
}
