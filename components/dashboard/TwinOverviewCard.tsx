"use client";

import { useSyncExternalStore } from "react";

import { babies } from "@/src/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { Baby, BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

type TwinStatus = {
  label: string;
  description: string;
  icon: string;
  tone: string;
};

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
}

function getMilkDuration(entries: TrackingEntry[]) {
  return entries
    .filter((entry) => entry.type === "milk")
    .reduce((sum, entry) => sum + Number(entry.durationMinutes ?? 0), 0);
}

function buildTwinStatus(
  mochiEntries: TrackingEntry[],
  matchaEntries: TrackingEntry[],
): TwinStatus {
  const totalEntries = mochiEntries.length + matchaEntries.length;
  const mochiSleep = getTotal(mochiEntries, "sleep");
  const matchaSleep = getTotal(matchaEntries, "sleep");
  const mochiMilk = getTotal(mochiEntries, "milk");
  const matchaMilk = getTotal(matchaEntries, "milk");

  if (totalEntries === 0) {
    return {
      label: "Chưa có dữ liệu",
      description: "Thêm hoạt động đầu tiên để Mind AI bắt đầu phân tích.",
      icon: "📝",
      tone: "bg-slate-50 text-slate-500 ring-slate-100",
    };
  }

  if (Math.abs(mochiSleep - matchaSleep) >= 1.5) {
    return {
      label: "Lệch giấc ngủ",
      description: "AI sẽ ưu tiên theo dõi giấc ngủ giữa hai bé hôm nay.",
      icon: "🌙",
      tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    };
  }

  if (Math.abs(mochiMilk - matchaMilk) >= 120) {
    return {
      label: "Lệch lượng sữa",
      description: "AI sẽ nhắc mẹ kiểm tra nhịp bú của từng bé.",
      icon: "🍼",
      tone: "bg-pink-50 text-pink-600 ring-pink-100",
    };
  }

  return {
    label: "Đang ổn định",
    description: "Dữ liệu hôm nay đủ tốt để AI theo dõi xu hướng chăm sóc.",
    icon: "✨",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };
}

function subscribeHydration() {
  return () => undefined;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

function CompactBabyCard({
  baby,
  entries,
}: {
  baby: Baby;
  entries: TrackingEntry[];
}) {
  const milk = getTotal(entries, "milk");
  const milkDuration = getMilkDuration(entries);
  const sleep = getTotal(entries, "sleep");
  const meals = entries.filter((entry) => entry.type === "meal").length;

  return (
    <div className="rounded-[1.45rem] border border-pink-100/80 bg-white p-3 shadow-[0_14px_34px_rgba(244,114,182,0.10)]">
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-pink-50 ring-2 ring-white">
          {baby.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={baby.avatarUrl}
              alt={baby.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg">
              👶
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={[
                "h-2 w-2 rounded-full",
                baby.id === "mochi" ? "bg-pink-500" : "bg-violet-500",
              ].join(" ")}
            />
            <p className="truncate text-sm font-black text-slate-950">
              {baby.name}
            </p>
          </div>

          <p
            className={[
              "mt-0.5 text-xs font-black",
              baby.id === "mochi" ? "text-pink-500" : "text-violet-500",
            ].join(" ")}
          >
            Hôm nay
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-2xl bg-slate-50 px-1.5 py-2 text-center">
          <p className="text-sm">🍼</p>
          <p className="mt-1 text-xs font-black text-slate-950">{milk}ml</p>
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">
            {milkDuration > 0 ? `${milkDuration} phút` : "Sữa"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-1.5 py-2 text-center">
          <p className="text-sm">🌙</p>
          <p className="mt-1 text-xs font-black text-slate-950">{sleep}h</p>
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">Ngủ</p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-1.5 py-2 text-center">
          <p className="text-sm">🥣</p>
          <p className="mt-1 text-xs font-black text-slate-950">{meals}</p>
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">Ăn dặm</p>
        </div>
      </div>
    </div>
  );
}

function TwinOverviewSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Twin Care
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            Tổng quan hôm nay
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-400 ring-1 ring-slate-100">
          Đang tải
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {babies.map((baby) => (
          <div
            key={baby.id}
            className="h-[142px] animate-pulse rounded-[1.5rem] bg-white ring-1 ring-pink-100"
          />
        ))}
      </div>
    </section>
  );
}

export default function TwinOverviewCard() {
  const isHydrated = useIsHydrated();

  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );

  if (!isHydrated) {
    return <TwinOverviewSkeleton />;
  }

  const mochiEntries = getTodayEntries("mochi");
  const matchaEntries = getTodayEntries("matcha");
  const status = buildTwinStatus(mochiEntries, matchaEntries);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Twin Care
          </p>
          <h3 className="mt-1 text-lg font-black leading-tight text-slate-950">
            Tổng quan hôm nay
          </h3>
        </div>

        <div
          className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-black ring-1 ${status.tone}`}
        >
          {status.icon} {status.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {babies.map((baby) => (
          <CompactBabyCard
            key={baby.id}
            baby={baby}
            entries={getTodayEntries(baby.id as BabyId)}
          />
        ))}
      </div>
    </section>
  );
}
