import type { VaccineReaction } from "@/types/vaccine";

interface VaccineReactionListProps {
  reactions: VaccineReaction[];
}

const severityText = {
  mild: "Nhẹ",
  moderate: "Vừa",
  severe: "Nặng",
};

const severityClass = {
  mild: "bg-lime-50 text-lime-700",
  moderate: "bg-amber-50 text-amber-700",
  severe: "bg-rose-50 text-rose-700",
};

export default function VaccineReactionList({
  reactions,
}: VaccineReactionListProps) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-slate-950">Phản ứng đã ghi nhận</h3>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-400">
          {reactions.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {reactions.map((reaction) => (
          <div key={reaction.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-950">{reaction.symptom}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {new Date(reaction.createdAt).toLocaleDateString("vi-VN")}
                  {reaction.temperature ? ` · ${reaction.temperature}°C` : ""}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${severityClass[reaction.severity]}`}
              >
                {severityText[reaction.severity]}
              </span>
            </div>

            {reaction.note ? (
              <p className="mt-3 rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600">
                {reaction.note}
              </p>
            ) : null}
          </div>
        ))}

        {reactions.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Chưa có phản ứng sau tiêm. Khi bé vừa tiêm xong, mẹ có thể ghi nhận
            nhiệt độ, triệu chứng và ghi chú tại đây.
          </p>
        ) : null}
      </div>
    </div>
  );
}
