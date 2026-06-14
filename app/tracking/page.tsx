"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";
import {
  addTrackingLog,
  formatLogDate,
  formatLogTime,
  trackingMeta,
  useTrackingStore,
  type TrackingLog,
  type TrackingType,
} from "@/store/trackingStore";

type BabyFilter = "all" | string;
type TypeFilter = "all" | TrackingType;

type QuickForm = {
  type: TrackingType;
  value: string;
  note: string;
  milkKind: string;
  feedingMethod: string;
  feedingStatus: string;
  sleepStart: string;
  sleepEnd: string;
  mealAmount: string;
  mealReaction: string;
  diaperKind: string;
  diaperColor: string;
};

const MAIN_TYPES: TrackingType[] = ["milk", "sleep", "meal", "diaper"];

const initialForm: QuickForm = {
  type: "milk",
  value: "120",
  note: "",
  milkKind: "Sữa mẹ",
  feedingMethod: "Bình",
  feedingStatus: "Bú tốt",
  sleepStart: "",
  sleepEnd: "",
  mealAmount: "",
  mealReaction: "Ăn tốt",
  diaperKind: "Tã ướt",
  diaperColor: "Vàng",
};

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function extractNumber(value: string) {
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

  return extractNumber(value);
}

function toDateKey(date: string) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDateLabel(dateKey: string) {
  const todayKey = toDateKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday.toISOString());

  if (dateKey === todayKey) return "Hôm nay";
  if (dateKey === yesterdayKey) return "Hôm qua";

  return formatLogDate(`${dateKey}T00:00:00`);
}

function getTypeValue(log: TrackingLog) {
  const meta = trackingMeta[log.type as TrackingType];
  if (log.type === "milk" && !log.value.toLowerCase().includes("ml")) {
    return `${log.value}ml`;
  }
  if (log.type === "sleep" && !log.value.toLowerCase().includes("h")) {
    return `${log.value}h`;
  }
  if (log.type === "diaper" && !log.value) return meta.title;
  return log.value || meta.title;
}

function getWeeklySeries(
  logs: TrackingLog[],
  type: TrackingType,
  babyId: BabyFilter,
) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return toDateKey(date.toISOString());
  });

  return days.map((day) => {
    const dayLogs = logs.filter(
      (log) =>
        toDateKey(log.loggedAt) === day &&
        log.type === type &&
        (babyId === "all" || log.babyId === babyId),
    );

    const value = dayLogs.reduce((sum, log) => {
      if (type === "milk") return sum + extractNumber(log.value);
      if (type === "sleep") return sum + sleepToHours(log.value);
      return sum + 1;
    }, 0);

    return {
      day,
      label: new Date(`${day}T00:00:00`).toLocaleDateString("vi-VN", {
        weekday: "short",
      }),
      value: Number(value.toFixed(1)),
    };
  });
}

function buildNote(form: QuickForm) {
  const lines: string[] = [];

  if (form.type === "milk") {
    lines.push(`Loại sữa: ${form.milkKind}`);
    lines.push(`Cách bú: ${form.feedingMethod}`);
    lines.push(`Tình trạng: ${form.feedingStatus}`);
  }

  if (form.type === "sleep") {
    if (form.sleepStart) lines.push(`Bắt đầu: ${form.sleepStart}`);
    if (form.sleepEnd) lines.push(`Kết thúc: ${form.sleepEnd}`);
  }

  if (form.type === "meal") {
    if (form.mealAmount) lines.push(`Số lượng: ${form.mealAmount}`);
    lines.push(`Phản ứng: ${form.mealReaction}`);
  }

  if (form.type === "diaper") {
    lines.push(`Loại tã: ${form.diaperKind}`);
    lines.push(`Màu sắc: ${form.diaperColor}`);
  }

  if (form.note.trim()) lines.push(form.note.trim());

  return lines.join(" · ");
}

function normalizeSubmitValue(form: QuickForm) {
  const raw = form.value.trim();

  if (form.type === "milk") return raw ? `${extractNumber(raw)}ml` : "120ml";
  if (form.type === "sleep") return raw ? `${extractNumber(raw)}h` : "1h";
  if (form.type === "meal") return raw || "Ăn dặm";
  if (form.type === "diaper") return form.diaperKind;

  return raw;
}

export default function TrackingPage() {
  const { babies, activeBabyId, setActiveBabyId } = useBabyStore();
  const { logs, deleteTrackingLog, resetTrackingLogs } = useTrackingStore();

  const [babyFilter, setBabyFilter] = useState<BabyFilter>(
    activeBabyId ?? "all",
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedType, setSelectedType] = useState<TrackingType>("milk");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [form, setForm] = useState<QuickForm>(initialForm);

  const activeBaby =
    babies.find((baby) => baby.id === activeBabyId) ?? babies[0];
  const selectedBaby =
    babies.find((baby) => baby.id === babyFilter) ?? activeBaby;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchBaby = babyFilter === "all" || log.babyId === babyFilter;
      const matchType = typeFilter === "all" || log.type === typeFilter;
      return matchBaby && matchType;
    });
  }, [babyFilter, logs, typeFilter]);

  const todayLogs = useMemo(
    () => filteredLogs.filter((log) => isToday(log.loggedAt)),
    [filteredLogs],
  );

  const summary = useMemo(() => {
    const milk = todayLogs
      .filter((log) => log.type === "milk")
      .reduce((sum, log) => sum + extractNumber(log.value), 0);
    const sleep = todayLogs
      .filter((log) => log.type === "sleep")
      .reduce((sum, log) => sum + sleepToHours(log.value), 0);
    const meal = todayLogs.filter((log) => log.type === "meal").length;
    const diaper = todayLogs.filter((log) => log.type === "diaper").length;

    return {
      milk,
      sleep: Number(sleep.toFixed(1)),
      meal,
      diaper,
      total: todayLogs.length,
    };
  }, [todayLogs]);

  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce<Record<string, TrackingLog[]>>((groups, log) => {
      const key = toDateKey(log.loggedAt);
      return {
        ...groups,
        [key]: [...(groups[key] ?? []), log],
      };
    }, {});
  }, [filteredLogs]);

  const weeklySeries = useMemo(
    () => getWeeklySeries(logs, selectedType, babyFilter),
    [babyFilter, logs, selectedType],
  );

  const maxWeeklyValue = Math.max(...weeklySeries.map((item) => item.value), 1);

  function openQuickAdd(type: TrackingType) {
    setForm({
      ...initialForm,
      type,
      value:
        type === "milk"
          ? "120"
          : type === "sleep"
            ? "1.5"
            : type === "meal"
              ? "Cháo"
              : "",
    });
    setIsQuickAddOpen(true);
  }

  function updateForm(patch: Partial<QuickForm>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleSubmit() {
    const babyId =
      babyFilter === "all"
        ? (selectedBaby?.id ?? activeBaby?.id ?? "baby-a")
        : babyFilter;
    const type = form.type;

    addTrackingLog(type, {
      babyId,
      value: normalizeSubmitValue(form),
      note: buildNote(form),
    });

    setIsQuickAddOpen(false);
  }

  const hasAnyLog = filteredLogs.length > 0;
  const hasTodayLog = todayLogs.length > 0;

  const insightItems = useMemo(() => {
    const items: { tone: "good" | "warn"; text: string }[] = [];

    if (!hasTodayLog) {
      items.push({
        tone: "warn",
        text: "Hôm nay chưa có dữ liệu, mẹ hãy ghi nhận hoạt động đầu tiên để AI bắt đầu theo dõi.",
      });
      return items;
    }

    if (summary.milk >= 720) {
      items.push({ tone: "good", text: "Lượng sữa hôm nay đang khá tốt." });
    } else {
      items.push({
        tone: "warn",
        text: `Còn thiếu khoảng ${Math.max(0, 720 - summary.milk)}ml sữa so với mốc tham chiếu hôm nay.`,
      });
    }

    if (summary.sleep >= 8) {
      items.push({ tone: "good", text: "Giấc ngủ hôm nay ổn định." });
    } else {
      items.push({
        tone: "warn",
        text: `Ngủ hôm nay mới ${summary.sleep}h, nên theo dõi thêm giấc ngủ tiếp theo.`,
      });
    }

    if (babyFilter === "all" && babies.length > 1) {
      const babyWithoutToday = babies.find(
        (baby) => !todayLogs.some((log) => log.babyId === baby.id),
      );
      if (babyWithoutToday) {
        items.push({
          tone: "warn",
          text: `${babyWithoutToday.name} chưa có nhật ký hôm nay.`,
        });
      }
    }

    return items.slice(0, 2);
  }, [babies, babyFilter, hasTodayLog, summary.milk, summary.sleep, todayLogs]);

  return (
    <main className="min-h-screen bg-[#FFF8FA] text-slate-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#FFF8FA] pb-20">
        <section className="rounded-b-[1.8rem] bg-linear-to-br from-rose-50 via-pink-50 to-violet-50 px-5 pb-5 pt-6 shadow-sm shadow-rose-100">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-rose-500">
                Theo dõi hằng ngày
              </p>
              <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-950">
                Nhật ký chăm bé
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Hôm nay có {summary.total} hoạt động được ghi nhận
              </p>
            </div>
            <button
              type="button"
              onClick={() => openQuickAdd("milk")}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl font-semibold text-rose-500 shadow-md shadow-rose-100"
              aria-label="Thêm ghi nhận"
            >
              +
            </button>
          </div>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            <FilterChip
              active={babyFilter === "all"}
              onClick={() => setBabyFilter("all")}
            >
              Cả hai bé
            </FilterChip>
            {babies.map((baby) => (
              <FilterChip
                key={baby.id}
                active={babyFilter === baby.id}
                onClick={() => {
                  setBabyFilter(baby.id);
                  setActiveBabyId(baby.id);
                }}
              >
                {baby.avatar ?? "👶"} {baby.name}
              </FilterChip>
            ))}
          </div>
        </section>

        <div className="space-y-4 px-4 pt-4">
          <section className="rounded-[1.6rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-rose-500">
                  Tổng quan hôm nay
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {babyFilter === "all" ? "Hai bé" : selectedBaby?.name} có{" "}
                  {summary.total} ghi nhận
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {babyFilter === "all"
                    ? "Dữ liệu tổng hợp song sinh"
                    : calculateBabyAge(selectedBaby.birthDate)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetTrackingLogs()}
                className="rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500"
              >
                Demo
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryProgressTile
                icon="🍼"
                label="Sữa"
                value={`${summary.milk}ml`}
                target="720ml"
                percent={Math.min(100, Math.round((summary.milk / 720) * 100))}
              />
              <SummaryProgressTile
                icon="🌙"
                label="Ngủ"
                value={`${summary.sleep}h`}
                target="12h"
                percent={Math.min(100, Math.round((summary.sleep / 12) * 100))}
              />
              <SummaryProgressTile
                icon="🍚"
                label="Ăn dặm"
                value={`${summary.meal}`}
                target="3 bữa"
                percent={Math.min(100, Math.round((summary.meal / 3) * 100))}
              />
              <SummaryProgressTile
                icon="💩"
                label="Tã"
                value={`${summary.diaper}`}
                target="5 lần"
                percent={Math.min(100, Math.round((summary.diaper / 5) * 100))}
              />
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-xl">
                ✨
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-500">
                  AI Insight
                </p>
                <h2 className="text-lg font-bold text-slate-950">
                  Gợi ý theo dữ liệu hôm nay
                </h2>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {insightItems.map((item) => (
                <div
                  key={item.text}
                  className={`rounded-2xl px-3 py-2 text-sm font-medium leading-6 ${
                    item.tone === "good"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.tone === "good" ? "✓" : "⚠"} {item.text}
                </div>
              ))}
            </div>
          </section>

          {!hasTodayLog ? (
            <section className="rounded-[1.6rem] border border-dashed border-violet-200 bg-white p-5 text-center shadow-sm shadow-violet-100">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-50 text-2xl">
                ✨
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Hôm nay chưa có nhật ký
              </h2>
              <p className="mx-auto mt-2 max-w-70 text-sm leading-6 text-slate-500">
                Ghi nhận lần bú, giấc ngủ hoặc thay tã đầu tiên để AI bắt đầu
                phân tích hôm nay.
              </p>
              <button
                type="button"
                onClick={() => openQuickAdd("milk")}
                className="mt-4 rounded-full bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200"
              >
                + Ghi lần đầu
              </button>
            </section>
          ) : (
            <section className="rounded-[1.6rem] border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-violet-500">
                    7 ngày gần đây
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Xu hướng {trackingMeta[selectedType].label}
                  </h2>
                </div>
                <div className="flex rounded-full bg-slate-100 p-1">
                  {MAIN_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold transition ${selectedType === type ? "bg-white text-violet-600 shadow-sm" : "text-slate-400"}`}
                    >
                      {trackingMeta[type].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex h-24 items-end gap-2 rounded-3xl bg-slate-50 px-3 pb-3 pt-4">
                {weeklySeries.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="w-full rounded-full bg-linear-to-t from-violet-500 to-pink-300"
                      style={{
                        height: `${Math.max(6, (item.value / maxWeeklyValue) * 58)}px`,
                      }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-500">
                  Ghi nhận nhanh
                </p>
                <h2 className="text-xl font-bold text-slate-950">
                  Hoạt động phổ biến
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openQuickAdd("milk")}
                className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-2xl font-semibold text-violet-600 shadow-sm"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {MAIN_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => openQuickAdd(type)}
                  className="min-h-20 rounded-3xl border border-slate-100 bg-white p-2 text-center shadow-sm shadow-slate-100 transition active:scale-[0.98]"
                >
                  <span
                    className={`mx-auto grid size-9 place-items-center rounded-2xl ${trackingMeta[type].softBg} text-lg`}
                  >
                    {trackingMeta[type].icon}
                  </span>
                  <span className="mt-2 block text-[11px] font-bold text-slate-800">
                    {trackingMeta[type].title}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="sticky top-0 z-20 -mx-4 mb-3 border-y border-rose-50 bg-[#FFF8FA]/95 px-4 py-3 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-rose-500">
                    Timeline
                  </p>
                  <h2 className="text-xl font-bold text-slate-950">
                    Nhật ký gần đây
                  </h2>
                </div>
                <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
                  <TypeFilterButton
                    active={typeFilter === "all"}
                    onClick={() => setTypeFilter("all")}
                  >
                    Tất cả
                  </TypeFilterButton>
                  {MAIN_TYPES.map((type) => (
                    <TypeFilterButton
                      key={type}
                      active={typeFilter === type}
                      onClick={() => setTypeFilter(type)}
                    >
                      {trackingMeta[type].label}
                    </TypeFilterButton>
                  ))}
                </div>
              </div>
            </div>

            {!hasAnyLog ? (
              <div className="rounded-[1.6rem] border border-dashed border-rose-200 bg-white p-5 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-2xl">
                  🍼
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-950">
                  Chưa có dữ liệu phù hợp
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Đổi bộ lọc hoặc thêm ghi nhận mới.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedLogs).map(([dateKey, items]) => (
                  <div key={dateKey}>
                    <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      {displayDateLabel(dateKey)}
                    </p>
                    <div className="space-y-2.5">
                      {items.map((log) => (
                        <TimelineItem
                          key={log.id}
                          log={log}
                          babyName={
                            babies.find((baby) => baby.id === log.babyId)
                              ?.name ?? "Bé"
                          }
                          onDelete={() => deleteTrackingLog(log.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        {isQuickAddOpen ? (
          <QuickAddSheet
            form={form}
            selectedBabyName={selectedBaby?.name ?? activeBaby?.name ?? "Bé"}
            onClose={() => setIsQuickAddOpen(false)}
            onSubmit={handleSubmit}
            updateForm={updateForm}
          />
        ) : null}

        <BottomNav />
      </div>
    </main>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
          : "bg-white text-slate-500 shadow-sm"
      }`}
    >
      {children}
    </button>
  );
}

function TypeFilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active ? "bg-rose-500 text-white" : "bg-white text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryProgressTile({
  icon,
  label,
  value,
  target,
  percent,
}: {
  icon: string;
  label: string;
  value: string;
  target: string;
  percent: number;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-2xl bg-white text-lg shadow-sm">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-400">{label}</p>
          <p className="text-sm font-bold text-slate-950">{value}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span>Mục tiêu</span>
        <span>{target}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-white">
        <div
          className="h-full rounded-full bg-linear-to-r from-pink-400 to-violet-400"
          style={{ width: `${Math.max(8, percent)}%` }}
        />
      </div>
    </div>
  );
}

function TimelineItem({
  log,
  babyName,
  onDelete,
}: {
  log: TrackingLog;
  babyName: string;
  onDelete: () => void;
}) {
  const meta = trackingMeta[log.type as TrackingType];

  return (
    <article className="rounded-[1.35rem] border border-slate-100 bg-white px-3 py-3 shadow-sm shadow-slate-100">
      <div className="flex items-center gap-3">
        <time className="w-10 shrink-0 text-xs font-bold text-slate-400">
          {formatLogTime(log.loggedAt)}
        </time>
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-2xl ${meta.softBg} text-lg`}
        >
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {log.title}
            </h3>
            <button
              type="button"
              onClick={onDelete}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-50 text-lg font-bold text-slate-300"
              aria-label="Xóa ghi nhận"
            >
              ···
            </button>
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {babyName} · {getTypeValue(log)}
          </p>
          {log.note ? (
            <p className="mt-2 line-clamp-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              {log.note}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function QuickAddSheet({
  form,
  selectedBabyName,
  onClose,
  onSubmit,
  updateForm,
}: {
  form: QuickForm;
  selectedBabyName: string;
  onClose: () => void;
  onSubmit: () => void;
  updateForm: (patch: Partial<QuickForm>) => void;
}) {
  const meta = trackingMeta[form.type];

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-4xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-2xl">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-200" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-rose-500">Thêm nhanh</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {meta.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lưu dữ liệu cho {selectedBabyName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-2xl leading-none text-slate-500"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="mt-5 max-h-[58vh] overflow-y-auto pr-1">
          <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div
                className={`grid size-12 place-items-center rounded-2xl ${meta.softBg} text-xl`}
              >
                {meta.icon}
              </div>
              <div>
                <p className="font-bold text-slate-950">{meta.title}</p>
                <p className="text-sm text-slate-500">
                  {meta.unitHint ?? "Ghi nhận nhanh"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {form.type === "milk" ? (
              <MilkFields form={form} updateForm={updateForm} />
            ) : null}
            {form.type === "sleep" ? (
              <SleepFields form={form} updateForm={updateForm} />
            ) : null}
            {form.type === "meal" ? (
              <MealFields form={form} updateForm={updateForm} />
            ) : null}
            {form.type === "diaper" ? (
              <DiaperFields form={form} updateForm={updateForm} />
            ) : null}

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Ghi chú</span>
              <textarea
                value={form.note}
                onChange={(event) => updateForm({ note: event.target.value })}
                rows={3}
                placeholder="VD: Bé bú tốt, ngủ sâu, phản ứng với món ăn..."
                className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300 focus:border-rose-200"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[0.85fr_1.15fr] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-4 text-sm font-bold text-slate-600"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl bg-rose-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-rose-200"
          >
            + Lưu ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function MilkFields({
  form,
  updateForm,
}: {
  form: QuickForm;
  updateForm: (patch: Partial<QuickForm>) => void;
}) {
  return (
    <>
      <SegmentedField
        label="Loại sữa"
        value={form.milkKind}
        options={["Sữa mẹ", "Sữa công thức", "Kết hợp"]}
        onChange={(milkKind) => updateForm({ milkKind })}
      />
      <InputField
        label="Lượng sữa"
        value={form.value}
        suffix="ml"
        inputMode="decimal"
        onChange={(value) => updateForm({ value })}
      />
      <div className="grid grid-cols-4 gap-2">
        {["90", "120", "150", "180"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateForm({ value })}
            className="rounded-2xl bg-blue-50 py-3 text-sm font-bold text-blue-600"
          >
            {value}ml
          </button>
        ))}
      </div>
      <SegmentedField
        label="Cách bú"
        value={form.feedingMethod}
        options={["Bình", "Trực tiếp", "Kết hợp"]}
        onChange={(feedingMethod) => updateForm({ feedingMethod })}
      />
      <SegmentedField
        label="Tình trạng"
        value={form.feedingStatus}
        options={["Bú tốt", "Bú ít", "Ngủ khi bú", "Nôn trớ"]}
        onChange={(feedingStatus) => updateForm({ feedingStatus })}
      />
    </>
  );
}

function SleepFields({
  form,
  updateForm,
}: {
  form: QuickForm;
  updateForm: (patch: Partial<QuickForm>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Bắt đầu"
          value={form.sleepStart}
          type="time"
          onChange={(sleepStart) => updateForm({ sleepStart })}
        />
        <InputField
          label="Kết thúc"
          value={form.sleepEnd}
          type="time"
          onChange={(sleepEnd) => updateForm({ sleepEnd })}
        />
      </div>
      <InputField
        label="Số giờ ngủ"
        value={form.value}
        suffix="h"
        inputMode="decimal"
        onChange={(value) => updateForm({ value })}
      />
      <div className="grid grid-cols-4 gap-2">
        {["0.5", "1", "1.5", "2"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => updateForm({ value })}
            className="rounded-2xl bg-purple-50 py-3 text-sm font-bold text-purple-600"
          >
            {value}h
          </button>
        ))}
      </div>
    </>
  );
}

function MealFields({
  form,
  updateForm,
}: {
  form: QuickForm;
  updateForm: (patch: Partial<QuickForm>) => void;
}) {
  return (
    <>
      <InputField
        label="Tên món"
        value={form.value}
        placeholder="VD: Cháo cá hồi"
        onChange={(value) => updateForm({ value })}
      />
      <InputField
        label="Số lượng"
        value={form.mealAmount}
        placeholder="VD: 1/2 bát, 120g"
        onChange={(mealAmount) => updateForm({ mealAmount })}
      />
      <SegmentedField
        label="Phản ứng"
        value={form.mealReaction}
        options={["Ăn tốt", "Ăn ít", "Từ chối", "Dị ứng"]}
        onChange={(mealReaction) => updateForm({ mealReaction })}
      />
    </>
  );
}

function DiaperFields({
  form,
  updateForm,
}: {
  form: QuickForm;
  updateForm: (patch: Partial<QuickForm>) => void;
}) {
  return (
    <>
      <SegmentedField
        label="Loại tã"
        value={form.diaperKind}
        options={["Tã ướt", "Tã bẩn", "Cả hai"]}
        onChange={(diaperKind) => updateForm({ diaperKind })}
      />
      <SegmentedField
        label="Màu sắc"
        value={form.diaperColor}
        options={["Vàng", "Nâu", "Xanh", "Khác"]}
        onChange={(diaperColor) => updateForm({ diaperColor })}
      />
    </>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-2 flex items-center rounded-2xl border border-slate-100 bg-white px-4 focus-within:border-rose-200">
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-12 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
        />
        {suffix ? (
          <span className="text-sm font-bold text-slate-400">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

function SegmentedField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-2 text-xs font-bold transition ${
              value === option
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
