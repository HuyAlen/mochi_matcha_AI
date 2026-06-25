import {
  getUpcomingVaccines,
  getVaccineDose,
} from "@/src/services/health/vaccineAnalyzer";
import type { BabyVaccineRecord } from "@/types/vaccine";

interface UpcomingVaccineCardProps {
  records: BabyVaccineRecord[];
  onComplete: (recordId: string) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function daysUntil(date: string) {
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

export default function UpcomingVaccineCard({
  records,
  onComplete,
}: UpcomingVaccineCardProps) {
  const upcoming = getUpcomingVaccines(records).slice(0, 3);

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Next shots
          </p>
          <h3 className="mt-1 font-black text-slate-950">Mũi sắp tới</h3>
        </div>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-600">
          {upcoming.length} mũi
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.map((record) => {
          const dose = getVaccineDose(record.vaccineId);
          const remainingDays = daysUntil(record.scheduledDate);
          const remainingText =
            remainingDays > 0
              ? `Còn ${remainingDays} ngày`
              : remainingDays === 0
                ? "Hôm nay"
                : `Quá ${Math.abs(remainingDays)} ngày`;

          return (
            <article
              key={record.id}
              className="rounded-[1.5rem] bg-pink-50/70 p-4 ring-1 ring-pink-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-black leading-snug text-slate-950">
                    💉 {dose?.name} · {dose?.doseLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{dose?.disease}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-500 shadow-sm">
                      {formatDate(record.scheduledDate)}
                    </span>
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-[11px] font-black text-pink-600">
                      {remainingText}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onComplete(record.id)}
                  className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-pink-600 shadow-sm ring-1 ring-pink-100 transition active:scale-95"
                >
                  Ghi đã tiêm
                </button>
              </div>
            </article>
          );
        })}

        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Chưa có mũi sắp tới cho bé này.
          </p>
        ) : null}
      </div>
    </div>
  );
}
