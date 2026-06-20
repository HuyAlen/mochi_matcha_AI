"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import UpcomingVaccineCard from "@/components/vaccines/UpcomingVaccineCard";
import VaccineBabySelector from "@/components/vaccines/VaccineBabySelector";
import VaccineInsightCard from "@/components/vaccines/VaccineInsightCard";
import VaccineReactionList from "@/components/vaccines/VaccineReactionList";
import VaccineReactionTracker from "@/components/vaccines/VaccineReactionTracker";
import VaccineScheduleList from "@/components/vaccines/VaccineScheduleList";
import VaccineSummaryCard from "@/components/vaccines/VaccineSummaryCard";
import { getUpcomingVaccines } from "@/src/services/health/vaccineAnalyzer";
import { useVaccineStore } from "@/src/store/vaccineStore";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord, VaccineReaction } from "@/types/vaccine";

export default function VaccinesPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");

  const records = useVaccineStore(
    (state: { records: BabyVaccineRecord[] }) => state.records,
  );
  const reactions = useVaccineStore(
    (state: { reactions: VaccineReaction[] }) => state.reactions,
  );
  const markCompleted = useVaccineStore(
    (state: {
      markCompleted: (recordId: string, completedDate?: string) => void;
    }) => state.markCompleted,
  );
  const addReaction = useVaccineStore(
    (state: {
      addReaction: (
        reaction: Omit<VaccineReaction, "id" | "createdAt">,
      ) => void;
    }) => state.addReaction,
  );

  const babyRecords = records.filter(
    (record) => record.babyId === selectedBabyId,
  );
  const babyReactions = reactions.filter(
    (reaction) => reaction.babyId === selectedBabyId,
  );

  const nextRecordId = useMemo(() => {
    return getUpcomingVaccines(babyRecords)[0]?.id;
  }, [babyRecords]);

  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Vaccines & Health
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lịch tiêm, nhắc mũi sắp tới và theo dõi phản ứng sau tiêm.
          </p>
        </div>

        <VaccineBabySelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
        />

        <VaccineSummaryCard babyId={selectedBabyId} records={records} />

        <VaccineInsightCard
          babyId={selectedBabyId}
          records={records}
          reactions={reactions}
        />

        <UpcomingVaccineCard records={babyRecords} onComplete={markCompleted} />

        <VaccineScheduleList
          records={babyRecords}
          onMarkCompleted={(record) => markCompleted(record.id)}
        />

        <VaccineReactionTracker
          babyId={selectedBabyId}
          recordId={nextRecordId}
          onAddReaction={addReaction}
        />

        <VaccineReactionList reactions={babyReactions} />
      </section>
    </AppShell>
  );
}
