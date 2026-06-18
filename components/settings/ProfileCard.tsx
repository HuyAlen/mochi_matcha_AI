import Link from "next/link";

const babies = [
  {
    name: "Mochi",
    age: "11 tháng 3 ngày",
    accent: "bg-pink-500",
    href: "/babies",
  },
  {
    name: "Matcha",
    age: "11 tháng 3 ngày",
    accent: "bg-purple-500",
    href: "/babies",
  },
];

export default function ProfileCard() {
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-3xl ring-1 ring-pink-100">
            👩🏻
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black leading-tight tracking-tight text-slate-950">
              Mẹ của Mochi & Matcha
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Quản lý thông tin chăm sóc song sinh trong một nơi.
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-400 ring-1 ring-slate-100 transition active:scale-95"
          aria-label="Cài đặt hồ sơ"
        >
          ⚙️
        </Link>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="grid grid-cols-2 gap-2">
          {babies.map((baby) => (
            <Link
              key={baby.name}
              href={baby.href}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${baby.accent}`} />
                <span className="font-black text-slate-950">{baby.name}</span>
              </div>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {baby.age}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
