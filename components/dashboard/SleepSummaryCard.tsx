"use client";

import Link from "next/link";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + entry.value, 0);
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function SleepSummaryCard() {
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
      className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-purple-500">🌙 Sleep Summary</p>
          <h3 className="mt-1 font-black text-slate-950">Ngủ hôm nay</h3>
        </div>
        <span className="text-slate-300">›</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-purple-50 p-4">
          <p className="font-black text-purple-600">Mochi</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {format(mochiSleep)}h
          </p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-4">
          <p className="font-black text-pink-600">Matcha</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {format(matchaSleep)}h
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {balanced
          ? "🟢 Giấc ngủ của hai bé đang khá cân bằng."
          : `🟡 Hai bé chênh lệch giấc ngủ khoảng ${format(diff)} giờ, mẹ nên theo dõi thêm.`}
      </p>
    </Link>
  );
}
