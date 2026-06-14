"use client";

// Sprint 7.2 Fix Pack v5 - self-contained dashboard render, no undefined metrics
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Baby,
  Bell,
  Brain,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  LineChart,
  Milk,
  Moon,
  Plus,
  RefreshCcw,
  Sparkles,
  Syringe,
  Utensils,
  X,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  babies,
  dailyTargets,
  growthByBaby,
  quickActions,
  vaccineReminders,
} from "@/data/babyDashboardData";
import {
  buildAiInsights,
  buildWeeklyReport,
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
import type {
  AddTrackingInput,
  TrackingEntry,
  TrackingType,
} from "@/types/tracking";

type GrowthMode = "weight" | "height";
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
    label: "Ăn dặm",
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

const quickValueByType: Partial<Record<TrackingType, number>> = {
  milk: 120,
  sleep: 1.25,
  meal: 1,
  diaper: 1,
  mood: 5,
};

const trackingDisplay: Partial<
  Record<TrackingType, { title: string; unit: string; icon: typeof Milk }>
> = {
  milk: { title: "Bú sữa", unit: "ml", icon: Milk },
  sleep: { title: "Giấc ngủ", unit: "h", icon: Moon },
  meal: { title: "Ăn dặm", unit: "bữa", icon: Utensils },
  diaper: { title: "Thay tã", unit: "lần", icon: Activity },
  mood: { title: "Tâm trạng", unit: "điểm", icon: Baby },
};

function isValidDate(value?: string) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
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

function getTodayEntries(entries: TrackingEntry[], babyId: BabyId) {
  return entries.filter(
    (entry) => entry.babyId === babyId && isSameLocalDate(entry.createdAt),
  );
}

function getTodaySummary(entries: TrackingEntry[], babyId: BabyId) {
  return getTodayEntries(entries, babyId).reduce(
    (summary, entry) => {
      const value = Number(entry.value ?? 0);
      const safeValue = Number.isFinite(value) ? value : 0;

      if (entry.type === "milk") summary.milkMl += safeValue;
      if (entry.type === "sleep") summary.sleepHours += safeValue;
      if (entry.type === "meal") summary.meals += safeValue;
      if (entry.type === "diaper") summary.diapers += safeValue;
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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((entry): TimelineItem => {
      const display =
        trackingDisplay[entry.type as TrackingType] ?? trackingDisplay.mood!;

      const value = entry.value ?? "";
      const unit = entry.unit || display.unit || "";
      const description = entry.note
        ? `${value}${unit ? ` ${unit}` : ""} · ${entry.note}`
        : `${value}${unit ? ` ${unit}` : ""}`;

      const timelineType: TimelineItem["type"] = [
        "milk",
        "sleep",
        "meal",
        "diaper",
        "mood",
      ].includes(entry.type)
        ? (entry.type as TimelineItem["type"])
        : "mood";

      return {
        id: entry.id,
        babyId: entry.babyId as BabyId,
        time: formatTime(entry.createdAt),
        title: display.title,
        description,
        type: timelineType,
      };
    });
}

function safeMetricValue(baby: BabyDashboardProfile, id: MetricId) {
  const value = Number(baby.today?.[id] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export default function DashboardPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("baby-a");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [growthMode, setGrowthMode] = useState<GrowthMode>("weight");
  const trackingStore = useTrackingStore();
  const entries = Array.isArray(trackingStore.entries)
    ? trackingStore.entries
    : [];
  const addEntry = trackingStore.addEntry;
  const clearEntries = trackingStore.clearEntries;
  const isReady = trackingStore.isReady;

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
  const insights = buildAiInsights(selectedBaby, sibling, dailyTargets);
  const weeklyReport = buildWeeklyReport(selectedBaby, growth);
  const vaccine = vaccineReminders[0];

  function handleQuickAdd(input: AddTrackingInput) {
    addEntry({
      ...input,
      title: input.title ?? trackingDisplay[input.type]?.title ?? "Theo dõi",
      value: input.value ?? "",
    });
    setIsQuickAddOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-900 antialiased">
      <div className="mx-auto min-h-screen w-full max-w-md bg-gradient-to-b from-[#fff7f4] via-white to-[#fff8fb] pb-56">
        <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-rose-100 via-pink-100 to-violet-100 px-5 pb-6 pt-5 text-slate-900 shadow-lg shadow-rose-100">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/35" />
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/25" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-rose-500">
                Xin chào mẹ 💕
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Bé Mind AI
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Theo dõi song sinh, nhận gợi ý chăm sóc mỗi ngày
              </p>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-rose-500 backdrop-blur">
              <Bell size={20} />
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-3">
            {dashboardBabies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => setSelectedBabyId(baby.id)}
                className={`rounded-[1.6rem] p-3 text-left transition ${
                  baby.id === selectedBaby.id
                    ? "bg-white text-slate-900 shadow-md shadow-rose-100"
                    : "bg-white/35 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                    {baby.avatar}
                  </div>
                  <div>
                    <p className="font-extrabold">{baby.name}</p>
                    <p className="text-xs text-slate-500">{baby.nickname}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </header>

        <section className="space-y-5 px-5 pt-5">
          <div className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/70">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-rose-400">
                  Tổng quan hôm nay
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                  {isReady ? status.title : "Đang tải dữ liệu hôm nay..."}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {selectedBaby.age} · {selectedBaby.weight}kg ·{" "}
                  {selectedBaby.height}cm
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {metricConfig.map((metric) => (
                <MetricCard
                  key={metric.id}
                  baby={selectedBaby}
                  metric={metric}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-4 shadow-sm shadow-violet-100/60">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-500">
                  AI Insight từ localStorage
                </p>
                <h2 className="text-lg font-extrabold">
                  Gợi ý cho {selectedBaby.name}
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {insights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-500">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              icon={<LineChart size={18} />}
              label="Cân nặng"
              value={`${selectedBaby.weight}kg`}
            />
            <MiniStat
              icon={<Baby size={18} />}
              label="Chiều cao"
              value={`${selectedBaby.height}cm`}
            />
            <MiniStat
              icon={<Brain size={18} />}
              label="Điểm PT"
              value={`${selectedBaby.developmentScore}/100`}
            />
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/70">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Tăng trưởng 30 ngày</h2>
                <p className="text-xs leading-5 text-slate-500">
                  Line chart theo{" "}
                  {growthMode === "weight" ? "cân nặng" : "chiều cao"} của{" "}
                  {selectedBaby.name}
                </p>
              </div>
              <div className="flex rounded-full bg-slate-100 p-1 text-xs font-bold">
                <button
                  onClick={() => setGrowthMode("weight")}
                  className={`rounded-full px-3 py-1.5 ${growthMode === "weight" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Kg
                </button>
                <button
                  onClick={() => setGrowthMode("height")}
                  className={`rounded-full px-3 py-1.5 ${growthMode === "height" ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                >
                  Cm
                </button>
              </div>
            </div>
            <GrowthLineChart data={growth} mode={growthMode} />
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Lịch tiêm sắp tới</h2>
                <p className="text-xs text-slate-500">
                  Nhắc lịch vaccine cho hai bé
                </p>
              </div>
              <Syringe size={20} className="text-rose-400" />
            </div>
            <div className="rounded-3xl bg-rose-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Mũi tiếp theo</p>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    {vaccine.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {vaccine.recommendedAge}. {vaccine.note}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-500">
                  Còn {vaccine.dueInDays} ngày
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100/60">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Báo cáo AI tuần này</h2>
                <p className="text-xs text-slate-500">
                  Tổng hợp theo dữ liệu của {selectedBaby.name}
                </p>
              </div>
              <Brain size={20} className="text-violet-500" />
            </div>
            <p className="mb-3 rounded-2xl bg-violet-50 p-3 text-sm font-medium leading-6 text-slate-700">
              {weeklyReport.summary}
            </p>
            <div className="space-y-3">
              {weeklyReport.rows.map((row) => (
                <ReportRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Theo dõi nhanh</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearEntries}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400"
                >
                  <RefreshCcw size={14} /> Reset
                </button>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex items-center gap-1 text-sm font-bold text-rose-500"
                >
                  Thêm mới <ChevronDown size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setIsQuickAddOpen(true)}
                    className="rounded-[1.7rem] border border-rose-100 bg-white p-4 text-left shadow-sm shadow-rose-100/70"
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}
                    >
                      <Icon size={22} />
                    </div>
                    <p className="font-bold">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Nhật ký hôm nay</h2>
                <p className="text-xs text-slate-500">
                  Dữ liệu được lưu bằng localStorage
                </p>
              </div>
              <CalendarDays size={20} className="text-rose-400" />
            </div>
            <div className="space-y-3">
              {todayTimeline.length > 0 ? (
                todayTimeline.map((item) => (
                  <TimelineRow key={item.id} item={item} />
                ))
              ) : (
                <p className="rounded-2xl bg-rose-50/70 p-4 text-sm leading-6 text-slate-500">
                  Chưa có nhật ký hôm nay cho {selectedBaby.name}. Bấm dấu cộng
                  để thêm cữ sữa, giấc ngủ, ăn dặm hoặc thay tã.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/70">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">So sánh hai bé</h2>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-500">
                Song sinh
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <BabyCompareCard
                baby={dashboardBabies[0]}
                active={selectedBaby.id === dashboardBabies[0].id}
              />
              <div className="text-center text-sm font-extrabold text-rose-300">
                ♡
              </div>
              <BabyCompareCard
                baby={dashboardBabies[1]}
                active={selectedBaby.id === dashboardBabies[1].id}
              />
            </div>
            <div className="mt-4 rounded-2xl bg-rose-50 p-3">
              <div className="flex items-start gap-3">
                <HeartPulse className="mt-0.5 text-rose-400" size={18} />
                <p className="text-sm leading-6 text-slate-700">
                  AI đang so sánh sữa, ngủ, ăn dặm và tăng trưởng từ dữ liệu đã
                  ghi nhận để phát hiện lệch nhịp chăm sóc sớm.
                </p>
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="fixed bottom-24 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-rose-400 text-white shadow-xl shadow-rose-200 transition active:scale-95"
        >
          <Plus size={28} />
        </button>

        {isQuickAddOpen ? (
          <QuickAddSheet
            baby={selectedBaby}
            onAdd={handleQuickAdd}
            onClose={() => setIsQuickAddOpen(false)}
          />
        ) : null}
        <BottomNav />
      </div>
    </main>
  );
}

function MetricCard({
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
    <div className="rounded-3xl bg-slate-50/80 p-4">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${metric.tone}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-sm text-slate-500">{metric.label}</p>
      <p className="text-xl font-extrabold">
        {rawValue}
        {metric.unit}
      </p>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Mục tiêu</span>
          <span>
            {percent}% / {target}
            {metric.unit}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 to-violet-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function GrowthLineChart({
  data,
  mode,
}: {
  data: GrowthPoint[];
  mode: GrowthMode;
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-3xl bg-rose-50/60 p-4 text-sm leading-6 text-slate-500">
        Chưa có dữ liệu tăng trưởng để hiển thị.
      </div>
    );
  }

  const values = data.map((point) => Number(point[mode] ?? 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;
  const height = 150;
  const padding = 24;
  const points = data.map((point, index) => {
    const x =
      padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y =
      height - padding - ((point[mode] - min) / range) * (height - padding * 2);
    return { x, y, label: point.day, value: point[mode] };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="rounded-3xl bg-rose-50/60 p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full overflow-visible"
      >
        <path
          d={`M ${padding} ${height - padding} H ${width - padding}`}
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-rose-400"
        />
        {points.map((point) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke="currentColor"
              strokeWidth="3"
              className="text-rose-400"
            />
            <text
              x={point.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-bold"
            >
              {point.label.slice(0, 5)}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-3">
        <SmallInfo
          label="Đầu kỳ"
          value={`${values[0] ?? 0}${mode === "weight" ? "kg" : "cm"}`}
        />
        <SmallInfo
          label="Hiện tại"
          value={`${values[values.length - 1] ?? 0}${mode === "weight" ? "kg" : "cm"}`}
        />
      </div>
    </div>
  );
}

function QuickAddSheet({
  baby,
  onAdd,
  onClose,
}: {
  baby: BabyDashboardProfile;
  onAdd: (input: AddTrackingInput) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/25 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[2rem] bg-white p-5 pb-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-400">
              Thêm nhanh cho {baby.name}
            </p>
            <h2 className="text-xl font-extrabold">Bạn muốn ghi nhận gì?</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((item) => {
            const Icon = item.icon;
            const type = item.id as TrackingType;
            const value = quickValueByType[type] ?? 1;
            const unit = trackingDisplay[type]?.unit ?? "";
            return (
              <button
                key={item.id}
                onClick={() =>
                  onAdd({ babyId: baby.id, type, value: String(value) })
                }
                className="rounded-3xl border border-rose-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
              >
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}
                >
                  <Icon size={22} />
                </div>
                <p className="font-bold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  +{value}
                  {unit}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const Icon = trackingDisplay[item.type]?.icon ?? Activity;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-rose-50/70 p-3">
      <div className="w-12 text-xs font-bold text-slate-400">{item.time}</div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-bold">{item.title}</p>
        <p className="text-xs text-slate-500">{item.description}</p>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-3 shadow-sm shadow-rose-100/70">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-extrabold">{value}</p>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-violet-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function BabyCompareCard({
  baby,
  active,
}: {
  baby: BabyDashboardProfile;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-4 text-center ${active ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"}`}
    >
      <div className="text-3xl">{baby.avatar}</div>
      <p className="mt-2 font-extrabold">{baby.name}</p>
      <p className="text-xs">{safeMetricValue(baby, "milkMl")}ml sữa</p>
      <p className="mt-1 text-xs font-bold">{baby.developmentScore}/100</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-rose-300"
          style={{ width: `${baby.developmentScore}%` }}
        />
      </div>
    </div>
  );
}
