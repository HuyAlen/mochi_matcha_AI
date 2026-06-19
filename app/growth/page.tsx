"use client";

import { useMemo, useState } from "react";

import GrowthBabySelector from "@/components/growth/GrowthBabySelector";
import GrowthEntryManager from "@/components/growth/GrowthEntryManager";
import GrowthMetricTabs from "@/components/growth/GrowthMetricTabs";
import GrowthPredictionCard from "@/components/growth/GrowthPredictionCard";
import GrowthStatsCard from "@/components/growth/GrowthStatsCard";
import GrowthTrendCard from "@/components/growth/GrowthTrendCard";
import TwinGrowthCompare from "@/components/growth/TwinGrowthCompare";
import WHOChartCard from "@/components/growth/WHOChartCard";
import HealthEventList from "@/components/health/HealthEventList";
import HealthSummaryCard from "@/components/health/HealthSummaryCard";
import AppShell from "@/components/layout/AppShell";
import {
  buildGrowthSummary,
  compareTwinGrowth,
} from "@/src/services/growth/growthAnalyzer";
import { babies, getBabyById, useBabyStore } from "@/src/store/babyStore";
import { useGrowthStore } from "@/src/store/growthStore";
import { useHealthStore } from "@/src/store/healthStore";
import type { BabyId } from "@/types/baby";
import type { GrowthMetricType, GrowthRecord } from "@/types/growth";
import type { HealthEvent } from "@/types/health";

export default function GrowthPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [metric, setMetric] = useState<GrowthMetricType>("weight");

  const babyProfiles = useBabyStore((state) => state.babyProfiles);

  const records = useGrowthStore(
    (state: { records: GrowthRecord[] }) => state.records,
  );
  const addGrowthRecord = useGrowthStore((state) => state.addGrowthRecord);
  const updateGrowthRecord = useGrowthStore(
    (state) => state.updateGrowthRecord,
  );
  const deleteGrowthRecord = useGrowthStore(
    (state) => state.deleteGrowthRecord,
  );

  const healthEvents = useHealthStore(
    (state: { events: HealthEvent[] }) => state.events,
  );

  const selectedBaby = getBabyById(
    selectedBabyId,
    babyProfiles?.length ? babyProfiles : babies,
  );

  const selectedSummary = useMemo(
    () => buildGrowthSummary(selectedBabyId, records),
    [selectedBabyId, records],
  );

  const mochiSummary = useMemo(
    () => buildGrowthSummary("mochi", records),
    [records],
  );

  const matchaSummary = useMemo(
    () => buildGrowthSummary("matcha", records),
    [records],
  );

  const twinComparison = useMemo(
    () => compareTwinGrowth(mochiSummary, matchaSummary),
    [mochiSummary, matchaSummary],
  );

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl space-y-5 pb-20">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
            Growth & Health
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Tăng trưởng & Sức khỏe
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Theo dõi cân nặng, chiều cao, vòng đầu và sức khỏe của bé.
          </p>
        </header>

        <GrowthBabySelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
        />

        <GrowthEntryManager
          baby={selectedBaby}
          babyId={selectedBabyId}
          records={records}
          onAdd={addGrowthRecord}
          onUpdate={updateGrowthRecord}
          onDelete={deleteGrowthRecord}
        />

        <GrowthMetricTabs metric={metric} onChange={setMetric} />

        <WHOChartCard
          babyId={selectedBabyId}
          records={records}
          metric={metric}
        />

        <GrowthStatsCard summary={selectedSummary} />

        <GrowthTrendCard summary={selectedSummary} />

        <TwinGrowthCompare comparison={twinComparison} />

        <GrowthPredictionCard baby={selectedBaby} summary={selectedSummary} />

        <section className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
              Health
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Sức khỏe gần đây
            </h2>
          </div>

          <HealthSummaryCard babyId={selectedBabyId} events={healthEvents} />

          <HealthEventList events={healthEvents} />
        </section>
      </main>
    </AppShell>
  );
}
