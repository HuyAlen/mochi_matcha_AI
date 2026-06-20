"use client";

import Link from "next/link";

import { useBabyStore } from "@/store/babyStore";

type MenuItem = {
  href: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

function getBabyNames(names: string[]) {
  return names.length > 0 ? names.join(" & ") : "hai bé";
}

export default function SettingsMenu() {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const names = babyProfiles.map((baby) => baby.nickname || baby.name);
  const babyNames = getBabyNames(names);

  const groups: MenuGroup[] = [
    {
      title: "Chăm sóc bé",
      items: [
        {
          href: "/growth",
          icon: "📈",
          title: "Tăng trưởng",
          description: "Chiều cao, cân nặng và biểu đồ phát triển",
          badge: "Theo dõi",
        },
        {
          href: "/vaccines",
          icon: "💉",
          title: "Tiêm chủng",
          description: "Lịch tiêm tự động theo ngày sinh của bé",
          badge: "Auto",
        },
        {
          href: "/reminders",
          icon: "🔔",
          title: "Nhắc nhở",
          description: "Lịch uống sữa, ngủ, ăn dặm và chăm bé",
          badge: "Hôm nay",
        },
        {
          href: "/timeline",
          icon: "📖",
          title: "Sổ ký ức",
          description: "Cột mốc và khoảnh khắc đầu đời",
        },
      ],
    },
    {
      title: "Gia đình",
      items: [
        {
          href: "/family",
          icon: "👨‍👩‍👧‍👧",
          title: "Gia đình",
          description: `Thành viên cùng chăm sóc ${babyNames}`,
        },
      ],
    },
    {
      title: "Ứng dụng",
      items: [
        {
          href: "/settings",
          icon: "⚙️",
          title: "Cài đặt",
          description: "Tài khoản, giao diện và tùy chỉnh ứng dụng",
        },
      ],
    },
  ];

  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="px-1 pb-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {group.title}
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-100">
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 bg-white/70 px-4 py-3.5 transition active:opacity-70"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-100">
                      {item.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="block truncate text-sm font-black text-slate-950">
                          {item.title}
                        </span>
                        {item.badge ? (
                          <span className="shrink-0 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-black text-pink-500 ring-1 ring-pink-100">
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                        {item.description}
                      </span>
                    </span>

                    <span className="text-xl font-light text-slate-300">›</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
