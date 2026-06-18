import Link from "next/link";

const menuItems = [
  {
    href: "/growth",
    icon: "📈",
    title: "Tăng trưởng",
    description: "Chiều cao, cân nặng và biểu đồ phát triển",
  },
  {
    href: "/vaccines",
    icon: "💉",
    title: "Tiêm chủng",
    description: "Lịch sử tiêm và nhắc lịch vaccine",
  },
  {
    href: "/reminders",
    icon: "🔔",
    title: "Nhắc nhở",
    description: "Lịch uống sữa, ngủ, ăn dặm và chăm bé",
  },
  {
    href: "/timeline",
    icon: "📖",
    title: "Sổ ký ức",
    description: "Cột mốc và khoảnh khắc đầu đời",
  },
  {
    href: "/family",
    icon: "👨‍👩‍👧‍👧",
    title: "Gia đình",
    description: "Thành viên cùng chăm sóc Mochi & Matcha",
  },
  {
    href: "/settings",
    icon: "⚙️",
    title: "Cài đặt",
    description: "Tài khoản, giao diện và tùy chỉnh ứng dụng",
  },
];

export default function SettingsMenu() {
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="px-1 pb-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Quản lý
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 py-3.5 transition active:opacity-70"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-xl ring-1 ring-slate-100">
              {item.icon}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-slate-950">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                {item.description}
              </span>
            </span>

            <span className="text-xl font-light text-slate-300">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
