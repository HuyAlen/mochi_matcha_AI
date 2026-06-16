import type { AIInsight } from "@/types/ai";

interface AITwinSummaryCardProps {
  insights: AIInsight[];
}

export default function AITwinSummaryCard({
  insights,
}: AITwinSummaryCardProps) {
  const warnings = insights.filter(
    (item) => item.severity === "warning",
  ).length;
  const positives = insights.filter(
    (item) => item.severity === "positive",
  ).length;

  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 via-purple-100 to-lime-100 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-purple-700">AI Twin Summary</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">
            Hôm nay AI có {insights.length} nhận xét cho Mochi & Matcha
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {warnings > 0
              ? `Có ${warnings} điểm cần mẹ chú ý nhẹ.`
              : "Chưa phát hiện bất thường đáng chú ý."}
          </p>
        </div>

        <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/80 text-4xl shadow-sm">
          🤖
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="text-2xl font-black text-lime-600">{positives}</p>
          <p className="text-xs font-bold text-slate-500">Tín hiệu tốt</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="text-2xl font-black text-amber-600">{warnings}</p>
          <p className="text-xs font-bold text-slate-500">Cần chú ý</p>
        </div>
      </div>
    </div>
  );
}
