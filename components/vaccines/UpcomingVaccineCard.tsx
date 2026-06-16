import {
  getUpcomingVaccines,
  getVaccineDose,
} from "@/src/services/health/vaccineAnalyzer";
import type { BabyVaccineRecord } from "@/types/vaccine";

interface UpcomingVaccineCardProps {
  records: BabyVaccineRecord[];
  onComplete: (recordId: string) => void;
}

export default function UpcomingVaccineCard({
  records,
  onComplete,
}: UpcomingVaccineCardProps) {
  const upcoming = getUpcomingVaccines(records).slice(0, 3);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Mũi sắp tới</h3>

      <div className="mt-4 space-y-3">
        {upcoming.map((record) => {
          const dose = getVaccineDose(record.vaccineId);

          return (
            <article
              key={record.id}
              className="rounded-2xl bg-pink-50 p-4 ring-1 ring-pink-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    💉 {dose?.name} · {dose?.doseLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{dose?.disease}</p>
                  <p className="mt-2 text-xs font-bold text-pink-500">
                    {new Date(record.scheduledDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onComplete(record.id)}
                  className="rounded-full bg-white px-3 py-2 text-xs font-black text-pink-600 shadow-sm"
                >
                  Đã tiêm
                </button>
              </div>
            </article>
          );
        })}

        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Chưa có mũi sắp tới.
          </p>
        ) : null}
      </div>
    </div>
  );
}
