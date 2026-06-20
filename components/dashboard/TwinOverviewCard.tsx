"use client";

import { useSyncExternalStore } from "react";
import { babies } from "@/src/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import BabySummaryCard from "./BabySummaryCard";

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

function TwinOverviewSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Twin Care Overview
          </p>
          <h3 className="mt-1 font-black text-slate-950">Tổng quan hôm nay</h3>
        </div>

        <div className="hidden rounded-2xl bg-slate-50 px-3 py-2 text-right text-xs font-black text-slate-400 ring-1 ring-slate-100 sm:block">
          Đang tải
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-slate-50 p-3 ring-1 ring-slate-100 sm:hidden">
        <div className="flex items-start gap-2">
          <span className="text-lg">✨</span>
          <div>
            <p className="text-xs font-black text-slate-500">
              Đang tải dữ liệu
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              Mind AI đang đồng bộ tổng quan hôm nay.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {babies.map((baby) => (
          <div
            key={baby.id}
            className="min-h-[156px] rounded-[28px] border border-pink-100/80 bg-white p-3.5 shadow-[0_18px_45px_rgba(244,114,182,0.10)]"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-2 h-3 w-14 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-9 animate-pulse rounded-2xl bg-slate-50" />
              <div className="h-9 animate-pulse rounded-2xl bg-slate-50" />
              <div className="h-9 animate-pulse rounded-2xl bg-slate-50" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Twin Care Overview
          </p>
          <h3 className="mt-1 font-black text-slate-950">Tổng quan hôm nay</h3>
        </div>

        <div
          className={`hidden rounded-2xl px-3 py-2 text-right text-xs font-black ring-1 sm:block ${status.tone}`}
        >
          <div>
            {status.icon} {status.label}
          </div>
        </div>
      </div>

      <div className={`rounded-[1.5rem] p-3 ring-1 sm:hidden ${status.tone}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{status.icon}</span>
          <div>
            <p className="text-xs font-black">{status.label}</p>
            <p className="mt-0.5 text-xs font-semibold opacity-80">
              {status.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {babies.map((baby) => (
          <BabySummaryCard
            key={baby.id}
            baby={baby}
            entries={getTodayEntries(baby.id as BabyId)}
          />
        ))}
      </div>
    </section>
  );
}
