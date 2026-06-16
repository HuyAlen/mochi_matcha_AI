import { buildVaccineSummary } from "@/src/services/health/vaccineAnalyzer";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord } from "@/types/vaccine";

interface VaccineSummaryCardProps {
  babyId: BabyId;
  records: BabyVaccineRecord[];
}

export default function VaccineSummaryCard({
  babyId,
  records,
}: VaccineSummaryCardProps) {
  const summary = buildVaccineSummary(babyId, records);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-bold text-pink-500">Vaccine Summary</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-lime-50 p-3 text-center">
          <p className="text-2xl font-black text-lime-600">
            {summary.completedCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Đã tiêm</p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-3 text-center">
          <p className="text-2xl font-black text-pink-600">
            {summary.upcomingCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Sắp tiêm</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-black text-amber-600">
            {summary.overdueCount}
          </p>
          <p className="text-[10px] font-bold text-slate-500">Quá hạn</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold text-slate-400">Mũi tiếp theo</p>
        <p className="mt-1 font-black text-slate-950">
          {summary.nextVaccineTitle}
        </p>
        {summary.nextVaccineDate ? (
          <p className="mt-1 text-sm text-slate-500">
            Ngày dự kiến:{" "}
            {new Date(summary.nextVaccineDate).toLocaleDateString("vi-VN")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
