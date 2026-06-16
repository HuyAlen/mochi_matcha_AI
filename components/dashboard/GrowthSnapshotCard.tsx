"use client";

import Link from "next/link";
import {
  buildGrowthSummary,
  compareTwinGrowth,
} from "@/src/services/growth/growthAnalyzer";
import { useGrowthStore } from "@/src/store/growthStore";
import type { GrowthRecord } from "@/types/growth";

export default function GrowthSnapshotCard() {
  const records = useGrowthStore(
    (state: { records: GrowthRecord[] }) => state.records,
  );

  const mochi = buildGrowthSummary("mochi", records);
  const matcha = buildGrowthSummary("matcha", records);
  const comparison = compareTwinGrowth(mochi, matcha);

  return (
    <Link
      href="/growth"
      className="block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-pink-500">📈 Growth Snapshot</p>
          <h3 className="mt-1 font-black text-slate-950">
            Tăng trưởng hôm nay
          </h3>
        </div>
        <span className="text-slate-300">›</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-pink-50 p-4">
          <p className="font-black text-pink-600">Mochi</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {mochi.latestWeightKg}kg
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {mochi.latestHeightCm}cm · P{mochi.estimatedWeightPercentile}
          </p>
          <p className="mt-2 text-xs font-black text-lime-600">
            ↑ +{mochi.weightChangeKg}kg tháng này
          </p>
        </div>

        <div className="rounded-2xl bg-lime-50 p-4">
          <p className="font-black text-lime-700">Matcha</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {matcha.latestWeightKg}kg
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {matcha.latestHeightCm}cm · P{matcha.estimatedWeightPercentile}
          </p>
          <p className="mt-2 text-xs font-black text-lime-600">
            ↑ +{matcha.weightChangeKg}kg tháng này
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        🟢 WHO bình thường · {comparison.insight}
      </p>
    </Link>
  );
}
