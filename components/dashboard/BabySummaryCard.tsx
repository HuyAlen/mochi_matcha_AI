"use client";

import type { Baby } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

interface BabySummaryCardProps {
  baby: Baby;
  entries: TrackingEntry[];
}

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + entry.value, 0);
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function BabySummaryCard({
  baby,
  entries,
}: BabySummaryCardProps) {
  const milk = getTotal(entries, "milk");
  const sleep = getTotal(entries, "sleep");
  const meals = getTotal(entries, "meal");

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-pink-100">
      <div className="bg-linear-to-br from-pink-100 via-rose-50 to-lime-50 px-4 py-5 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
          {baby.avatarEmoji}
        </div>
      </div>

      <div className="p-3">
        <div className="rounded-2xl bg-white/90 p-3 text-center shadow-sm ring-1 ring-slate-100">
          <h3 className="font-bold text-pink-600">{baby.name}</h3>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-black text-slate-900">
                {formatNumber(milk)}
              </p>
              <p className="text-[10px] text-slate-400">ml sữa</p>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {formatNumber(sleep)}
              </p>
              <p className="text-[10px] text-slate-400">giờ ngủ</p>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {formatNumber(meals)}
              </p>
              <p className="text-[10px] text-slate-400">bữa ăn</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
