"use client";

import Link from "next/link";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { TrackingEntry } from "@/types/tracking";

const trackingDisplay: Record<
  string,
  {
    icon: string;
    label: string;
    unit: string;
    className: string;
  }
> = {
  milk: {
    icon: "🍼",
    label: "Sữa",
    unit: "ml",
    className: "bg-pink-50 text-pink-600",
  },
  sleep: {
    icon: "🌙",
    label: "Ngủ",
    unit: "giờ",
    className: "bg-purple-50 text-purple-600",
  },
  meal: {
    icon: "🥣",
    label: "Ăn",
    unit: "bữa",
    className: "bg-amber-50 text-amber-600",
  },
  diaper: {
    icon: "🧷",
    label: "Tã",
    unit: "lần",
    className: "bg-sky-50 text-sky-600",
  },
  mood: {
    icon: "😊",
    label: "Mood",
    unit: "",
    className: "bg-emerald-50 text-emerald-600",
  },
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "--:--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return `Hôm nay • ${formatTime(date)}`;
  if (isSameDay(date, yesterday)) return `Hôm qua • ${formatTime(date)}`;

  return `${date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })} • ${formatTime(date)}`;
}

function formatNextFeed(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `Nhắc lại ${formatTime(date)}`;
}

function getBabyName(babyId?: string) {
  return babyId === "matcha" ? "Matcha" : "Mochi";
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getEntryValue(entry: TrackingEntry, unit: string) {
  const value = Number(entry.value ?? 0);
  const displayUnit = entry.unit || unit;
  const base = displayUnit
    ? `${formatNumber(value)} ${displayUnit}`
    : formatNumber(value);

  if (entry.type !== "milk") return base;

  const duration = Number(entry.durationMinutes ?? 0);
  const nextFeed = formatNextFeed(entry.nextFeedAt);

  const details = [duration > 0 ? `bú ${duration} phút` : "", nextFeed].filter(
    Boolean,
  );

  return details.length ? `${base} • ${details.join(" • ")}` : base;
}

export default function RecentActivityCard() {
  const entries = useTrackingStore(
    (state: { entries: TrackingEntry[] }) => state.entries,
  );

  const recentEntries = [...entries]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Timeline
          </p>
          <h3 className="mt-1 font-black text-slate-950">Nhật ký gần đây</h3>
        </div>

        <Link href="/tracking" className="text-xs font-black text-pink-500">
          Xem tất cả
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {recentEntries.length > 0 ? (
          recentEntries.map((entry) => {
            const display =
              trackingDisplay[String(entry.type)] ?? trackingDisplay.mood;

            return (
              <div
                key={entry.id}
                className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg">
                    {display.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${display.className}`}
                      >
                        {display.label}
                      </span>
                      <p className="truncate text-sm font-bold text-slate-800">
                        {getBabyName(String(entry.babyId))}
                      </p>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      <span suppressHydrationWarning>
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </p>

                    <p className="mt-1.5 line-clamp-2 text-sm font-black leading-5 text-slate-700">
                      {getEntryValue(entry, display.unit)}
                    </p>

                    {entry.note && (
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-400">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
            <p className="text-sm font-bold text-slate-500">
              Chưa có nhật ký hôm nay.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Ghi nhận sữa, ngủ hoặc ăn dặm để dashboard cá nhân hóa tốt hơn.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
