"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Lightbulb,
  Milk,
  Moon,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { babies, dailyTargets } from "@/data/babyDashboardData";
import { useTrackingStore } from "@/store/trackingStore";
import type { BabyDashboardProfile, BabyId } from "@/types/dashboard";

type TrackingLog = {
  id: string;
  babyId: string;
  type:
    | "milk"
    | "meal"
    | "sleep"
    | "diaper"
    | "mood"
    | "weight"
    | "medicine"
    | "temperature"
    | string;
  title: string;
  value: string;
  note?: string;
  createdAt: string;
  loggedAt: string;
};

type CareLevel = "good" | "watch" | "low";

type BabyAiSummary = {
  baby: BabyDashboardProfile;
  totalLogs: number;
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
  score: number;
  level: CareLevel;
  headline: string;
  positives: string[];
  warnings: string[];
  actions: string[];
};

const tabs = [
  { id: "all", label: "Cả hai bé" },
  { id: "baby-a", label: "👶🏻 Bé A" },
  { id: "baby-b", label: "👶 Bé B" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function numberFromValue(value: string) {
  const match = value.replace(",", ".").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function sleepToHours(value: string) {
  const lower = value.toLowerCase();
  const hourMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*h/);
  const minuteMatch = lower.match(/(\d+)\s*m/);

  if (hourMatch || minuteMatch) {
    const hours = hourMatch ? Number(hourMatch[1].replace(",", ".")) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return hours + minutes / 60;
  }

  return numberFromValue(value);
}

function isToday(value: string) {
  return new Date(value).toDateString() === new Date().toDateString();
}

function isWithinDays(value: string, days: number) {
  const time = new Date(value).getTime();
  const min = Date.now() - days * 24 * 60 * 60 * 1000;
  return time >= min;
}

function getTodayLogs(logs: TrackingLog[], babyId: string) {
  return logs.filter((log) => log.babyId === babyId && isToday(log.loggedAt));
}

function getWeekLogs(logs: TrackingLog[], babyId: string) {
  return logs.filter(
    (log) => log.babyId === babyId && isWithinDays(log.loggedAt, 7),
  );
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function buildBabyAiSummary(
  baby: BabyDashboardProfile,
  logs: TrackingLog[],
): BabyAiSummary {
  const todayLogs = getTodayLogs(logs, baby.id);
  const milkMl = todayLogs
    .filter((log) => log.type === "milk")
    .reduce((sum, log) => sum + numberFromValue(log.value), 0);
  const sleepHours = Number(
    todayLogs
      .filter((log) => log.type === "sleep")
      .reduce((sum, log) => sum + sleepToHours(log.value), 0)
      .toFixed(1),
  );
  const meals = todayLogs.filter((log) => log.type === "meal").length;
  const diapers = todayLogs.filter((log) => log.type === "diaper").length;

  const milkPercent = milkMl / dailyTargets.milkMl;
  const sleepPercent = sleepHours / dailyTargets.sleepHours;
  const mealPercent = meals / dailyTargets.meals;
  const diaperPercent = diapers / dailyTargets.diapers;
  const score = Math.round(
    clamp(
      (milkPercent * 0.32 +
        sleepPercent * 0.32 +
        mealPercent * 0.18 +
        diaperPercent * 0.18) *
        100,
    ),
  );

  const positives: string[] = [];
  const warnings: string[] = [];
  const actions: string[] = [];

  if (milkPercent >= 0.75) positives.push("Lượng sữa hôm nay khá ổn định.");
  else {
    warnings.push(
      `Có thể bổ sung thêm khoảng ${Math.max(0, dailyTargets.milkMl - milkMl)}ml sữa trong ngày.`,
    );
    actions.push("Ưu tiên ghi nhận thêm cữ bú tiếp theo.");
  }

  if (sleepPercent >= 0.65) positives.push("Giấc ngủ đang theo hướng tốt.");
  else {
    warnings.push(
      `Có thể thêm một giấc ngủ ngắn, hôm nay bé mới ngủ ${sleepHours}h.`,
    );
    actions.push("Sắp xếp thêm một giấc ngủ ngắn trong ngày.");
  }

  if (mealPercent >= 0.67) positives.push("Ăn dặm đang được ghi nhận đều.");
  else {
    warnings.push("Nên ghi thêm bữa ăn dặm để AI hiểu phản ứng của bé.");
    actions.push("Ghi thêm món ăn và phản ứng của bé sau bữa.");
  }

  if (diaperPercent >= 0.6) positives.push("Tần suất thay tã có dữ liệu tốt.");
  else {
    warnings.push("Nên ghi thêm loại tã để theo dõi tiêu hóa tốt hơn.");
    actions.push("Ghi nhận loại tã để theo dõi tiêu hóa tốt hơn.");
  }

  if (todayLogs.length === 0) {
    warnings.splice(
      0,
      warnings.length,
      "Hôm nay chưa có đủ dữ liệu cho bé này.",
    );
    actions.splice(
      0,
      actions.length,
      "Ghi nhận một cữ bú hoặc giấc ngủ gần nhất để AI bắt đầu phân tích.",
    );
  }

  const level: CareLevel = score >= 75 ? "good" : score >= 45 ? "watch" : "low";
  const headline =
    level === "good"
      ? `${baby.name} đang ổn định hôm nay.`
      : level === "watch"
        ? `${baby.name} cần bổ sung vài mục nhỏ.`
        : `AI cần thêm dữ liệu của ${baby.name}.`;

  return {
    baby,
    totalLogs: todayLogs.length,
    milkMl,
    sleepHours,
    meals,
    diapers,
    score,
    level,
    headline,
    positives: positives.slice(0, 3),
    warnings: warnings.slice(0, 3),
    actions: [...new Set(actions)].slice(0, 3),
  };
}

function getLevelStyle(level: CareLevel) {
  if (level === "good")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (level === "watch") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-rose-50 text-rose-700 border-rose-100";
}

function getLevelLabel(level: CareLevel) {
  if (level === "good") return "Ổn định";
  if (level === "watch") return "Cần bổ sung";
  return "Cần theo dõi";
}

function getDataConfidence(summary: BabyAiSummary) {
  const activityCoverage = [
    summary.milkMl > 0,
    summary.sleepHours > 0,
    summary.meals > 0,
    summary.diapers > 0,
  ].filter(Boolean).length;
  const logCoverage = Math.min(100, summary.totalLogs * 18);
  return clamp(Math.round(activityCoverage * 18 + logCoverage * 0.28), 0, 100);
}

function getConfidenceLabel(value: number) {
  if (value >= 75) return "Dữ liệu tốt";
  if (value >= 45) return "Đủ để tham khảo";
  return "Cần thêm dữ liệu";
}

function PercentBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-500"
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  target,
}: {
  icon: typeof Milk;
  label: string;
  value: string;
  target: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-pink-500 shadow-sm">
          <Icon size={19} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-950">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-400">
        Mục tiêu {target}
      </p>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-500">
        <Sparkles size={28} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-950">
        AI cần dữ liệu hôm nay
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Ghi nhận sữa, ngủ, ăn dặm hoặc tã để AI Coach bắt đầu phân tích chính
        xác hơn.
      </p>
      <button
        type="button"
        onClick={onSelect}
        className="mt-5 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
      >
        Ghi nhận đầu tiên
      </button>
    </section>
  );
}

function BabySummaryCard({ summary }: { summary: BabyAiSummary }) {
  const milkPercent = Math.round((summary.milkMl / dailyTargets.milkMl) * 100);
  const sleepPercent = Math.round(
    (summary.sleepHours / dailyTargets.sleepHours) * 100,
  );
  const confidence = getDataConfidence(summary);

  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-pink-50 text-2xl">
            {summary.baby.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-500">
              AI Care hôm nay
            </p>
            <h2 className="text-xl font-bold leading-tight text-slate-950">
              {summary.headline}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-950">{confidence}%</div>
          <div className="text-xs font-semibold text-slate-400">dữ liệu</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${getLevelStyle(summary.level)}`}
        >
          {getLevelLabel(summary.level)}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          {summary.totalLogs} ghi nhận hôm nay
        </span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
          {getConfidenceLabel(confidence)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <div className="rounded-3xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Sữa</p>
          <p className="mt-1 text-base font-bold text-slate-950">
            {summary.milkMl}ml
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Ngủ</p>
          <p className="mt-1 text-base font-bold text-slate-950">
            {summary.sleepHours}h
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Ăn</p>
          <p className="mt-1 text-base font-bold text-slate-950">
            {summary.meals}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Tã</p>
          <p className="mt-1 text-base font-bold text-slate-950">
            {summary.diapers}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Sữa</span>
            <span>{milkPercent}%</span>
          </div>
          <PercentBar value={milkPercent} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Ngủ</span>
            <span>{sleepPercent}%</span>
          </div>
          <PercentBar value={sleepPercent} />
        </div>
      </div>
    </section>
  );
}

function AdviceCard({ summary }: { summary: BabyAiSummary }) {
  return (
    <section className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <Lightbulb size={21} />
        </div>
        <div>
          <p className="text-sm font-semibold text-pink-500">Action Center</p>
          <h2 className="text-xl font-bold text-slate-950">
            Việc nên làm hôm nay
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {summary.actions.length > 0 ? (
          summary.actions.map((action) => (
            <div
              key={action}
              className="rounded-3xl bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800"
            >
              ＋ {action}
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-700">
            ✓ Tiếp tục duy trì lịch sinh hoạt hiện tại và ghi nhận đều trong
            ngày.
          </div>
        )}
      </div>
    </section>
  );
}

function InsightList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "good" | "warn";
}) {
  const tone =
    variant === "good"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-800";
  const icon = variant === "good" ? "✓" : "⚠";

  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item}
              className={`rounded-3xl px-4 py-3 text-sm font-medium leading-6 ${tone}`}
            >
              {icon} {item}
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-500">
            Chưa có điểm nổi bật hôm nay. Ghi thêm dữ liệu để AI nhận xét chính
            xác hơn.
          </div>
        )}
      </div>
    </section>
  );
}

function TwinCoach({ summaries }: { summaries: BabyAiSummary[] }) {
  if (summaries.length < 2) return null;

  const [a, b] = summaries;
  const milkDiff = Math.abs(a.milkMl - b.milkMl);
  const sleepDiff = Math.abs(Number((a.sleepHours - b.sleepHours).toFixed(1)));
  const scoreDiff = Math.abs(a.score - b.score);
  const lower = a.score <= b.score ? a.baby.name : b.baby.name;

  return (
    <section className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet-500">Song sinh</p>
          <h2 className="text-xl font-bold text-slate-950">
            So sánh AI hôm nay
          </h2>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
          Pro
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {summaries.map((summary) => (
          <div key={summary.baby.id} className="rounded-3xl bg-slate-50 p-4">
            <div className="text-2xl">{summary.baby.avatar}</div>
            <p className="mt-2 text-sm font-bold text-slate-950">
              {summary.baby.name}
            </p>
            <p className="text-2xl font-bold text-violet-600">
              {summary.score}
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              điểm chăm sóc
            </p>
            <PercentBar value={summary.score} />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-violet-50 p-4 text-sm leading-6 text-slate-700">
        <p className="font-bold text-slate-950">
          {scoreDiff <= 8
            ? "Hai bé khá cân bằng"
            : `${lower} cần được ghi nhận thêm`}
        </p>
        <p className="mt-1">
          Sữa lệch {milkDiff}ml • Ngủ lệch {sleepDiff}h • Điểm lệch {scoreDiff}
        </p>
      </div>
    </section>
  );
}

function WeekReport({ logs, babyId }: { logs: TrackingLog[]; babyId: BabyId }) {
  const weekLogs = getWeekLogs(logs, babyId);
  const milkTotal = weekLogs
    .filter((log) => log.type === "milk")
    .reduce((sum, log) => sum + numberFromValue(log.value), 0);
  const sleepTotal = weekLogs
    .filter((log) => log.type === "sleep")
    .reduce((sum, log) => sum + sleepToHours(log.value), 0);
  const activeDays = new Set(
    weekLogs.map((log) => new Date(log.loggedAt).toDateString()),
  ).size;

  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-violet-500">
          <TrendingUp size={21} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Báo cáo tuần</p>
          <h2 className="text-xl font-bold text-slate-950">Tổng hợp 7 ngày</h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Ngày có log</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {activeDays}/7
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Sữa</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{milkTotal}ml</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Ngủ</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {Number(sleepTotal.toFixed(1))}h
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-violet-50 px-4 py-3 text-sm font-medium leading-6 text-slate-600">
        {activeDays >= 4
          ? "Dữ liệu tuần đã đủ tốt để AI bắt đầu nhận diện xu hướng."
          : "Tuần này còn ít dữ liệu, nên ghi nhận thêm vài ngày để AI đánh giá chính xác hơn."}
      </div>
    </section>
  );
}

export default function AICoachPage() {
  const { logs } = useTrackingStore();
  const [selectedTab, setSelectedTab] = useState<TabId>("all");

  const summaries = useMemo(
    () => babies.map((baby) => buildBabyAiSummary(baby, logs)),
    [logs],
  );
  const selectedSummaries =
    selectedTab === "all"
      ? summaries
      : summaries.filter((summary) => summary.baby.id === selectedTab);
  const primarySummary = selectedSummaries[0] ?? summaries[0];
  const hasTodayLogs = selectedSummaries.some(
    (summary) => summary.totalLogs > 0,
  );
  const averageScore = Math.round(
    selectedSummaries.reduce(
      (sum, summary) => sum + getDataConfidence(summary),
      0,
    ) / Math.max(1, selectedSummaries.length),
  );

  return (
    <main className="min-h-screen bg-[#FFF7FA] text-slate-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#FFF7FA] pb-28">
        <section className="rounded-b-[2rem] bg-gradient-to-br from-pink-50 via-white to-violet-50 px-5 pb-6 pt-8 shadow-sm shadow-pink-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-pink-500">AI Coach</p>
              <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">
                Trợ lý chăm bé
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Phân tích dữ liệu sữa, ngủ, ăn dặm và tã để gợi ý chăm sóc mỗi
                ngày.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-violet-500 shadow-md shadow-violet-100">
              <Sparkles size={24} />
            </div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-5 px-4 pt-5">
          <section className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-pink-500">Độ tin cậy AI</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {averageScore >= 75
                    ? "Hôm nay khá ổn định"
                    : averageScore >= 45
                      ? "Cần bổ sung vài mục"
                      : "Cần thêm dữ liệu chăm sóc"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tỷ lệ dữ liệu hôm nay đủ để AI đưa ra gợi ý chăm sóc đáng tin
                  cậy hơn.
                </p>
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[7px] border-pink-400 bg-white text-center shadow-inner">
                <div>
                  <p className="text-2xl font-bold text-slate-950">
                    {averageScore}%
                  </p>
                  <p className="text-xs font-bold text-slate-400">dữ liệu</p>
                </div>
              </div>
            </div>
          </section>

          {!hasTodayLogs ? (
            <EmptyState onSelect={() => setSelectedTab("baby-a")} />
          ) : null}

          {selectedSummaries.map((summary) => (
            <BabySummaryCard key={summary.baby.id} summary={summary} />
          ))}

          {primarySummary ? <AdviceCard summary={primarySummary} /> : null}

          {primarySummary ? (
            <div className="grid gap-5">
              <InsightList
                title="Điểm nổi bật"
                items={primarySummary.positives}
                variant="good"
              />
              <InsightList
                title="Gợi ý thêm"
                items={primarySummary.warnings}
                variant="warn"
              />
            </div>
          ) : null}

          {selectedTab === "all" ? <TwinCoach summaries={summaries} /> : null}

          {primarySummary ? (
            <WeekReport logs={logs} babyId={primarySummary.baby.id as BabyId} />
          ) : null}
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
