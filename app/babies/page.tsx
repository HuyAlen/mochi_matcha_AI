import AppShell from "@/components/layout/AppShell";

export default function BabiesPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Hồ sơ Mochi & Matcha
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin riêng của từng bé.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-pink-100">
            <div className="text-5xl">🎀</div>
            <h3 className="mt-3 font-black text-slate-950">Mochi</h3>
            <p className="mt-1 text-sm text-slate-500">Song sinh nữ</p>
          </div>

          <div className="rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-pink-100">
            <div className="text-5xl">🌸</div>
            <h3 className="mt-3 font-black text-slate-950">Matcha</h3>
            <p className="mt-1 text-sm text-slate-500">Song sinh nữ</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
