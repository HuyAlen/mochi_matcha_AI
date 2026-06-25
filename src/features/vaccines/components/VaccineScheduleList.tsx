import { getVaccineDose } from "@/src/services/health/vaccineAnalyzer";
import type { BabyVaccineRecord, VaccineStatus } from "@/types/vaccine";

interface VaccineScheduleListProps {
  records: BabyVaccineRecord[];
  onMarkCompleted?: (record: BabyVaccineRecord) => void;
}

const statusText: Record<VaccineStatus, string> = {
  completed: "Đã tiêm",
  upcoming: "Sắp tiêm",
  overdue: "Quá hạn",
};

const statusClass: Record<VaccineStatus, string> = {
  completed: "bg-lime-50 text-lime-700",
  upcoming: "bg-pink-50 text-pink-700",
  overdue: "bg-amber-50 text-amber-700",
};

const actionClass: Record<Exclude<VaccineStatus, "completed">, string> = {
  upcoming: "bg-pink-600 text-white shadow-sm shadow-pink-100",
  overdue: "bg-amber-500 text-white shadow-sm shadow-amber-100",
};

const groups = [
  { key: "upcoming", title: "Sắp tới" },
  { key: "overdue", title: "Quá hạn" },
  { key: "completed", title: "Đã tiêm" },
] as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function VaccineRow({
  record,
  onMarkCompleted,
}: {
  record: BabyVaccineRecord;
  onMarkCompleted?: (record: BabyVaccineRecord) => void;
}) {
  const dose = getVaccineDose(record.vaccineId);
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-black leading-snug text-slate-950">
            {dose?.name} · {dose?.doseLabel}
          </p>
          <p className="mt-1 text-sm text-slate-500">{dose?.disease}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Lịch: {formatDate(record.scheduledDate)}
            {record.completedDate
              ? ` · Đã tiêm: ${formatDate(record.completedDate)}`
              : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${statusClass[record.status]}`}
        >
          {statusText[record.status]}
        </span>
      </div>

      {record.status !== "completed" ? (
        <button
          type="button"
          onClick={() => onMarkCompleted?.(record)}
          className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black ${actionClass[record.status]}`}
        >
          Ghi đã tiêm
        </button>
      ) : null}
    </div>
  );
}

export default function VaccineScheduleList({
  records,
  onMarkCompleted,
}: VaccineScheduleListProps) {
  return (
    <div className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Lịch tiêm</h3>

      <div className="mt-4 space-y-5">
        {groups.map((group) => {
          const groupRecords = records.filter(
            (record) => record.status === group.key,
          );

          if (groupRecords.length === 0) return null;

          return (
            <section key={group.key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  {group.title}
                </p>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-400">
                  {groupRecords.length}
                </span>
              </div>

              <div className="space-y-3">
                {groupRecords.map((record) => (
                  <VaccineRow
                    key={record.id}
                    record={record}
                    onMarkCompleted={onMarkCompleted}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {records.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Chưa có dữ liệu lịch tiêm cho bé này.
          </p>
        ) : null}
      </div>
    </div>
  );
}
