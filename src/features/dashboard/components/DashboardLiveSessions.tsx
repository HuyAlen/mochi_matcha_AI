"use client";

import { useEffect, useMemo, useState } from "react";

import { babies } from "@/src/store/babyStore";
import {
  formatElapsedTime,
  useTimerStore,
  type ActiveTimerSession,
} from "@/src/store/timerStore";
import type { BabyId } from "@/types/baby";

type LiveSessionItem = {
  key: string;
  kind: "milk" | "sleep";
  babyId: BabyId;
  babyName: string;
  icon: string;
  title: string;
  elapsed: string;
  tone: string;
};

function getBabyName(babyId: BabyId) {
  return babies.find((baby) => baby.id === babyId)?.name ?? babyId;
}

function buildLiveItem(
  session: ActiveTimerSession,
  kind: "milk" | "sleep",
  now: number,
): LiveSessionItem {
  const isMilk = kind === "milk";

  return {
    key: `${kind}-${session.babyId}`,
    kind,
    babyId: session.babyId,
    babyName: getBabyName(session.babyId),
    icon: isMilk ? "🍼" : "😴",
    title: isMilk ? "Đang uống sữa" : "Đang ngủ",
    elapsed: formatElapsedTime(session.startAt, now),
    tone: isMilk
      ? "bg-pink-50 text-pink-600 ring-pink-100"
      : "bg-violet-50 text-violet-600 ring-violet-100",
  };
}

function openRealtimeSheet(kind: "milk" | "sleep", babyId: BabyId) {
  const eventName =
    kind === "milk"
      ? "mind-ai:open-quick-add-milk"
      : "mind-ai:open-quick-add-sleep";

  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: { babyId },
    }),
  );
}

export default function DashboardLiveSessions() {
  const activeMilkSessions = useTimerStore((state) => state.activeMilkSessions);
  const activeSleepSessions = useTimerStore(
    (state) => state.activeSleepSessions,
  );

  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    const syncNow = () => setNow(Date.now());

    syncNow();

    const timerId = window.setInterval(syncNow, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const liveItems = useMemo(() => {
    const milkItems = Object.values(activeMilkSessions)
      .filter(Boolean)
      .map((session) =>
        buildLiveItem(session as ActiveTimerSession, "milk", now),
      );

    const sleepItems = Object.values(activeSleepSessions)
      .filter(Boolean)
      .map((session) =>
        buildLiveItem(session as ActiveTimerSession, "sleep", now),
      );

    return [...milkItems, ...sleepItems].sort((a, b) => {
      if (a.kind === b.kind) return a.babyName.localeCompare(b.babyName);
      return a.kind === "milk" ? -1 : 1;
    });
  }, [activeMilkSessions, activeSleepSessions, now]);

  if (liveItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-400">
            Live hôm nay
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            Đang diễn ra
          </h3>
        </div>

        <div className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-black text-pink-500 ring-1 ring-pink-100">
          {liveItems.length} hoạt động
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <div className="space-y-3">
          {liveItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => openRealtimeSheet(item.kind, item.babyId)}
              className={`block w-full rounded-3xl p-3 text-left ring-1 transition active:scale-[0.99] ${item.tone}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-white/80">
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-black text-slate-950">
                      {item.babyName}
                    </p>
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600">
                      Live
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs font-bold text-slate-500">
                    {item.title}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right shadow-sm ring-1 ring-white/80">
                  <p className="font-black tabular-nums text-slate-950">
                    {now > 0 ? item.elapsed : "00:00"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-black text-slate-400">
                    realtime
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
