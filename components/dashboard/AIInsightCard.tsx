import Link from "next/link";

interface AIInsightCardProps {
  title?: string;
  description?: string;
}

export default function AIInsightCard({
  title = "Matcha đang ăn ít hơn Mochi trong hôm nay.",
  description = "Mẹ có thể theo dõi thêm bữa chiều và ưu tiên món mềm, dễ ăn.",
}: AIInsightCardProps) {
  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 via-fuchsia-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple-700">Mind AI gợi ý</p>
          <h3 className="mt-2 text-lg font-black leading-snug text-slate-950">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

          <Link
            href="/ai-coach"
            className="mt-4 inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-black text-purple-700 shadow-sm"
          >
            Mở AI Coach
          </Link>
        </div>

        <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/70 text-4xl shadow-sm">
          🤖
        </div>
      </div>
    </div>
  );
}
