import AppShell from "@/components/layout/AppShell";

export default function FamilyPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Gia đình</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thành viên cùng chăm sóc Mochi & Matcha.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="font-black text-slate-950">Thành viên</h3>

          <div className="mt-4 space-y-3">
            {[
              ["👩🏻", "Mẹ", "Owner"],
              ["👨🏻", "Bố", "Editor"],
              ["👵🏻", "Bà", "Viewer"],
            ].map(([icon, name, role]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white text-xl">
                    {icon}
                  </span>
                  <div>
                    <p className="font-black text-slate-800">{name}</p>
                    <p className="text-xs text-slate-400">
                      Quyền truy cập gia đình
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-600">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-pink-500 py-4 text-sm font-black text-white shadow-sm"
        >
          + Mời thành viên
        </button>
      </section>
    </AppShell>
  );
}
