"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const quickAddItems = [
  { href: "/tracking", label: "Sữa", icon: "🍼" },
  { href: "/tracking", label: "Ngủ", icon: "🌙" },
  { href: "/nutrition", label: "Ăn dặm", icon: "🥣" },
  { href: "/vaccines", label: "Vaccine", icon: "💉" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const active = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const moreActive =
    active("/settings") ||
    active("/growth") ||
    active("/vaccines") ||
    active("/reminders") ||
    active("/timeline") ||
    active("/family") ||
    active("/babies");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-3 pb-3">
      <div className="relative rounded-[2rem] border border-pink-100 bg-white/95 px-3 pb-2 pt-3 shadow-[0_-10px_30px_rgba(236,72,153,0.12)] backdrop-blur-xl">
        <div className="grid grid-cols-5 items-end gap-1">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs ${
              active("/dashboard")
                ? "bg-pink-50 text-pink-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="mt-1 font-black">Home</span>
          </Link>

          <Link
            href="/tracking"
            className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs ${
              active("/tracking")
                ? "bg-pink-50 text-pink-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">🍼</span>
            <span className="mt-1 font-black">Track</span>
          </Link>

          <details className="group relative flex justify-center">
            <summary className="list-none">
              <div className="-mt-7 flex size-14 cursor-pointer items-center justify-center rounded-full bg-pink-500 text-3xl font-black text-white shadow-[0_10px_30px_rgba(236,72,153,0.28)] ring-4 ring-white transition group-open:rotate-45">
                +
              </div>
            </summary>

            <div className="absolute bottom-20 left-1/2 w-56 -translate-x-1/2 rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-pink-100">
              <p className="px-2 pb-2 text-xs font-black text-slate-400">
                Ghi nhanh
              </p>

              <div className="grid grid-cols-2 gap-2">
                {quickAddItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl bg-pink-50 p-3 text-center"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <p className="mt-1 text-xs font-black text-pink-600">
                      {item.label}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </details>

          <Link
            href="/ai-coach"
            className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs ${
              active("/ai-coach")
                ? "bg-pink-50 text-pink-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">🤖</span>
            <span className="mt-1 font-black">AI</span>
          </Link>

          <Link
            href="/settings"
            className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs ${
              moreActive ? "bg-pink-50 text-pink-600" : "text-slate-400"
            }`}
          >
            <span className="text-lg">👤</span>
            <span className="mt-1 font-black">More</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
