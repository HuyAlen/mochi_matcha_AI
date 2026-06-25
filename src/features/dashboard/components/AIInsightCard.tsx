"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

type CoachTone =
  | "default"
  | "good"
  | "care"
  | "warning"
  | "sleep"
  | "milk"
  | "meal"
  | "diaper"
  | "trend";

type BabyDailyStats = {
  babyId: BabyId;
  name: string;
  emoji: string;
  totalEntries: number;
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
  moodCount: number;
  medicineCount: number;
  temperatureLatest?: number;
  lastEntry?: TrackingEntry;
};

type CareCoachInsight = {
  title: string;
  description: string;
  recommendation: string;
  tone: CoachTone;
  icon: string;
  score: number;
  label: string;
};

type InsightContext = {
  today: {
    mochi: BabyDailyStats;
    matcha: BabyDailyStats;
  };
  yesterday: {
    mochi: BabyDailyStats;
    matcha: BabyDailyStats;
  };
  score: number;
};

const babyMeta: Record<BabyId, { name: string; emoji: string }> = {
  mochi: { name: "Mochi", emoji: "🎀" },
  matcha: { name: "Matcha", emoji: "🌸" },
};

const toneClass: Record<CoachTone, string> = {
  default: "bg-slate-50 text-slate-600 ring-slate-100",
  good: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  care: "bg-purple-50 text-purple-600 ring-purple-100",
  warning: "bg-amber-50 text-amber-600 ring-amber-100",
  sleep: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  milk: "bg-pink-50 text-pink-600 ring-pink-100",
  meal: "bg-orange-50 text-orange-600 ring-orange-100",
  diaper: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  trend: "bg-violet-50 text-violet-600 ring-violet-100",
};

const defaultInsight: CareCoachInsight = {
  title: "Mind AI đang học nhịp chăm sóc của hai bé.",
  description:
    "Khi có thêm dữ liệu sữa, ngủ, ăn và tã, AI sẽ so sánh Mochi - Matcha và phát hiện xu hướng trong ngày.",
  recommendation:
    "Mẹ cứ ghi nhận các hoạt động chính như bình thường, Mind AI sẽ tự chọn insight quan trọng nhất để hiển thị.",
  tone: "default",
  icon: "✨",
  score: 0,
  label: "Đang học dữ liệu",
};

function subscribeHydrationStore() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeHydrationStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getPreviousDate(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
}

function getLatestTemperature(entries: TrackingEntry[]) {
  const latest = entries.find((entry) => entry.type === "temperature");
  return latest ? Number(latest.value ?? 0) : undefined;
}

function buildBabyStats(
  babyId: BabyId,
  entries: TrackingEntry[],
): BabyDailyStats {
  return {
    babyId,
    name: babyMeta[babyId].name,
    emoji: babyMeta[babyId].emoji,
    totalEntries: entries.length,
    milkMl: getTotal(entries, "milk"),
    sleepHours: getTotal(entries, "sleep"),
    meals: entries.filter((entry) => entry.type === "meal").length,
    diapers: getTotal(entries, "diaper"),
    moodCount: entries.filter((entry) => entry.type === "mood").length,
    medicineCount: entries.filter((entry) => entry.type === "medicine").length,
    temperatureLatest: getLatestTemperature(entries),
    lastEntry: entries[0],
  };
}

function calculateCareScore(mochi: BabyDailyStats, matcha: BabyDailyStats) {
  const totalMilk = mochi.milkMl + matcha.milkMl;
  const totalSleep = mochi.sleepHours + matcha.sleepHours;
  const totalMeals = mochi.meals + matcha.meals;
  const totalDiapers = mochi.diapers + matcha.diapers;
  const dataScore = Math.min(
    30,
    (mochi.totalEntries + matcha.totalEntries) * 4,
  );
  const twinScore = mochi.totalEntries > 0 && matcha.totalEntries > 0 ? 15 : 0;
  const milkScore = totalMilk > 0 ? 20 : 0;
  const sleepScore = totalSleep > 0 ? 20 : 0;
  const careScore = totalDiapers > 0 ? 10 : 0;
  const mealScore = totalMeals > 0 ? 5 : 0;

  return Math.min(
    100,
    dataScore + twinScore + milkScore + sleepScore + careScore + mealScore,
  );
}

function buildContext(
  todayMochiEntries: TrackingEntry[],
  todayMatchaEntries: TrackingEntry[],
  yesterdayMochiEntries: TrackingEntry[],
  yesterdayMatchaEntries: TrackingEntry[],
): InsightContext {
  const mochi = buildBabyStats("mochi", todayMochiEntries);
  const matcha = buildBabyStats("matcha", todayMatchaEntries);

  return {
    today: {
      mochi,
      matcha,
    },
    yesterday: {
      mochi: buildBabyStats("mochi", yesterdayMochiEntries),
      matcha: buildBabyStats("matcha", yesterdayMatchaEntries),
    },
    score: calculateCareScore(mochi, matcha),
  };
}

function buildTwinSleepInsight(ctx: InsightContext): CareCoachInsight | null {
  const { mochi, matcha } = ctx.today;

  if (mochi.sleepHours <= 0 || matcha.sleepHours <= 0) return null;

  const sleepDiff = Math.abs(mochi.sleepHours - matcha.sleepHours);
  if (sleepDiff < 1.5) return null;

  const lower = mochi.sleepHours < matcha.sleepHours ? mochi : matcha;
  const higher = lower.babyId === "mochi" ? matcha : mochi;

  return {
    title: `${lower.emoji} ${lower.name} ngủ ít hơn ${higher.name} hôm nay.`,
    description: `Tổng giấc ngủ đang lệch khoảng ${formatNumber(
      sleepDiff,
    )} giờ giữa hai bé. Đây là điểm AI ưu tiên theo dõi trong ngày.`,
    recommendation:
      "Mẹ nên quan sát thêm giấc ngủ chiều hoặc cữ ngủ tối của bé ngủ ít hơn để xem bé có cần hỗ trợ ngủ bù không.",
    tone: "sleep",
    icon: "🌙",
    score: ctx.score,
    label: "Insight giấc ngủ",
  };
}

function buildTwinMilkInsight(ctx: InsightContext): CareCoachInsight | null {
  const { mochi, matcha } = ctx.today;

  if (mochi.milkMl <= 0 || matcha.milkMl <= 0) return null;

  const milkDiff = Math.abs(mochi.milkMl - matcha.milkMl);
  if (milkDiff < 120) return null;

  const lower = mochi.milkMl < matcha.milkMl ? mochi : matcha;
  const higher = lower.babyId === "mochi" ? matcha : mochi;

  return {
    title: `${lower.emoji} ${lower.name} bú ít hơn ${higher.name}.`,
    description: `Lượng sữa hôm nay đang lệch khoảng ${formatNumber(
      milkDiff,
    )} ml giữa hai bé.`,
    recommendation:
      "Mẹ có thể xem lại cữ bú gần nhất, thời gian bú và dấu hiệu đói của bé bú ít hơn trước cữ tiếp theo.",
    tone: "milk",
    icon: "🍼",
    score: ctx.score,
    label: "Insight sữa",
  };
}

function buildYesterdayTrendInsight(
  ctx: InsightContext,
): CareCoachInsight | null {
  const todaySleep = ctx.today.mochi.sleepHours + ctx.today.matcha.sleepHours;
  const yesterdaySleep =
    ctx.yesterday.mochi.sleepHours + ctx.yesterday.matcha.sleepHours;
  const todayMilk = ctx.today.mochi.milkMl + ctx.today.matcha.milkMl;
  const yesterdayMilk =
    ctx.yesterday.mochi.milkMl + ctx.yesterday.matcha.milkMl;
  const sleepDelta = todaySleep - yesterdaySleep;
  const milkDelta = todayMilk - yesterdayMilk;

  if (todaySleep > 0 && yesterdaySleep > 0 && Math.abs(sleepDelta) >= 2) {
    const direction = sleepDelta > 0 ? "nhiều hơn" : "ít hơn";

    return {
      title: `Tổng giấc ngủ hôm nay ${direction} hôm qua.`,
      description: `Hai bé đang ngủ ${direction} khoảng ${formatNumber(
        Math.abs(sleepDelta),
      )} giờ so với cùng ngày trước đó.`,
      recommendation:
        sleepDelta > 0
          ? "Mẹ tiếp tục theo dõi cữ bú sau các giấc ngủ dài để đảm bảo hai bé vẫn ăn đủ."
          : "Mẹ nên chú ý tín hiệu buồn ngủ sớm hơn và giữ nhịp ngủ chiều ổn định hơn trong hôm nay.",
      tone: "trend",
      icon: "📈",
      score: ctx.score,
      label: "Xu hướng ngủ",
    };
  }

  if (todayMilk > 0 && yesterdayMilk > 0 && Math.abs(milkDelta) >= 180) {
    const direction = milkDelta > 0 ? "tăng" : "giảm";

    return {
      title: `Tổng lượng sữa hôm nay đang ${direction}.`,
      description: `Hai bé đang uống ${direction} khoảng ${formatNumber(
        Math.abs(milkDelta),
      )} ml so với hôm qua.`,
      recommendation:
        milkDelta > 0
          ? "Mẹ có thể duy trì lịch hiện tại nếu hai bé bú thoải mái và không có dấu hiệu khó chịu."
          : "Mẹ nên theo dõi cữ bú tối và lý do bú ít hơn, ví dụ ngủ nhiều, ăn dặm nhiều hoặc bé mệt.",
      tone: "trend",
      icon: "📊",
      score: ctx.score,
      label: "Xu hướng sữa",
    };
  }

  return null;
}

function buildSingleBabySignalInsight(
  ctx: InsightContext,
): CareCoachInsight | null {
  const babies = [ctx.today.mochi, ctx.today.matcha];
  const active = babies.find(
    (baby) =>
      baby.sleepHours > 0 ||
      baby.milkMl > 0 ||
      baby.meals > 0 ||
      baby.diapers > 0,
  );

  if (!active) return null;

  if (active.sleepHours > 0 && active.sleepHours < 0.75) {
    return {
      title: `${active.emoji} ${active.name} mới có một giấc ngủ ngắn hôm nay.`,
      description: `Mind AI ghi nhận khoảng ${formatNumber(
        active.sleepHours,
      )} giờ ngủ. Đây chưa phải cảnh báo, nhưng là tín hiệu nên theo dõi thêm trong ngày.`,
      recommendation:
        "Mẹ nên quan sát tín hiệu buồn ngủ và cập nhật thêm giấc tiếp theo để AI so sánh nhịp ngủ chính xác hơn.",
      tone: "sleep",
      icon: "🌙",
      score: ctx.score,
      label: "Tín hiệu ngủ",
    };
  }

  if (active.milkMl > 0) {
    return {
      title: `${active.emoji} ${active.name} đã có dữ liệu cữ sữa hôm nay.`,
      description: `Mind AI ghi nhận ${formatNumber(
        active.milkMl,
      )} ml sữa. Khi bé còn lại có thêm dữ liệu, AI sẽ so sánh cân bằng giữa hai bé.`,
      recommendation:
        "Mẹ tiếp tục ghi nhận các cữ tiếp theo để AI phát hiện bé nào bú ít hơn hoặc thay đổi so với hôm qua.",
      tone: "milk",
      icon: "🍼",
      score: ctx.score,
      label: "Theo dõi sữa",
    };
  }

  if (active.meals > 0) {
    return {
      title: `${active.emoji} ${active.name} đã có bữa ăn dặm hôm nay.`,
      description:
        "Mind AI sẽ dùng dữ liệu món ăn và phản ứng sau ăn để học khẩu vị của từng bé.",
      recommendation:
        "Mẹ nên ghi thêm ghi chú món ăn, lượng ăn và phản ứng để AI gợi ý thực đơn tốt hơn ở các sprint sau.",
      tone: "meal",
      icon: "🥣",
      score: ctx.score,
      label: "Khẩu vị",
    };
  }

  if (active.diapers > 0) {
    return {
      title: `${active.emoji} ${active.name} đã có dữ liệu thay tã hôm nay.`,
      description: `AI ghi nhận ${formatNumber(active.diapers)} lần thay tã để theo dõi nhịp chăm sóc cơ bản.`,
      recommendation:
        "Mẹ tiếp tục ghi nhận tã ướt hoặc tã bẩn trong ngày để AI liên kết với lượng bú và giấc ngủ.",
      tone: "diaper",
      icon: "🧷",
      score: ctx.score,
      label: "Theo dõi tã",
    };
  }

  return null;
}

function buildBalancedInsight(ctx: InsightContext): CareCoachInsight | null {
  const { mochi, matcha } = ctx.today;
  const bothHaveCoreData =
    mochi.milkMl > 0 &&
    matcha.milkMl > 0 &&
    mochi.sleepHours > 0 &&
    matcha.sleepHours > 0;

  if (!bothHaveCoreData) return null;

  return {
    title: "Nhịp chăm sóc hôm nay đang khá cân bằng.",
    description:
      "Mochi và Matcha đều đã có dữ liệu sữa và giấc ngủ, chưa thấy độ lệch lớn cần ưu tiên xử lý.",
    recommendation:
      "Mẹ tiếp tục duy trì nhịp hiện tại và cập nhật thêm ăn dặm, tã để Mind AI phân tích sâu hơn vào cuối ngày.",
    tone: "good",
    icon: "✨",
    score: ctx.score,
    label: "Ổn định",
  };
}

function buildLowDataFallback(ctx: InsightContext): CareCoachInsight {
  const totalEntries =
    ctx.today.mochi.totalEntries + ctx.today.matcha.totalEntries;

  if (totalEntries === 0) {
    return {
      ...defaultInsight,
      score: ctx.score,
      icon: "📝",
      title: "Mind AI đang chờ dữ liệu đầu tiên hôm nay.",
      description:
        "Hôm nay chưa có hoạt động nào được ghi nhận cho Mochi và Matcha.",
      recommendation:
        "Mẹ hãy thêm một cữ bú, giấc ngủ, ăn dặm hoặc thay tã để AI bắt đầu phân tích nhịp sinh hoạt.",
    };
  }

  return {
    title: "Mind AI đã thấy dữ liệu mới trong ngày.",
    description:
      "Dữ liệu hiện tại còn ít nên AI chỉ đưa ra nhận xét nhẹ, chưa kết luận thiếu bữa hay thiếu cữ.",
    recommendation:
      "Mẹ tiếp tục ghi nhận tự nhiên. Khi dữ liệu đủ hơn, AI sẽ ưu tiên so sánh Mochi - Matcha và xu hướng so với hôm qua.",
    tone: "care",
    icon: "🤖",
    score: ctx.score,
    label: "Đang phân tích",
  };
}

function buildRealInsight(ctx: InsightContext): CareCoachInsight {
  if (ctx.score < 10) return buildLowDataFallback(ctx);

  return (
    buildTwinSleepInsight(ctx) ??
    buildTwinMilkInsight(ctx) ??
    buildYesterdayTrendInsight(ctx) ??
    buildBalancedInsight(ctx) ??
    buildSingleBabySignalInsight(ctx) ??
    buildLowDataFallback(ctx)
  );
}

export default function AIInsightCard() {
  const isHydrated = useIsHydrated();
  const [expanded, setExpanded] = useState(false);

  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );
  const getEntriesByDate = useTrackingStore(
    (state: {
      getEntriesByDate: (date: Date, babyId?: BabyId) => TrackingEntry[];
    }) => state.getEntriesByDate,
  );

  const insight = useMemo(() => {
    if (!isHydrated) return defaultInsight;

    const yesterday = getPreviousDate(1);
    const context = buildContext(
      getTodayEntries("mochi"),
      getTodayEntries("matcha"),
      getEntriesByDate(yesterday, "mochi"),
      getEntriesByDate(yesterday, "matcha"),
    );

    return buildRealInsight(context);
  }, [getEntriesByDate, getTodayEntries, isHydrated]);

  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-xl ring-1 ring-pink-100">
          🤖
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              AI Care Coach
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${toneClass[insight.tone]}`}
            >
              {insight.icon} {insight.label}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-slate-950">
            {insight.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
            {insight.description}
          </p>

          {expanded ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-white to-purple-50 p-3 ring-1 ring-pink-100/70">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-pink-400">
                  Gợi ý của Mind AI
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {insight.recommendation}
                </p>
              </div>

              <div className="min-w-0">
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all"
                    style={{ width: `${Math.max(8, insight.score)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  Độ đầy đủ dữ liệu: {insight.score}%
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-100 transition active:scale-95"
            >
              {expanded ? "Thu gọn" : "Xem phân tích"}
            </button>

            <Link
              href="/ai-coach"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-xs font-black text-white shadow-sm transition active:scale-95"
            >
              Mở AI Coach
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
