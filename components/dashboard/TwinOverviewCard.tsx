"use client";

import { babies } from "@/src/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import BabySummaryCard from "./BabySummaryCard";

export default function TwinOverviewCard() {
  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-black text-slate-950">Tổng quan hai bé</h3>
        <p className="text-xs font-bold text-slate-400">Hôm nay</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {babies.map((baby) => (
          <BabySummaryCard
            key={baby.id}
            baby={baby}
            entries={getTodayEntries(baby.id as BabyId)}
          />
        ))}
      </div>
    </div>
  );
}
