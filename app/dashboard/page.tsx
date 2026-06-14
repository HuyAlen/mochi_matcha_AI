"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Baby,
  Bell,
  CalendarDays,
  HeartPulse,
  LineChart,
  Milk,
  Moon,
  Plus,
  Sparkles,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  babies,
  dailyTargets,
  growthByBaby,
  quickActions,
} from "@/data/babyDashboardData";
import {
  buildAiInsights,
  getDashboardStatus,
  toPercent,
} from "@/services/dashboard/dashboardAnalyzer";
import { useTrackingStore } from "@/store/trackingStore";
import type {
  BabyDashboardProfile,
  BabyId,
  GrowthPoint,
  TimelineItem,
} from "@/types/dashboard";

type TrackingType =
  | "milk"
  | "sleep"
  | "meal"
  | "diaper"
  | "mood"
  | "weight"
  | "medicine"
  | "temperature";

type TrackingEntry = {
  id: string;
  babyId: string;
  type: TrackingType;
  title?: string;
  value?: string | number;
  note?: string;
  unit?: string;
  createdAt?: string;
  loggedAt?: string;
};

type MetricId = "milkMl" | "sleepHours" | "meals" | "diapers";

type MetricConfig = {
  id: MetricId;
  label: string;
  unit: string;
  icon: typeof Milk;
  tone: string;
};

const metricConfig: MetricConfig[] = [
  {
    id: "milkMl",
    label: "Sữa",
    unit: "ml",
    icon: Milk,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    id: "sleepHours",
    label: "Ngủ",
    unit: "h",
    icon: Moon,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    id: "meals",
    label: "Ăn",
    unit: "bữa",
    icon: Utensils,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    id: "diapers",
    label: "Tã",
    unit: "lần",
    icon: Activity,
    tone: "bg-rose-50 text-rose-600",
  },
];

const trackingDisplay: Record<
  string,
  { title: string; unit: string; icon: typeof Milk }
> = {
  milk: { title: "Bú sữa", unit: "ml", icon: Milk },
  sleep: { title: "Giấc ngủ", unit: "h", icon: Moon },
  meal: { title: "Ăn dặm", unit: "bữa", icon: Utensils },
  diaper: { title: "Thay tã", unit: "lần", icon: Activity },
  mood: { title: "Tâm trạng", unit: "điểm", icon: Baby },
  weight: { title: "Cân nặng", unit: "kg", icon: LineChart },
  medicine: { title: "Uống thuốc", unit: "", icon: Activity },
  temperature: { title: "Nhiệt độ", unit: "°C", icon: Activity },
};

function isValidDate(value?: string) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function getLogTime(entry: TrackingEntry) {
  return entry.loggedAt ?? entry.createdAt;
}

function isSameLocalDate(value?: string, date = new Date()) {
  if (!isValidDate(value)) return false;
  return new Date(value!).toDateString() === date.toDateString();
}

function formatTime(value?: string) {
  if (!isValidDate(value)) return "--:--";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value!));
}

function extractTrackingNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? "").replace(",", ".");
  const match = normalized.match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function getTrackingMetricValue(entry: TrackingEntry) {
  if (entry.type === "sleep") {
    const lower = String(entry.value ?? "").toLowerCase();
    const hourMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*h/);
    const minuteMatch = lower.match(/(\d+)\s*m/);
    if (hourMatch || minuteMatch) {
      const hours = hourMatch ? Number(hourMatch[1].replace(",", ".")) : 0;
      const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
      return Number((hours + minutes / 60).toFixed(1));
    }
  }
  return extractTrackingNumber(entry.value);
}

function getTodayEntries(entries: TrackingEntry[], babyId: BabyId) {
  return entries.filter(
    (entry) => entry.babyId === babyId && isSameLocalDate(getLogTime(entry)),
  );
}

function getTodaySummary(entries: TrackingEntry[], babyId: BabyId) {
  return getTodayEntries(entries, babyId).reduce(
    (summary, entry) => {
      const safeValue = getTrackingMetricValue(entry);
      if (entry.type === "milk") summary.milkMl += safeValue;
      if (entry.type === "sleep") summary.sleepHours += safeValue;
      if (entry.type === "meal") summary.meals += 1;
      if (entry.type === "diaper") summary.diapers += 1;
      return summary;
    },
    { milkMl: 0, sleepHours: 0, meals: 0, diapers: 0 },
  );
}

function mergeBabyWithEntries(
  baby: BabyDashboardProfile,
  entries: TrackingEntry[],
): BabyDashboardProfile {
  const summary = getTodaySummary(entries, baby.id);
  return {
    ...baby,
    today: {
      milkMl: Math.round(summary.milkMl),
      sleepHours: Number(summary.sleepHours.toFixed(1)),
      meals: summary.meals,
      diapers: summary.diapers,
    },
  };
}

function buildTodayTimeline(
  entries: TrackingEntry[],
  babyId: BabyId,
): TimelineItem[] {
  return getTodayEntries(entries, babyId)
    .sort(
      (a, b) =>
        new Date(getLogTime(b) ?? 0).getTime() -
        new Date(getLogTime(a) ?? 0).getTime(),
    )
    .slice(0, 3)
    .map((entry) => {
      const display = trackingDisplay[entry.type] ?? trackingDisplay.mood;
      const value = String(entry.value ?? "");
      const unit = entry.unit || display.unit;
      const hasUnit =
        unit && value && !value.toLowerCase().includes(unit.toLowerCase());
      const valueText = hasUnit ? `${value}${unit}` : value || display.title;
      const description = entry.note
        ? `${valueText} · ${entry.note}`
        : valueText;
      return {
        id: entry.id,
        babyId: entry.babyId as BabyId,
        time: formatTime(getLogTime(entry)),
        title: display.title,
        description,
        type: ["milk", "sleep", "meal", "diaper", "mood"].includes(entry.type)
          ? (entry.type as TimelineItem["type"])
          : "mood",
      };
    });
}

function safeMetricValue(baby: BabyDashboardProfile, id: MetricId) {
  const value = Number(baby.today?.[id] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

type CareScoreResult = {
  score: number;
  label: "Tốt" | "Cần theo dõi" | "Theo dõi sát";
  badgeClass: string;
  summary: string;
  positives: string[];
  warnings: string[];
};

type GrowthInsightResult = {
  weightGain: number;
  heightGain: number;
  trend: string;
  note: string;
};

type TwinInsightResult = {
  title: string;
  description: string;
  milkGap: number;
  sleepGap: number;
  weightGap: number;
  developmentGap: number;
};

type SmartReminder = {
  id: string;
  title: string;
  description: string;
  tone: "rose" | "amber" | "violet" | "emerald";
  actionType?: string;
};

function formatNumber(value: number, fractionDigits = 1) {
  if (!Number.isFinite(value)) return "0";
  return Number(value.toFixed(fractionDigits)).toString();
}

function getCareScore(
  baby: BabyDashboardProfile,
  sibling: BabyDashboardProfile,
): CareScoreResult {
  const milkPercent = toPercent(baby.today.milkMl, dailyTargets.milkMl);
  const sleepPercent = toPercent(
    baby.today.sleepHours,
    dailyTargets.sleepHours,
  );
  const mealsPercent = toPercent(baby.today.meals, dailyTargets.meals);
  const diapersPercent = toPercent(baby.today.diapers, dailyTargets.diapers);
  const twinBalancePenalty =
    Math.abs(baby.today.milkMl - sibling.today.milkMl) > 180 ||
    Math.abs(baby.today.sleepHours - sibling.today.sleepHours) > 2.5
      ? 6
      : 0;
  const rawScore = Math.round(
    milkPercent * 0.3 +
      sleepPercent * 0.28 +
      mealsPercent * 0.16 +
      diapersPercent * 0.1 +
      baby.developmentScore * 0.16 -
      twinBalancePenalty,
  );
  const score = Math.max(45, Math.min(100, rawScore));

  const positives: string[] = [];
  const warnings: string[] = [];
  if (milkPercent >= 65) positives.push("Sữa đang tiến gần mục tiêu hôm nay");
  else
    warnings.push(
      `Còn thiếu khoảng ${Math.max(dailyTargets.milkMl - baby.today.milkMl, 0)}ml sữa`,
    );
  if (sleepPercent >= 65) positives.push("Giấc ngủ đã có dữ liệu tốt hơn");
  else
    warnings.push(
      `Nên bổ sung khoảng ${formatNumber(Math.max(dailyTargets.sleepHours - baby.today.sleepHours, 0), 1)}h ngủ`,
    );
  if (baby.today.meals >= dailyTargets.meals)
    positives.push("Ăn dặm đã đủ số bữa");
  else
    warnings.push(
      `Còn thiếu ${Math.max(dailyTargets.meals - baby.today.meals, 0)} bữa ăn dặm`,
    );
  if (Math.abs(baby.developmentScore - sibling.developmentScore) <= 8)
    positives.push("Hai bé phát triển khá cân bằng");

  const label =
    score >= 80 ? "Tốt" : score >= 60 ? "Cần theo dõi" : "Theo dõi sát";
  const badgeClass =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : score >= 60
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-rose-50 text-rose-600 border-rose-100";

  return {
    score,
    label,
    badgeClass,
    summary:
      score >= 80
        ? `${baby.name} đang có nhịp chăm sóc tốt.`
        : score >= 60
          ? `${baby.name} ổn, cần bổ sung vài mục nhỏ.`
          : `${baby.name} cần theo dõi sát hôm nay.`,
    positives: positives.slice(0, 2),
    warnings: warnings.slice(0, 2),
  };
}

function getGrowthInsight(growth: GrowthPoint[]): GrowthInsightResult {
  const first = growth[0];
  const last = growth[growth.length - 1];
  if (!first || !last) {
    return {
      weightGain: 0,
      heightGain: 0,
      trend: "Chưa đủ dữ liệu",
      note: "Cần thêm dữ liệu cân nặng và chiều cao để AI nhận xét chính xác hơn.",
    };
  }
  const weightGain = Number((last.weight - first.weight).toFixed(2));
  const heightGain = Number((last.height - first.height).toFixed(1));
  const trend =
    weightGain >= 0.25 && heightGain >= 0.6
      ? "Tăng trưởng tốt"
      : weightGain >= 0.12 || heightGain >= 0.3
        ? "Tăng trưởng ổn định"
        : "Cần theo dõi thêm";
  return {
    weightGain,
    heightGain,
    trend,
    note:
      trend === "Tăng trưởng tốt"
        ? "Đường tăng trưởng 30 ngày đang tích cực."
        : trend === "Tăng trưởng ổn định"
          ? "Xu hướng tăng trưởng ổn, tiếp tục theo dõi đều."
          : "Nên cập nhật thêm cân nặng và chiều cao trong vài ngày tới.",
  };
}

function getTwinInsight(
  selectedBaby: BabyDashboardProfile,
  sibling: BabyDashboardProfile,
): TwinInsightResult {
  const milkGap = selectedBaby.today.milkMl - sibling.today.milkMl;
  const sleepGap = Number(
    (selectedBaby.today.sleepHours - sibling.today.sleepHours).toFixed(1),
  );
  const weightGap = Number((selectedBaby.weight - sibling.weight).toFixed(1));
  const developmentGap =
    selectedBaby.developmentScore - sibling.developmentScore;
  const hasGap =
    Math.abs(milkGap) >= 180 ||
    Math.abs(sleepGap) >= 2 ||
    Math.abs(developmentGap) >= 10;
  return {
    title: hasGap ? "Có chênh lệch nhẹ cần theo dõi" : "Hai bé khá cân bằng",
    description: hasGap
      ? "Nên quan sát bé có lượng sữa, giấc ngủ hoặc điểm phát triển thấp hơn trong 3-5 ngày tới."
      : "Nhịp chăm sóc và phát triển của hai bé đang ổn định trong hôm nay.",
    milkGap,
    sleepGap,
    weightGap,
    developmentGap,
  };
}

function getHoursSinceLastEntry(
  entries: TrackingEntry[],
  babyId: BabyId,
  type: TrackingType,
) {
  const latest = entries
    .filter(
      (entry) =>
        entry.babyId === babyId &&
        entry.type === type &&
        isValidDate(getLogTime(entry)),
    )
    .sort(
      (a, b) =>
        new Date(getLogTime(b) ?? 0).getTime() -
        new Date(getLogTime(a) ?? 0).getTime(),
    )[0];

  if (!latest) return null;
  const diffMs = Date.now() - new Date(getLogTime(latest)!).getTime();
  return Math.max(0, Number((diffMs / 36e5).toFixed(1)));
}

function buildSmartReminders(
  entries: TrackingEntry[],
  baby: BabyDashboardProfile,
  sibling: BabyDashboardProfile,
): SmartReminder[] {
  const reminders: SmartReminder[] = [];
  const todayEntries = getTodayEntries(entries, baby.id);
  const siblingTodayEntries = getTodayEntries(entries, sibling.id);
  const lastMilkHours = getHoursSinceLastEntry(entries, baby.id, "milk");
  const currentHour = new Date().getHours();

  if (todayEntries.length === 0) {
    reminders.push({
      id: "empty-today",
      title: `Bắt đầu nhật ký cho ${baby.name}`,
      description:
        "Hôm nay chưa có hoạt động nào. Ghi nhận cữ sữa đầu tiên để AI bắt đầu phân tích.",
      tone: "violet",
      actionType: "milk",
    });
  }

  if (sibling.id !== baby.id && siblingTodayEntries.length === 0) {
    reminders.push({
      id: "sibling-empty",
      title: `${sibling.name} chưa có dữ liệu hôm nay`,
      description:
        "Với song sinh, mẹ nên ghi cùng loại hoạt động cho cả hai bé để AI so sánh chính xác hơn.",
      tone: "amber",
    });
  }

  if (
    lastMilkHours !== null &&
    lastMilkHours >= 3 &&
    baby.today.milkMl < dailyTargets.milkMl
  ) {
    reminders.push({
      id: "milk-gap",
      title: `Đã ${formatNumber(lastMilkHours, 1)}h chưa ghi nhận bú sữa`,
      description: `${baby.name} còn thiếu khoảng ${Math.max(dailyTargets.milkMl - baby.today.milkMl, 0)}ml so với mục tiêu hôm nay.`,
      tone: "rose",
      actionType: "milk",
    });
  }

  if (baby.today.sleepHours < dailyTargets.sleepHours * 0.45) {
    reminders.push({
      id: "sleep-low",
      title: "Giấc ngủ hôm nay còn thấp",
      description: `${baby.name} mới ghi nhận ${formatNumber(baby.today.sleepHours, 1)}h ngủ. Nên bổ sung thêm giấc ngắn nếu bé có dấu hiệu mệt.`,
      tone: "violet",
      actionType: "sleep",
    });
  }

  if (currentHour >= 11 && baby.today.meals < dailyTargets.meals) {
    reminders.push({
      id: "meal-reminder",
      title: "Ăn dặm chưa đủ mục tiêu",
      description: `${baby.name} còn thiếu ${Math.max(dailyTargets.meals - baby.today.meals, 0)} bữa ăn dặm trong hôm nay.`,
      tone: "amber",
      actionType: "meal",
    });
  }

  if (reminders.length === 0) {
    reminders.push({
      id: "stable",
      title: "Nhịp chăm sóc hôm nay khá ổn",
      description:
        "Tiếp tục ghi nhận đều sữa, ngủ, ăn và tã để AI theo dõi xu hướng chính xác hơn.",
      tone: "emerald",
    });
  }

  return reminders.slice(0, 3);
}

export default function DashboardPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("baby-a");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<string | null>(
    null,
  );
  const trackingStore = useTrackingStore();
  const entries = useMemo(
    () =>
      (Array.isArray(trackingStore.logs)
        ? trackingStore.logs
        : []) as TrackingEntry[],
    [trackingStore.logs],
  );

  const dashboardBabies = useMemo(
    () => babies.map((baby) => mergeBabyWithEntries(baby, entries)),
    [entries],
  );
  const selectedBaby = useMemo(
    () =>
      dashboardBabies.find((baby) => baby.id === selectedBabyId) ??
      dashboardBabies[0],
    [dashboardBabies, selectedBabyId],
  );
  const sibling = useMemo(
    () =>
      dashboardBabies.find((baby) => baby.id !== selectedBaby.id) ??
      dashboardBabies[1] ??
      selectedBaby,
    [dashboardBabies, selectedBaby],
  );
  const growth = growthByBaby[selectedBaby.id] ?? [];
  const todayTimeline = buildTodayTimeline(entries, selectedBaby.id);
  const status = getDashboardStatus(selectedBaby, dailyTargets);
  const insights = buildAiInsights(selectedBaby, sibling, dailyTargets).slice(
    0,
    2,
  );
  const careScore = getCareScore(selectedBaby, sibling);
  const growthInsight = getGrowthInsight(growth);
  const twinInsight = getTwinInsight(selectedBaby, sibling);
  const smartReminders = buildSmartReminders(entries, selectedBaby, sibling);

  function openQuickAdd(type?: string) {
    setQuickAddInitialType(type ?? null);
    setIsQuickAddOpen(true);
  }

  function closeQuickAdd() {
    setIsQuickAddOpen(false);
    setQuickAddInitialType(null);
  }

  function handleQuickAdd(input: {
    babyId: BabyId;
    type: string;
    value: number | string;
    note?: string;
  }) {
    trackingStore.addTrackingLog(input.type, {
      babyId: input.babyId,
      value: String(input.value ?? ""),
      note: input.note,
    });
    closeQuickAdd();
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-900 antialiased">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf7] pb-28 shadow-[0_0_40px_rgba(15,23,42,0.04)]">
        <header className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 px-4 pb-5 pt-4 sm:px-5 shadow-sm shadow-rose-100">
          <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/35" />
          <div className="absolute -bottom-16 left-5 h-40 w-40 rounded-full bg-white/25" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-rose-500">
                Xin chào mẹ 💕
              </p>
              <h1 className="text-[2rem] font-bold">Bé Mind AI</h1>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Theo dõi song sinh, nhận gợi ý chăm sóc mỗi ngày
              </p>
            </div>
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-rose-500 shadow-sm backdrop-blur">
              <Bell size={20} />
            </button>
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-3">
            {dashboardBabies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => setSelectedBabyId(baby.id)}
                className={`rounded-3xl p-2.5 text-left transition ${baby.id === selectedBaby.id ? "bg-white text-slate-900 shadow-lg shadow-rose-100/80" : "bg-white/45 text-slate-700"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                    {baby.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{baby.name}</p>
                    <p className="text-xs text-slate-500">{baby.nickname}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </header>

        <section className="w-full px-3 pt-5 sm:px-4">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-rose-100/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-rose-500">
                  Tổng quan hôm nay
                </p>
                <h2 className="mt-1 text-[1.45rem] font-bold leading-tight">
                  {status.title}
                </h2>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {selectedBaby.age} · {selectedBaby.weight}kg ·{" "}
                  {selectedBaby.height}cm
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {metricConfig.map((metric) => (
                <MetricPill
                  key={metric.id}
                  baby={selectedBaby}
                  metric={metric}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <UnifiedAiCard
              careScore={careScore}
              growthInsight={growthInsight}
              baby={selectedBaby}
              insights={insights}
            />
          </div>

          <div className="mt-6 space-y-6">
            <SmartReminderSection
              reminders={smartReminders}
              onOpen={openQuickAdd}
            />
            <QuickActionStrip onOpen={openQuickAdd} />
            <TimelineSection
              timeline={todayTimeline}
              baby={selectedBaby}
              onOpen={openQuickAdd}
            />
            <TwinSnapshot
              babies={dashboardBabies}
              selectedBaby={selectedBaby}
              twinInsight={twinInsight}
            />
          </div>
        </section>

        {isQuickAddOpen ? (
          <QuickAddSheet
            baby={selectedBaby}
            initialType={quickAddInitialType}
            onAdd={handleQuickAdd}
            onClose={closeQuickAdd}
          />
        ) : null}
        <BottomNav />
      </div>
    </main>
  );
}

function MetricPill({
  baby,
  metric,
}: {
  baby: BabyDashboardProfile;
  metric: MetricConfig;
}) {
  const Icon = metric.icon;
  const rawValue = safeMetricValue(baby, metric.id);
  const rawTarget = Number(dailyTargets[metric.id] ?? 1);
  const target = Number.isFinite(rawTarget) && rawTarget > 0 ? rawTarget : 1;
  const percent = toPercent(rawValue, target);
  return (
    <div className="flex h-[108px] flex-col justify-between rounded-2xl bg-slate-50 p-2 text-center">
      <div
        className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl ${metric.tone}`}
      >
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-bold text-slate-400">{metric.label}</p>
      <p className="text-sm font-bold text-slate-900">
        {rawValue}
        {metric.unit}
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-300 to-violet-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function UnifiedAiCard({
  careScore,
  growthInsight,
  baby,
  insights,
}: {
  careScore: CareScoreResult;
  growthInsight: GrowthInsightResult;
  baby: BabyDashboardProfile;
  insights: ReturnType<typeof buildAiInsights>;
}) {
  const stroke = Math.round((careScore.score / 100) * 113);
  const firstInsight = insights[0];
  return (
    <div className="rounded-[1.75rem] bg-gradient-to-br from-white via-violet-50/50 to-rose-50/50 p-4 shadow-sm ring-1 ring-violet-100/80">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#fb7185"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${stroke} 113`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-900">
              {careScore.score}
            </span>
            <span className="text-[10px] font-bold text-slate-400">AI</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-violet-500" />
            <p className="text-sm font-bold text-violet-500">
              AI Care + Growth
            </p>
          </div>
          <h2 className="mt-1 text-lg font-bold leading-tight text-slate-900">
            {careScore.summary}
          </h2>
          <span
            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${careScore.badgeClass}`}
          >
            {careScore.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallInfo
          label="Cân nặng 30 ngày"
          value={`+${formatNumber(growthInsight.weightGain, 2)}kg`}
        />
        <SmallInfo
          label="Chiều cao 30 ngày"
          value={`+${formatNumber(growthInsight.heightGain, 1)}cm`}
        />
      </div>

      <div className="mt-4 space-y-2">
        {careScore.positives.slice(0, 1).map((text) => (
          <p
            key={text}
            className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm leading-5 text-emerald-700"
          >
            ✓ {text}
          </p>
        ))}
        {careScore.warnings.slice(0, 2).map((text) => (
          <p
            key={text}
            className="rounded-2xl bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-700"
          >
            ⚠ {text}
          </p>
        ))}
      </div>

      {firstInsight ? (
        <div className="mt-4 rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
              <TrendingUp size={19} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {firstInsight.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {firstInsight.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-3xl bg-white/80 p-3 text-sm leading-6 text-slate-600">
          AI đang theo dõi dữ liệu chăm sóc của {baby.name}. Hãy ghi nhận thêm
          hoạt động để gợi ý chính xác hơn.
        </p>
      )}
    </div>
  );
}

function SmartReminderSection({
  reminders,
  onOpen,
}: {
  reminders: SmartReminder[];
  onOpen: (type?: string) => void;
}) {
  const toneClass: Record<SmartReminder["tone"], string> = {
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-violet-100/80">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-violet-500">Smart Reminder</p>
          <h2 className="text-xl font-bold text-slate-900">Nhắc mẹ hôm nay</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
          <Bell size={18} />
        </div>
      </div>

      <div className="space-y-2.5">
        {reminders.map((reminder) => (
          <button
            key={reminder.id}
            type="button"
            onClick={() =>
              reminder.actionType ? onOpen(reminder.actionType) : undefined
            }
            className="w-full rounded-3xl bg-slate-50 p-3 text-left transition active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${toneClass[reminder.tone]}`}
              >
                <Sparkles size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-5 text-slate-900">
                  {reminder.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {reminder.description}
                </p>
              </div>
              {reminder.actionType ? (
                <span className="mt-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-violet-500 shadow-sm">
                  Thêm
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickActionStrip({ onOpen }: { onOpen: (type?: string) => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-violet-500">Ghi nhận nhanh</p>
          <h2 className="text-xl font-bold">Hoạt động phổ biến</h2>
        </div>
        <button
          onClick={() => onOpen()}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm"
        >
          <Plus size={22} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {quickActions.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onOpen(item.id)}
              className="flex h-[108px] flex-col items-center justify-center rounded-3xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100 active:scale-95"
            >
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}
              >
                <Icon size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">{item.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimelineSection({
  timeline,
  baby,
  onOpen,
}: {
  timeline: TimelineItem[];
  baby: BabyDashboardProfile;
  onOpen: (type?: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Nhật ký hôm nay</h2>
          <p className="text-sm text-slate-500">3 hoạt động gần nhất</p>
        </div>
        <CalendarDays size={20} className="text-rose-400" />
      </div>
      <div className="space-y-3">
        {timeline.length > 0 ? (
          timeline.map((item) => <TimelineRow key={item.id} item={item} />)
        ) : (
          <div className="rounded-[1.75rem] bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <Milk size={24} />
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Hôm nay chưa có hoạt động nào
            </h3>
            <p className="mx-auto mt-1 max-w-[280px] text-sm leading-6 text-slate-500">
              Ghi nhận lần bú đầu tiên cho {baby.name} để AI bắt đầu phân tích
              nhịp chăm sóc hôm nay.
            </p>
            <button
              type="button"
              onClick={() => onOpen("milk")}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-rose-500 px-5 text-sm font-bold text-white shadow-lg shadow-rose-200 active:scale-95"
            >
              <Plus size={17} className="mr-2" /> Ghi lần đầu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const display = trackingDisplay[item.type] ?? trackingDisplay.mood;
  const Icon = display.icon;
  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <p className="w-12 text-xs font-bold text-slate-400">{item.time}</p>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{item.title}</p>
        <p className="truncate text-sm text-slate-500">{item.description}</p>
      </div>
    </div>
  );
}

function TwinSnapshot({
  babies,
  selectedBaby,
  twinInsight,
}: {
  babies: BabyDashboardProfile[];
  selectedBaby: BabyDashboardProfile;
  twinInsight: TwinInsightResult;
}) {
  const milkGap = Math.abs(twinInsight.milkGap);
  const sleepGap = formatNumber(Math.abs(twinInsight.sleepGap), 1);

  return (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-indigo-100">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Song sinh</h2>
          <p className="text-sm text-slate-500">Snapshot chăm sóc hôm nay</p>
        </div>
        <button className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          Chi tiết
        </button>
      </div>

      <div className="space-y-3 rounded-3xl bg-slate-50 p-3">
        {babies.map((baby) => (
          <CompactTwinRow
            key={baby.id}
            baby={baby}
            active={baby.id === selectedBaby.id}
          />
        ))}
      </div>

      <div className="mt-3 rounded-3xl bg-indigo-50 p-3">
        <div className="flex items-start gap-2">
          <HeartPulse className="mt-0.5 shrink-0 text-indigo-500" size={17} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {twinInsight.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Theo dõi bé có lượng sữa, giấc ngủ hoặc điểm phát triển thấp hơn
              trong vài ngày tới.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
              <span className="rounded-full bg-white px-3 py-1.5">
                Sữa lệch {milkGap}ml
              </span>
              <span className="rounded-full bg-white px-3 py-1.5">
                Ngủ lệch {sleepGap}h
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactTwinRow({
  baby,
  active,
}: {
  baby: BabyDashboardProfile;
  active: boolean;
}) {
  const percent = Math.max(10, Math.min(100, baby.developmentScore));
  return (
    <div
      className={`rounded-2xl p-2.5 ${active ? "bg-indigo-50" : "bg-white"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{baby.avatar}</span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{baby.name}</p>
            <p className="text-xs text-slate-500">
              {baby.today.milkMl}ml sữa ·{" "}
              {formatNumber(baby.today.sleepHours, 1)}h ngủ
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-indigo-600">
          {baby.developmentScore}/100
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-indigo-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-white">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function getQuickAddMeta(baby: BabyDashboardProfile, type: string) {
  if (type === "milk") return `Hôm nay ${baby.today.milkMl}ml`;
  if (type === "sleep")
    return `Hôm nay ${formatNumber(baby.today.sleepHours, 1)}h`;
  if (type === "meal") return `${baby.today.meals} bữa hôm nay`;
  if (type === "diaper") return `${baby.today.diapers} lần hôm nay`;
  return "Ghi nhận nhanh";
}

function getDefaultQuickAddValue(type: string) {
  if (type === "milk") return "120";
  if (type === "sleep") return "1.5";
  if (type === "meal") return "Bữa ăn dặm";
  if (type === "diaper") return "Tã ướt";
  return "";
}

function formatQuickAddValue(type: string, rawValue: string) {
  const value = rawValue.trim();
  if (type === "milk")
    return value ? `${value.replace(/ml$/i, "")}ml` : "120ml";
  if (type === "sleep") return value ? `${value.replace(/h$/i, "")}h` : "1.5h";
  if (type === "meal") return value || "Bữa ăn dặm";
  if (type === "diaper") return value || "Tã ướt";
  return value || "Ghi nhận nhanh";
}

function QuickAddSheet({
  baby,
  initialType,
  onAdd,
  onClose,
}: {
  baby: BabyDashboardProfile;
  initialType?: string | null;
  onAdd: (input: {
    babyId: BabyId;
    type: string;
    value: number | string;
    note?: string;
  }) => void;
  onClose: () => void;
}) {
  const [selectedType, setSelectedType] = useState<string | null>(
    initialType ?? null,
  );
  const [value, setValue] = useState(() =>
    initialType ? getDefaultQuickAddValue(initialType) : "",
  );
  const [note, setNote] = useState("");
  const [logTime, setLogTime] = useState(() =>
    new Date().toTimeString().slice(0, 5),
  );
  const [milkKind, setMilkKind] = useState("Sữa mẹ");
  const [milkMethod, setMilkMethod] = useState("Bình");
  const [milkDuration, setMilkDuration] = useState("15");
  const [milkStatus, setMilkStatus] = useState("Bú tốt");
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [mealAmount, setMealAmount] = useState("Vừa đủ");
  const [mealReaction, setMealReaction] = useState("Ăn tốt");
  const [diaperType, setDiaperType] = useState("Tã ướt");
  const [diaperColor, setDiaperColor] = useState("Vàng");

  const selectedAction =
    quickActions.find((item) => item.id === selectedType) ?? null;
  const SelectedIcon = selectedAction?.icon;

  function resetForm(type?: string | null) {
    setValue(type ? getDefaultQuickAddValue(type) : "");
    setNote("");
    setLogTime(new Date().toTimeString().slice(0, 5));
    setMilkKind("Sữa mẹ");
    setMilkMethod("Bình");
    setMilkDuration("15");
    setMilkStatus("Bú tốt");
    setSleepStart("");
    setSleepEnd("");
    setMealAmount("Vừa đủ");
    setMealReaction("Ăn tốt");
    setDiaperType("Tã ướt");
    setDiaperColor("Vàng");
  }

  function openForm(type: string) {
    setSelectedType(type);
    resetForm(type);
  }

  function backToActions() {
    setSelectedType(null);
    resetForm(null);
  }

  function getSleepHoursFromTime() {
    if (!sleepStart || !sleepEnd) return value;
    const [sh, sm] = sleepStart.split(":").map(Number);
    const [eh, em] = sleepEnd.split(":").map(Number);
    if (!Number.isFinite(sh) || !Number.isFinite(eh)) return value;
    const start = sh * 60 + (sm || 0);
    let end = eh * 60 + (em || 0);
    if (end < start) end += 24 * 60;
    const hours = Math.max(0.1, (end - start) / 60);
    return Number(hours.toFixed(1)).toString();
  }

  function submitForm() {
    if (!selectedAction) return;

    const finalValue =
      selectedAction.id === "sleep"
        ? getSleepHoursFromTime()
        : selectedAction.id === "diaper"
          ? diaperType
          : value;
    const detailNote = buildQuickAddNote(selectedAction.id, {
      logTime,
      note,
      milkKind,
      milkMethod,
      milkDuration,
      milkStatus,
      sleepStart,
      sleepEnd,
      mealAmount,
      mealReaction,
      diaperType,
      diaperColor,
    });

    onAdd({
      babyId: baby.id,
      type: selectedAction.id,
      value: formatQuickAddValue(selectedAction.id, String(finalValue)),
      note: detailNote || `${selectedAction.label} từ trang chủ`,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 backdrop-blur-sm">
      <button
        aria-label="Đóng thêm nhanh"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.18)]">
        <div className="max-h-[min(86dvh,690px)] overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-3">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-rose-500">Thêm nhanh</p>
              <h2 className="text-[1.25rem] font-bold leading-tight text-slate-900">
                {selectedAction
                  ? selectedAction.label
                  : `Ghi nhận cho ${baby.name}`}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedAction
                  ? `Lưu dữ liệu ${selectedAction.label.toLowerCase()} cho ${baby.name}`
                  : "Chọn hoạt động để lưu nhanh hôm nay"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-95"
              aria-label="Đóng"
            >
              <X size={17} />
            </button>
          </div>

          {!selectedAction ? (
            <div className="grid grid-cols-2 gap-3">
              {quickActions.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const meta = getQuickAddMeta(baby, item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => openForm(item.id)}
                    className="group flex min-h-[82px] flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50 p-3 text-left shadow-sm transition active:scale-95"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold text-slate-400 shadow-sm transition group-active:scale-90">
                        +
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-4 text-slate-500">
                        {meta}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  {SelectedIcon ? (
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${selectedAction.tone}`}
                    >
                      <SelectedIcon size={21} />
                    </div>
                  ) : null}
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedAction.label}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {getQuickAddMeta(baby, selectedAction.id)}
                    </p>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Thời gian ghi nhận
                </span>
                <input
                  type="time"
                  value={logTime}
                  onChange={(event) => setLogTime(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-100 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              {selectedAction.id === "milk" ? (
                <div className="space-y-3">
                  <FieldGroup
                    title="Loại sữa"
                    options={["Sữa mẹ", "Sữa công thức", "Kết hợp"]}
                    value={milkKind}
                    onChange={setMilkKind}
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Lượng sữa
                    </span>
                    <div className="relative">
                      <input
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        inputMode="decimal"
                        placeholder="VD: 120"
                        className="h-12 w-full rounded-2xl border border-slate-100 bg-white px-4 pr-14 text-base font-bold text-slate-900 outline-none placeholder:text-slate-300 focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ml
                      </span>
                    </div>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[90, 120, 150, 180].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setValue(String(amount))}
                        className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-600 active:scale-95"
                      >
                        {amount}ml
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup
                      title="Cách bú"
                      options={["Bình", "Trực tiếp", "Kết hợp"]}
                      value={milkMethod}
                      onChange={setMilkMethod}
                      compact
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Thời lượng
                      </span>
                      <div className="relative">
                        <input
                          value={milkDuration}
                          onChange={(event) =>
                            setMilkDuration(event.target.value)
                          }
                          inputMode="numeric"
                          className="h-11 w-full rounded-2xl border border-slate-100 bg-white px-4 pr-14 text-sm font-bold text-slate-900 outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          phút
                        </span>
                      </div>
                    </label>
                  </div>
                  <FieldGroup
                    title="Tình trạng"
                    options={["Bú tốt", "Bú ít", "Ngủ khi bú", "Nôn trớ"]}
                    value={milkStatus}
                    onChange={setMilkStatus}
                  />
                </div>
              ) : null}

              {selectedAction.id === "sleep" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Bắt đầu
                      </span>
                      <input
                        type="time"
                        value={sleepStart}
                        onChange={(event) => setSleepStart(event.target.value)}
                        className="h-11 w-full rounded-2xl border border-slate-100 bg-white px-4 text-sm font-bold outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Kết thúc
                      </span>
                      <input
                        type="time"
                        value={sleepEnd}
                        onChange={(event) => setSleepEnd(event.target.value)}
                        className="h-11 w-full rounded-2xl border border-slate-100 bg-white px-4 text-sm font-bold outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Hoặc nhập nhanh số giờ
                    </span>
                    <div className="relative">
                      <input
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        inputMode="decimal"
                        placeholder="VD: 1.5"
                        className="h-12 w-full rounded-2xl border border-slate-100 bg-white px-4 pr-14 text-base font-bold text-slate-900 outline-none placeholder:text-slate-300 focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        giờ
                      </span>
                    </div>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.5, 1, 1.5, 2].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setValue(String(hours))}
                        className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-600 active:scale-95"
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedAction.id === "meal" ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Tên món / bữa ăn
                    </span>
                    <input
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder="VD: Cháo cá hồi"
                      className="h-12 w-full rounded-2xl border border-slate-100 bg-white px-4 text-base font-bold text-slate-900 outline-none placeholder:text-slate-300 focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                    />
                  </label>
                  <FieldGroup
                    title="Số lượng"
                    options={["Ít", "Vừa đủ", "Ăn hết", "Từ chối"]}
                    value={mealAmount}
                    onChange={setMealAmount}
                  />
                  <FieldGroup
                    title="Phản ứng"
                    options={[
                      "Ăn tốt",
                      "Bình thường",
                      "Nôn trớ",
                      "Nghi dị ứng",
                    ]}
                    value={mealReaction}
                    onChange={setMealReaction}
                  />
                </div>
              ) : null}

              {selectedAction.id === "diaper" ? (
                <div className="space-y-3">
                  <FieldGroup
                    title="Loại tã"
                    options={["Tã ướt", "Tã bẩn", "Cả hai"]}
                    value={diaperType}
                    onChange={setDiaperType}
                  />
                  <FieldGroup
                    title="Màu sắc"
                    options={["Vàng", "Xanh", "Nâu", "Khác"]}
                    value={diaperColor}
                    onChange={setDiaperColor}
                  />
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Ghi chú
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  placeholder="VD: Bé bú tốt, ngủ sâu, phản ứng với món ăn..."
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300 focus:border-rose-200 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 pt-1">
                <button
                  type="button"
                  onClick={backToActions}
                  className="h-12 rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition active:scale-95"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-sm font-bold text-white shadow-lg shadow-rose-200 transition active:scale-95"
                >
                  <Plus size={18} /> Lưu ghi nhận
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  title,
  options,
  value,
  onChange,
  compact = false,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{title}</p>
      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition active:scale-95 ${value === option ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-100 bg-white text-slate-500"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildQuickAddNote(
  type: string,
  fields: {
    logTime: string;
    note: string;
    milkKind: string;
    milkMethod: string;
    milkDuration: string;
    milkStatus: string;
    sleepStart: string;
    sleepEnd: string;
    mealAmount: string;
    mealReaction: string;
    diaperType: string;
    diaperColor: string;
  },
) {
  const details: string[] = [];
  if (fields.logTime) details.push(`Giờ: ${fields.logTime}`);
  if (type === "milk") {
    details.push(`Loại sữa: ${fields.milkKind}`);
    details.push(`Cách bú: ${fields.milkMethod}`);
    if (fields.milkDuration)
      details.push(`Thời lượng: ${fields.milkDuration} phút`);
    details.push(`Tình trạng: ${fields.milkStatus}`);
  }
  if (type === "sleep") {
    if (fields.sleepStart) details.push(`Bắt đầu: ${fields.sleepStart}`);
    if (fields.sleepEnd) details.push(`Kết thúc: ${fields.sleepEnd}`);
  }
  if (type === "meal") {
    details.push(`Số lượng: ${fields.mealAmount}`);
    details.push(`Phản ứng: ${fields.mealReaction}`);
  }
  if (type === "diaper") {
    details.push(`Loại tã: ${fields.diaperType}`);
    details.push(`Màu sắc: ${fields.diaperColor}`);
  }
  if (fields.note.trim()) details.push(fields.note.trim());
  return details.join(" · ");
}
