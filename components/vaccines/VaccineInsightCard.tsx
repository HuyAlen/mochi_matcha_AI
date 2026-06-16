import { buildVaccineInsight } from "@/src/services/health/vaccineAnalyzer";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord, VaccineReaction } from "@/types/vaccine";

interface VaccineInsightCardProps {
  babyId: BabyId;
  records: BabyVaccineRecord[];
  reactions: VaccineReaction[];
}

export default function VaccineInsightCard({
  babyId,
  records,
  reactions,
}: VaccineInsightCardProps) {
  const insight = buildVaccineInsight(babyId, records, reactions);

  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">AI Vaccine Reminder</p>
      <h3 className="mt-2 text-lg font-black text-slate-950">
        {insight.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {insight.description}
      </p>
    </div>
  );
}
