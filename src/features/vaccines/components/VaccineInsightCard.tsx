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
    <div className="rounded-[2rem] bg-linear-to-br from-pink-50 via-fuchsia-50 to-purple-50 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          🤖
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600">
              AI Reminder
            </p>
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black text-pink-500 ring-1 ring-pink-100">
              Vaccine
            </span>
          </div>

          <h3 className="mt-2 text-lg font-black leading-snug text-slate-950">
            {insight.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}
