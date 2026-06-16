"use client";

import { useMemo, useState } from "react";
import GrowthBabySelector from "@/components/growth/GrowthBabySelector";
import GrowthInsightCard from "@/components/growth/GrowthInsightCard";
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
import { babies } from "@/src/store/babyStore";
import { useGrowthStore } from "@/src/store/growthStore";
import { useHealthStore } from "@/src/store/healthStore";
import type { BabyId } from "@/types/baby";
import type { GrowthMetricType, GrowthRecord } from "@/types/growth";
import type { HealthEvent } from "@/types/health";

export default function GrowthPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [metric, setMetric] = useState<GrowthMetricType>("weight");

  const records = useGrowthStore(
    (state: { records: GrowthRecord[] }) => state.records,
  );

  const healthEvents = useHealthStore(
    (state: { events: HealthEvent[] }) => state.events,
  );

  const selectedBaby =
    babies.find((baby) => baby.id === selectedBabyId) ?? babies[0];

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
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Growth & Health
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tăng trưởng, sức khỏe và so sánh song sinh.
          </p>
        </div>

        <GrowthBabySelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
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

        <GrowthPredictionCard summary={selectedSummary} />

        <GrowthInsightCard baby={selectedBaby} summary={selectedSummary} />

        <HealthSummaryCard babyId={selectedBabyId} events={healthEvents} />

        <HealthEventList events={healthEvents} />
      </section>
    </AppShell>
  );
}
