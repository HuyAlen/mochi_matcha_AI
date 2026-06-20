import { buildVaccineSummary } from "@/src/services/health/vaccineAnalyzer";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord } from "@/types/vaccine";

interface VaccineSummaryCardProps {
  babyId: BabyId;
  records: BabyVaccineRecord[];
}

function formatDate(date?: string) {
  if (!date) return "Chưa có lịch";
  return new Date(date).toLocaleDateString("vi-VN");
}

function daysUntil(date?: string) {
  if (!date) return undefined;

  const today = new Date();
  const target = new Date(date);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();

  return Math.ceil((targetStart - todayStart) / 86_400_000);
}

export default function VaccineSummaryCard({
  babyId,
  records,
}: VaccineSummaryCardProps) {
  const summary = buildVaccineSummary(babyId, records);
  const remainingDays = daysUntil(summary.nextVaccineDate);

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-400">
            Vaccine Summary
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            Tổng quan tiêm chủng
          </h3>
        </div>
        {typeof remainingDays === "number" ? (
          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-600">
            {remainingDays > 0
              ? `Còn ${remainingDays} ngày`
              : remainingDays === 0
                ? "Hôm nay"
                : `Quá ${Math.abs(remainingDays)} ngày`}
          </span>
        ) : null}
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
          Mũi tiếp theo
        </p>
        <p className="mt-2 text-lg font-black leading-snug text-slate-950">
          {summary.nextVaccineTitle}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Ngày dự kiến: {formatDate(summary.nextVaccineDate)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-lime-50 p-3 text-center">
          <p className="text-2xl font-black text-lime-600">
            {summary.completedCount}
          </p>
          <p className="text-[10px] font-black text-slate-500">Đã tiêm</p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-3 text-center">
          <p className="text-2xl font-black text-pink-600">
            {summary.upcomingCount}
          </p>
          <p className="text-[10px] font-black text-slate-500">Sắp tiêm</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-center">
          <p className="text-2xl font-black text-amber-600">
            {summary.overdueCount}
          </p>
          <p className="text-[10px] font-black text-slate-500">Quá hạn</p>
        </div>
      </div>
    </div>
  );
}
