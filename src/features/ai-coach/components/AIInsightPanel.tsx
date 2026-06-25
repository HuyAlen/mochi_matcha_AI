import type { AIInsight } from "@/types/ai";

const severityStyle = {
  positive: "bg-lime-50 text-lime-700 ring-lime-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  info: "bg-pink-50 text-pink-700 ring-pink-100",
};

const categoryIcon = {
  nutrition: "🥣",
  sleep: "🌙",
  growth: "📈",
  tracking: "🍼",
  twin_compare: "👯‍♀️",
  reminder: "🔔",
};

interface AIInsightPanelProps {
  insights: AIInsight[];
}

export default function AIInsightPanel({ insights }: AIInsightPanelProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-black text-slate-950">Personal Insights</h3>
        <p className="mt-1 text-sm text-slate-500">
          AI đọc dữ liệu tracking và ăn dặm để gợi ý cho từng bé.
        </p>
      </div>

      {insights.slice(0, 4).map((insight) => (
        <article
          key={insight.id}
          className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
              {categoryIcon[insight.category]}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-black leading-5 text-slate-950">
                  {insight.title}
                </h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ring-1 ${
                    severityStyle[insight.severity]
                  }`}
                >
                  {insight.severity === "warning"
                    ? "Cần chú ý"
                    : insight.severity === "positive"
                      ? "Tốt"
                      : "Gợi ý"}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {insight.description}
              </p>

              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-400">Mẹ nên làm</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {insight.recommendation}
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
