import type { VaccineReaction } from "@/types/vaccine";

interface VaccineReactionListProps {
  reactions: VaccineReaction[];
}

const severityText = {
  mild: "Nhẹ",
  moderate: "Vừa",
  severe: "Nặng",
};

export default function VaccineReactionList({
  reactions,
}: VaccineReactionListProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Phản ứng đã ghi nhận</h3>

      <div className="mt-4 space-y-3">
        {reactions.map((reaction) => (
          <div key={reaction.id} className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{reaction.symptom}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(reaction.createdAt).toLocaleDateString("vi-VN")}
                  {reaction.temperature ? ` · ${reaction.temperature}°C` : ""}
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">
                {severityText[reaction.severity]}
              </span>
            </div>

            {reaction.note ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {reaction.note}
              </p>
            ) : null}
          </div>
        ))}

        {reactions.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Chưa có phản ứng sau tiêm.
          </p>
        ) : null}
      </div>
    </div>
  );
}
