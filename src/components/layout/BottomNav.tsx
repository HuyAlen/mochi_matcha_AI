"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, Brain, Home, LineChart, UserRound } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/tracking", label: "Theo dõi", icon: LineChart },
  { href: "/milestones", label: "Cột mốc", icon: Baby },
  { href: "/ai-coach", label: "AI Coach", icon: Brain },
  { href: "/babies", label: "Hồ sơ", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="grid grid-cols-5 items-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl py-1.5"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${active ? "bg-gradient-to-br from-indigo-400 to-violet-400 text-white shadow-md shadow-indigo-100" : "text-slate-400"}`}
              >
                <Icon size={19} />
              </div>
              <span
                className={`text-[10px] font-semibold leading-none ${active ? "text-indigo-600" : "text-slate-400"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
