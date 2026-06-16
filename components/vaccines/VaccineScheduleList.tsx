import { getVaccineDose } from "@/src/services/health/vaccineAnalyzer";
import type { BabyVaccineRecord } from "@/types/vaccine";

interface VaccineScheduleListProps {
  records: BabyVaccineRecord[];
}

const statusText = {
  completed: "Đã tiêm",
  upcoming: "Sắp tiêm",
  overdue: "Quá hạn",
};

const statusClass = {
  completed: "bg-lime-50 text-lime-700",
  upcoming: "bg-pink-50 text-pink-700",
  overdue: "bg-amber-50 text-amber-700",
};

export default function VaccineScheduleList({
  records,
}: VaccineScheduleListProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Lịch tiêm</h3>

      <div className="mt-4 space-y-3">
        {records.map((record) => {
          const dose = getVaccineDose(record.vaccineId);

          return (
            <div
              key={record.id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <div>
                <p className="font-black text-slate-900">
                  {dose?.name} · {dose?.doseLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500">{dose?.disease}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Lịch:{" "}
                  {new Date(record.scheduledDate).toLocaleDateString("vi-VN")}
                  {record.completedDate
                    ? ` · Đã tiêm: ${new Date(record.completedDate).toLocaleDateString("vi-VN")}`
                    : ""}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${statusClass[record.status]}`}
              >
                {statusText[record.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
