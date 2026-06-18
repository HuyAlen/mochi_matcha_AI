"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

function subscribeHydrationStore() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeHydrationStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getDisplayValue(isHydrated: boolean, value: number) {
  if (!isHydrated) return "—";

  return format(value);
}

export default function SleepSummaryCard() {
  const isHydrated = useIsHydrated();

  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );

  const mochiSleep = getTotal(getTodayEntries("mochi"), "sleep");
  const matchaSleep = getTotal(getTodayEntries("matcha"), "sleep");
  const diff = Math.abs(mochiSleep - matchaSleep);
  const balanced = diff < 1.5;

  return (
    <Link
      href="/tracking"
      className="block rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Giấc ngủ
          </p>
          <h3 className="mt-1 font-black text-slate-950">Ngủ hôm nay</h3>
        </div>

        <span className="text-xl font-light text-slate-300">›</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100">
          <p className="font-black text-pink-600">Mochi</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {getDisplayValue(isHydrated, mochiSleep)}h
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-100">
          <p className="font-black text-purple-600">Matcha</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {getDisplayValue(isHydrated, matchaSleep)}h
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-500">
        {!isHydrated
          ? "Đang tải dữ liệu giấc ngủ hôm nay."
          : balanced
            ? "Giấc ngủ của hai bé đang khá cân bằng."
            : `Hai bé chênh lệch giấc ngủ khoảng ${format(diff)} giờ.`}
      </p>
    </Link>
  );
}
