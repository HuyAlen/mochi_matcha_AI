"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BabyId } from "@/types/baby";
import type { ActiveTimerSession } from "@/store/timerStore";
import {
  getElapsedMs,
  formatElapsedTime,
  useTimerStore,
} from "@/store/timerStore";

const STORAGE_KEY = "mind-ai-floating-live-hidden";

const babyMeta: Record<BabyId, { name: string; emoji: string }> = {
  mochi: { name: "Mochi", emoji: "🎀" },
  matcha: { name: "Matcha", emoji: "🌸" },
};

const timerMeta = {
  sleep: {
    groupLabel: " ĐANG THEO DÕI GIẤC NGỦ",
    rowLabel: "ngủ",
    icon: "😴",
    text: "text-purple-600",
    ring: "ring-purple-100",
    bg: "bg-purple-50/70",
    query: "sleep",
  },
  milk: {
    groupLabel: "ĐANG THEO DÕI CỮ SỮA",
    rowLabel: "uống sữa",
    icon: "🍼",
    text: "text-pink-600",
    ring: "ring-pink-100",
    bg: "bg-pink-50/70",
    query: "milk",
  },
} satisfies Record<
  ActiveTimerSession["kind"],
  {
    groupLabel: string;
    rowLabel: string;
    icon: string;
    text: string;
    ring: string;
    bg: string;
    query: string;
  }
>;

function getTimerQuery(session: ActiveTimerSession) {
  const params = new URLSearchParams({
    quick: timerMeta[session.kind].query,
    baby: session.babyId,
    babyId: session.babyId,
  });

  return `/tracking?${params.toString()}`;
}

function readInitialHiddenState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function formatLiveElapsed(startAt?: string, now = Date.now()) {
  const elapsedMs = getElapsedMs(startAt, now);
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;

  if (totalSeconds < 1) return "0s";

  if (totalDays > 0) {
    return hours > 0 ? `${totalDays}d ${hours}h` : `${totalDays}d`;
  }

  if (totalHours > 0) {
    return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }

  if (totalMinutes > 0) {
    return `${totalMinutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

export default function FloatingLiveTimer() {
  const activeSleepSessions = useTimerStore(
    (state) => state.activeSleepSessions,
  );
  const activeMilkSessions = useTimerStore((state) => state.activeMilkSessions);
  const [now, setNow] = useState(() => Date.now());
  const [collapsed, setCollapsed] = useState(readInitialHiddenState);

  const sessions = useMemo(() => {
    return [
      ...Object.values(activeMilkSessions),
      ...Object.values(activeSleepSessions),
    ]
      .filter(Boolean)
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "milk" ? -1 : 1;
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });
  }, [activeMilkSessions, activeSleepSessions]);

  const groupedSessions = useMemo(() => {
    return sessions.reduce<
      Record<ActiveTimerSession["kind"], ActiveTimerSession[]>
    >(
      (groups, session) => {
        groups[session.kind] = [...(groups[session.kind] ?? []), session];
        return groups;
      },
      {
        milk: [],
        sleep: [],
      },
    );
  }, [sessions]);

  useEffect(() => {
    if (sessions.length === 0) return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sessions.length]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  if (sessions.length === 0) return null;

  if (collapsed) {
    return (
      <div className="pointer-events-none fixed inset-x-3 bottom-[calc(7.25rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md sm:inset-x-0">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="pointer-events-auto ml-auto flex items-center gap-2 rounded-full border border-pink-100 bg-white/95 px-3 py-2 text-xs font-black text-pink-500 shadow-[0_10px_28px_rgba(236,72,153,0.18)] backdrop-blur-xl ring-1 ring-white/60 transition active:scale-[0.98]"
          aria-label="Hiện các hoạt động đang diễn ra"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-pink-50 text-[11px] ring-1 ring-pink-100">
            📡
          </span>
          <span>{sessions.length} Live</span>
          <span className="text-slate-300">⌃</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(7.25rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md sm:inset-x-0">
      <section className="pointer-events-auto ml-auto w-[min(21rem,calc(100%-0.5rem))] rounded-3xl border border-pink-100 bg-white/95 p-2.5 shadow-[0_12px_35px_rgba(124,58,237,0.16)] backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[10px] ring-1 ring-pink-100">
              📡
            </span>
            <p className="truncate text-[11px] font-black text-pink-500">
              {sessions.length} hoạt động đang diễn ra
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-100 transition active:scale-[0.98]"
            aria-label="Ẩn hoạt động đang diễn ra"
          >
            Ẩn
          </button>
        </div>

        <div className="space-y-2">
          {(["milk", "sleep"] as const).map((kind) => {
            const group = groupedSessions[kind];
            if (group.length === 0) return null;

            const meta = timerMeta[kind];

            return (
              <div key={kind} className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.12em] ${meta.text}`}
                  >
                    {meta.icon} {meta.groupLabel}
                  </p>
                  <span
                    className={`rounded-full bg-white px-2 py-0.5 text-[10px] font-black ring-1 ${meta.text} ${meta.ring}`}
                  >
                    {group.length} bé
                  </span>
                </div>

                <div className="space-y-1">
                  {group.map((session) => {
                    const baby = babyMeta[session.babyId] ?? {
                      name: "Bé",
                      emoji: "👶",
                    };
                    const liveElapsed = formatLiveElapsed(session.startAt, now);

                    return (
                      <Link
                        key={`${session.kind}-${session.babyId}`}
                        href={getTimerQuery(session)}
                        className={`grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl px-2.5 py-1.5 ring-1 transition active:scale-[0.98] ${meta.bg} ${meta.ring}`}
                        aria-label={`${baby.name} đang ${meta.rowLabel} được ${liveElapsed}`}
                        title={`${baby.name} đang ${meta.rowLabel} được ${formatElapsedTime(
                          session.startAt,
                          now,
                        )}`}
                      >
                        <span className="min-w-0 truncate text-xs font-black text-slate-800">
                          {meta.icon} {baby.emoji} {baby.name}
                        </span>

                        <span
                          className={`rounded-full bg-white px-2 py-0.5 text-[11px] font-black tabular-nums ring-1 ${meta.text} ${meta.ring}`}
                        >
                          {liveElapsed}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
