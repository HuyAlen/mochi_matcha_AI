"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTimerStore } from "@/store/timerStore";

export default function DashboardLiveSessions() {
  const activeSleepSessions = useTimerStore((s) => s.activeSleepSessions);
  const activeMilkSessions = useTimerStore((s) => s.activeMilkSessions);

  const sleepCount = useMemo(
    () => Object.values(activeSleepSessions).filter(Boolean).length,
    [activeSleepSessions],
  );

  const milkCount = useMemo(
    () => Object.values(activeMilkSessions).filter(Boolean).length,
    [activeMilkSessions],
  );

  const total = sleepCount + milkCount;

  if (total === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-400">
            Live hôm nay
          </p>
          <h3 className="mt-1 font-black text-slate-950">Đang diễn ra</h3>
        </div>

        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500 ring-1 ring-pink-100">
          {total} hoạt động
        </span>
      </div>

      <Link
        href="/tracking"
        className="block overflow-hidden rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-pink-100"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3 ring-1 ring-pink-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍼</span>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Đang uống sữa
                </p>
                <p className="text-xs text-slate-500">
                  Theo dõi cữ sữa realtime
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-pink-500">
              {milkCount} bé
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-purple-50 px-4 py-3 ring-1 ring-purple-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">😴</span>
              <div>
                <p className="text-sm font-black text-slate-900">Đang ngủ</p>
                <p className="text-xs text-slate-500">
                  Theo dõi giấc ngủ realtime
                </p>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-purple-500">
              {sleepCount} bé
            </span>
          </div>

          <div className="pt-1 text-center text-xs font-black text-pink-500">
            Mở theo dõi realtime →
          </div>
        </div>
      </Link>
    </section>
  );
}
