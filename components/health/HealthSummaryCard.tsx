import { buildHealthSummary } from "@/src/services/health/healthAnalyzer";
import type { BabyId } from "@/types/baby";
import type { HealthEvent } from "@/types/health";

interface HealthSummaryCardProps {
  babyId: BabyId;
  events: HealthEvent[];
}

export default function HealthSummaryCard({
  babyId,
  events,
}: HealthSummaryCardProps) {
  const summary = buildHealthSummary(babyId, events);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Health Summary</h3>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-amber-50 p-3 text-center">
          <p className="text-xl font-black text-amber-600">
            {summary.feverCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Sốt</p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-3 text-center">
          <p className="text-xl font-black text-pink-600">
            {summary.medicineCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Thuốc</p>
        </div>
        <div className="rounded-2xl bg-lime-50 p-3 text-center">
          <p className="text-xl font-black text-lime-600">
            {summary.doctorVisitCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Khám</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {summary.latestNote}
      </p>
    </div>
  );
}
