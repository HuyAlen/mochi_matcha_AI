import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

export type SmartReminderPriority = "high" | "medium" | "low";
export type SmartReminderKind = "milk" | "sleep" | "meal" | "diaper";
export type SmartReminderStatus = "empty" | "active" | "stable";

export interface SmartReminder {
  id: string;
  babyId: BabyId;
  babyName: string;
  babyEmoji: string;
  kind: SmartReminderKind;
  priority: SmartReminderPriority;
  icon: string;
  title: string;
  message: string;
  actionLabel: string;
  quickType: TrackingType;
  elapsedMinutes?: number;
}

export interface SmartReminderResult {
  status: SmartReminderStatus;
  reminders: SmartReminder[];
  hasTodayData: boolean;
  todayEntryCount: number;
}

type BabyLite = {
  id: BabyId;
  name?: string;
  nickname?: string;
  avatarEmoji?: string;
};

const MILK_THRESHOLD_MINUTES = 210;
const SLEEP_THRESHOLD_MINUTES = 180;
const DIAPER_THRESHOLD_MINUTES = 240;

const MAX_STALE_MINUTES = 24 * 60;
const MAX_RENDERED_REMINDERS = 3;

function getBabyName(baby: BabyLite) {
  return baby.nickname?.trim() || baby.name?.trim() || "Bé";
}

function getBabyEmoji(baby: BabyLite) {
  return baby.avatarEmoji || (baby.id === "mochi" ? "🎀" : "🌸");
}

function minutesSince(dateValue?: string, now = new Date()) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
}

function isSameLocalDay(dateValue: string | undefined, now: Date) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatElapsed(minutes: number | null) {
  if (minutes === null) return "chưa có dữ liệu";

  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

function getLastEntry(
  entries: TrackingEntry[],
  babyId: BabyId,
  type: TrackingType,
) {
  return entries
    .filter((entry) => entry.babyId === babyId && entry.type === type)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
}

function getMealWindow(now: Date) {
  const hour = now.getHours();

  if (hour >= 6 && hour < 10) {
    return {
      label: "bữa sáng",
      mealName: "sáng",
      startHour: 6,
      endHour: 10,
    };
  }

  if (hour >= 10 && hour < 14) {
    return {
      label: "bữa trưa",
      mealName: "trưa",
      startHour: 10,
      endHour: 14,
    };
  }

  if (hour >= 14 && hour < 18) {
    return {
      label: "bữa chiều",
      mealName: "chiều",
      startHour: 14,
      endHour: 18,
    };
  }

  if (hour >= 18 && hour < 21) {
    return {
      label: "bữa tối",
      mealName: "tối",
      startHour: 18,
      endHour: 21,
    };
  }

  return null;
}

function hasMealInWindow(entries: TrackingEntry[], babyId: BabyId, now: Date) {
  const mealWindow = getMealWindow(now);

  if (!mealWindow) return true;

  const start = new Date(now);
  start.setHours(mealWindow.startHour, 0, 0, 0);

  const end = new Date(now);
  end.setHours(mealWindow.endHour, 0, 0, 0);

  return entries.some((entry) => {
    if (entry.babyId !== babyId || entry.type !== "meal") return false;

    const createdAt = new Date(entry.createdAt);
    return createdAt >= start && createdAt < end;
  });
}

function getTodayEntries(entries: TrackingEntry[], now: Date) {
  return entries.filter((entry) => isSameLocalDay(entry.createdAt, now));
}

function hasTodayTrackingForBaby(
  entries: TrackingEntry[],
  babyId: BabyId,
  now: Date,
) {
  return entries.some(
    (entry) => entry.babyId === babyId && isSameLocalDay(entry.createdAt, now),
  );
}

function getPriority(
  minutes: number,
  threshold: number,
): SmartReminderPriority {
  if (minutes >= threshold + 90) return "high";
  if (minutes >= threshold) return "medium";
  return "low";
}

function buildSmartReminders({
  entries,
  babies,
  now,
}: {
  entries: TrackingEntry[];
  babies: BabyLite[];
  now: Date;
}) {
  const reminders: SmartReminder[] = [];
  const mealWindow = getMealWindow(now);

  babies.forEach((baby) => {
    const babyName = getBabyName(baby);
    const babyEmoji = getBabyEmoji(baby);
    const hasTodayData = hasTodayTrackingForBaby(entries, baby.id, now);

    const lastMilk = getLastEntry(entries, baby.id, "milk");
    const milkElapsed = minutesSince(lastMilk?.createdAt, now);

    if (
      milkElapsed !== null &&
      milkElapsed <= MAX_STALE_MINUTES &&
      milkElapsed >= MILK_THRESHOLD_MINUTES
    ) {
      reminders.push({
        id: `milk-${baby.id}`,
        babyId: baby.id,
        babyName,
        babyEmoji,
        kind: "milk",
        priority: getPriority(milkElapsed, MILK_THRESHOLD_MINUTES),
        icon: "🍼",
        title: "Đến giờ uống sữa",
        message: `Lần cuối cách đây ${formatElapsed(milkElapsed)}.`,
        actionLabel: "Ghi sữa",
        quickType: "milk",
        elapsedMinutes: milkElapsed,
      });
    }

    const lastSleep = getLastEntry(entries, baby.id, "sleep");
    const sleepElapsed = minutesSince(lastSleep?.createdAt, now);

    if (
      sleepElapsed !== null &&
      sleepElapsed <= MAX_STALE_MINUTES &&
      sleepElapsed >= SLEEP_THRESHOLD_MINUTES
    ) {
      reminders.push({
        id: `sleep-${baby.id}`,
        babyId: baby.id,
        babyName,
        babyEmoji,
        kind: "sleep",
        priority: getPriority(sleepElapsed, SLEEP_THRESHOLD_MINUTES),
        icon: "😴",
        title: "Có thể cần ngủ",
        message: `Lần ngủ gần nhất cách đây ${formatElapsed(sleepElapsed)}.`,
        actionLabel: "Ghi ngủ",
        quickType: "sleep",
        elapsedMinutes: sleepElapsed,
      });
    }

    const lastDiaper = getLastEntry(entries, baby.id, "diaper");
    const diaperElapsed = minutesSince(lastDiaper?.createdAt, now);

    if (
      diaperElapsed !== null &&
      diaperElapsed <= MAX_STALE_MINUTES &&
      diaperElapsed >= DIAPER_THRESHOLD_MINUTES
    ) {
      reminders.push({
        id: `diaper-${baby.id}`,
        babyId: baby.id,
        babyName,
        babyEmoji,
        kind: "diaper",
        priority: getPriority(diaperElapsed, DIAPER_THRESHOLD_MINUTES),
        icon: "🧷",
        title: "Kiểm tra tã",
        message: `Lần thay tã gần nhất cách đây ${formatElapsed(diaperElapsed)}.`,
        actionLabel: "Ghi tã",
        quickType: "diaper",
        elapsedMinutes: diaperElapsed,
      });
    }

    if (mealWindow && hasTodayData && !hasMealInWindow(entries, baby.id, now)) {
      reminders.push({
        id: `meal-${baby.id}-${mealWindow.mealName}`,
        babyId: baby.id,
        babyName,
        babyEmoji,
        kind: "meal",
        priority: "medium",
        icon: "🥣",
        title: `Chưa có ${mealWindow.label}`,
        message: `Có thể ghi nhận ${mealWindow.label} nếu bé đã ăn.`,
        actionLabel: "Ghi ăn",
        quickType: "meal",
      });
    }
  });

  const priorityWeight: Record<SmartReminderPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return reminders.sort((a, b) => {
    const priorityDiff =
      priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return (b.elapsedMinutes ?? 0) - (a.elapsedMinutes ?? 0);
  });
}

export function getSmartReminderResult({
  entries,
  babies,
  now = new Date(),
  limit = MAX_RENDERED_REMINDERS,
}: {
  entries: TrackingEntry[];
  babies: BabyLite[];
  now?: Date;
  limit?: number;
}): SmartReminderResult {
  const todayEntries = getTodayEntries(entries, now);
  const reminders = buildSmartReminders({ entries, babies, now }).slice(
    0,
    limit,
  );
  const hasTodayData = todayEntries.length > 0;

  return {
    status: !hasTodayData
      ? "empty"
      : reminders.length > 0
        ? "active"
        : "stable",
    reminders,
    hasTodayData,
    todayEntryCount: todayEntries.length,
  };
}

export function generateSmartReminders({
  entries,
  babies,
  now = new Date(),
  limit = MAX_RENDERED_REMINDERS,
}: {
  entries: TrackingEntry[];
  babies: BabyLite[];
  now?: Date;
  limit?: number;
}) {
  return getSmartReminderResult({ entries, babies, now, limit }).reminders;
}

export function getReminderTone(priority: SmartReminderPriority) {
  if (priority === "high") {
    return {
      card: "bg-rose-50 text-rose-600 ring-rose-100",
      dot: "bg-rose-500",
      label: "Quan trọng",
    };
  }

  if (priority === "medium") {
    return {
      card: "bg-amber-50 text-amber-600 ring-amber-100",
      dot: "bg-amber-400",
      label: "Nên kiểm tra",
    };
  }

  return {
    card: "bg-slate-50 text-slate-500 ring-slate-100",
    dot: "bg-slate-400",
    label: "Gợi ý",
  };
}

export function summarizeReminderPriorities(reminders: SmartReminder[]) {
  const highCount = reminders.filter((item) => item.priority === "high").length;
  const mediumCount = reminders.filter(
    (item) => item.priority === "medium",
  ).length;

  if (highCount > 0) return `${highCount} việc quan trọng`;
  if (mediumCount > 0) return `${mediumCount} việc cần kiểm tra`;
  return `${reminders.length} gợi ý`;
}
