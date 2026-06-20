"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type QuickAddItem = {
  href: string;
  label: string;
  icon: string;
  tone: string;
};

const quickAddItems: QuickAddItem[] = [
  {
    href: "/tracking?quick=milk",
    label: "Sữa",
    icon: "🍼",
    tone: "from-pink-50 to-rose-50 text-pink-600 ring-pink-100",
  },
  {
    href: "/tracking?quick=sleep",
    label: "Ngủ",
    icon: "🌙",
    tone: "from-purple-50 to-violet-50 text-purple-600 ring-purple-100",
  },
  {
    href: "/tracking?quick=meal",
    label: "Ăn dặm",
    icon: "🥣",
    tone: "from-orange-50 to-amber-50 text-orange-500 ring-orange-100",
  },
  {
    href: "/tracking?quick=diaper",
    label: "Tã",
    icon: "🧷",
    tone: "from-sky-50 to-cyan-50 text-sky-500 ring-sky-100",
  },
  {
    href: "/tracking?quick=temperature",
    label: "Sức khỏe",
    icon: "🌡️",
    tone: "from-emerald-50 to-teal-50 text-emerald-500 ring-emerald-100",
  },
  {
    href: "/tracking?quick=medicine",
    label: "Vaccine",
    icon: "💉",
    tone: "from-fuchsia-50 to-pink-50 text-fuchsia-600 ring-fuchsia-100",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

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

  useEffect(() => {
    if (!quickAddOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuickAddOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickAddOpen]);

  return (
    <>
      {quickAddOpen ? (
        <button
          type="button"
          aria-label="Đóng ghi nhanh"
          onClick={() => setQuickAddOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/15 backdrop-blur-[2px]"
        />
      ) : null}

      <div
        className={`fixed inset-x-3 z-55 mx-auto max-w-md transition-all duration-200 ease-out sm:inset-x-0 ${
          quickAddOpen
            ? "bottom-[calc(6.75rem+env(safe-area-inset-bottom))] translate-y-0 opacity-100"
            : "pointer-events-none bottom-[calc(5.5rem+env(safe-area-inset-bottom))] translate-y-4 opacity-0"
        }`}
      >
        <section className="rounded-4xl border border-pink-100 bg-white/95 p-4 shadow-[0_20px_60px_rgba(236,72,153,0.22)] backdrop-blur-xl">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-pink-100" />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Ghi nhanh
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Chọn hoạt động chăm bé
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-black text-pink-500 ring-1 ring-pink-100"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {quickAddItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setQuickAddOpen(false)}
                className={`rounded-[1.35rem] bg-linear-to-br p-3 text-center ring-1 transition active:scale-[0.97] ${item.tone}`}
              >
                <div className="text-2xl leading-none">{item.icon}</div>
                <p className="mt-2 text-xs font-black leading-tight">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-60 mx-auto max-w-md px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="relative rounded-4xl border border-pink-100 bg-white/95 px-3 pb-2 pt-3 shadow-[0_-10px_30px_rgba(236,72,153,0.12)] backdrop-blur-xl">
          <div className="grid grid-cols-5 items-end gap-1">
            <Link
              href="/dashboard"
              onClick={() => setQuickAddOpen(false)}
              className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs transition active:scale-[0.98] ${
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
              onClick={() => setQuickAddOpen(false)}
              className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs transition active:scale-[0.98] ${
                active("/tracking")
                  ? "bg-pink-50 text-pink-600"
                  : "text-slate-400"
              }`}
            >
              <span className="text-lg">🍼</span>
              <span className="mt-1 font-black">Track</span>
            </Link>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setQuickAddOpen((value) => !value)}
                aria-expanded={quickAddOpen}
                aria-label={quickAddOpen ? "Đóng ghi nhanh" : "Mở ghi nhanh"}
                className={`-mt-7 flex size-14 items-center justify-center rounded-full bg-pink-500 text-3xl font-black text-white shadow-[0_10px_30px_rgba(236,72,153,0.28)] ring-4 ring-white transition active:scale-95 ${
                  quickAddOpen ? "rotate-45" : "rotate-0"
                }`}
              >
                +
              </button>
            </div>

            <Link
              href="/ai-coach"
              onClick={() => setQuickAddOpen(false)}
              className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs transition active:scale-[0.98] ${
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
              onClick={() => setQuickAddOpen(false)}
              className={`flex flex-col items-center rounded-2xl px-2 py-2 text-xs transition active:scale-[0.98] ${
                moreActive ? "bg-pink-50 text-pink-600" : "text-slate-400"
              }`}
            >
              <span className="text-lg">👤</span>
              <span className="mt-1 font-black">More</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
