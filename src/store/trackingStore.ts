"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { TrackingLog, TrackingType } from "@/types/tracking";

export type { TrackingLog, TrackingType } from "@/types/tracking";

export type TrackingSummary = {
  milkTodayMl: number;
  sleepTodayHours: number;
  mealTodayCount: number;
  diaperTodayCount: number;
  moodTodayCount: number;
  medicineTodayCount: number;
  temperatureLastValue: string;
  weightLastValue: string;
  milkCount: number;
  sleepCount: number;
  mealCount: number;
  diaperCount: number;
  totalLogs: number;
};

export const trackingMeta: Record<
  TrackingType,
  {
    label: string;
    title: string;
    icon: string;
    emoji: string;
    color: string;
    softBg: string;
    unit?: string;
    unitHint?: string;
  }
> = {
  milk: {
    label: "Sữa",
    title: "Bú sữa",
    icon: "🍼",
    emoji: "🍼",
    color: "text-blue-600",
    softBg: "bg-blue-50",
    unit: "ml",
    unitHint: "VD: 120ml",
  },
  meal: {
    label: "Ăn dặm",
    title: "Ăn dặm",
    icon: "🍚",
    emoji: "🍚",
    color: "text-orange-600",
    softBg: "bg-orange-50",
    unitHint: "VD: Cháo yến mạch",
  },
  sleep: {
    label: "Ngủ",
    title: "Giấc ngủ",
    icon: "😴",
    emoji: "😴",
    color: "text-purple-600",
    softBg: "bg-purple-50",
    unitHint: "VD: 1.5h hoặc 1h 20m",
  },
  diaper: {
    label: "Tã",
    title: "Thay tã",
    icon: "💩",
    emoji: "💩",
    color: "text-amber-600",
    softBg: "bg-amber-50",
    unitHint: "VD: Tã ướt",
  },
  mood: {
    label: "Tâm trạng",
    title: "Tâm trạng",
    icon: "😊",
    emoji: "😊",
    color: "text-pink-600",
    softBg: "bg-pink-50",
    unitHint: "VD: Vui vẻ",
  },
  weight: {
    label: "Cân nặng",
    title: "Cân nặng",
    icon: "⚖️",
    emoji: "⚖️",
    color: "text-emerald-600",
    softBg: "bg-emerald-50",
    unit: "kg",
    unitHint: "VD: 7.8kg",
  },
  medicine: {
    label: "Thuốc",
    title: "Uống thuốc",
    icon: "💊",
    emoji: "💊",
    color: "text-rose-600",
    softBg: "bg-rose-50",
    unitHint: "VD: Vitamin D",
  },
  temperature: {
    label: "Nhiệt độ",
    title: "Nhiệt độ",
    icon: "🌡️",
    emoji: "🌡️",
    color: "text-red-600",
    softBg: "bg-red-50",
    unit: "°C",
    unitHint: "VD: 36.8°C",
  },
  growth: {
    label: "Tăng trưởng",
    title: "Tăng trưởng",
    icon: "📈",
    emoji: "📈",
    color: "text-emerald-600",
    softBg: "bg-emerald-50",
    unitHint: "VD: 7.8kg / 68cm",
  },
  note: {
    label: "Ghi chú",
    title: "Ghi chú",
    icon: "📝",
    emoji: "📝",
    color: "text-slate-600",
    softBg: "bg-slate-50",
    unitHint: "VD: Bé bú tốt, ngủ ngoan",
  },
};

const TRACKING_KEY = "be-mind-ai-tracking-logs";

function makeTime(minutesAgo = 0) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

function createLog(
  input: Omit<TrackingLog, "id" | "createdAt" | "loggedAt"> & {
    minutesAgo?: number;
  },
): TrackingLog {
  const time = makeTime(input.minutesAgo ?? 0);
  const { minutesAgo, ...log } = input;
  return {
    ...log,
    id: `tracking-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: time,
    loggedAt: time,
  };
}

const demoTracking: TrackingLog[] = [
  createLog({
    babyId: "baby-a",
    type: "milk",
    title: "Bú sữa",
    value: "120ml",
    note: "Bé bú tốt",
    minutesAgo: 20,
  }),
  createLog({
    babyId: "baby-a",
    type: "sleep",
    title: "Ngủ sáng",
    value: "1h 20m",
    minutesAgo: 90,
  }),
  createLog({
    babyId: "baby-a",
    type: "meal",
    title: "Ăn dặm",
    value: "Cháo yến mạch bí đỏ",
    minutesAgo: 150,
  }),
  createLog({
    babyId: "baby-b",
    type: "milk",
    title: "Bú sữa",
    value: "100ml",
    note: "Bé bú hơi ít",
    minutesAgo: 45,
  }),
  createLog({
    babyId: "baby-b",
    type: "diaper",
    title: "Thay tã",
    value: "Tã ướt",
    minutesAgo: 120,
  }),
];

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function normalizeLog(log: Partial<TrackingLog>): TrackingLog {
  const type = (log.type ?? "milk") as TrackingType;
  const fallbackTime =
    log.loggedAt ?? log.createdAt ?? new Date().toISOString();
  return {
    id:
      log.id ?? `tracking-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    babyId: log.babyId ?? "baby-a",
    type,
    title: log.title ?? trackingMeta[type].title,
    value: log.value ?? "",
    note: log.note,
    createdAt: log.createdAt ?? fallbackTime,
    loggedAt: log.loggedAt ?? fallbackTime,
  };
}

function readLogs(): TrackingLog[] {
  if (typeof window === "undefined") return demoTracking;
  const raw = window.localStorage.getItem(TRACKING_KEY);
  if (!raw) {
    window.localStorage.setItem(TRACKING_KEY, JSON.stringify(demoTracking));
    return demoTracking;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<TrackingLog>[];
    return parsed
      .map(normalizeLog)
      .sort(
        (a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
      );
  } catch {
    window.localStorage.setItem(TRACKING_KEY, JSON.stringify(demoTracking));
    return demoTracking;
  }
}

function saveLogs(logs: TrackingLog[]) {
  window.localStorage.setItem(TRACKING_KEY, JSON.stringify(logs));
  emitChange();
}

function getSnapshot() {
  return JSON.stringify(readLogs());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

export function formatLogTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatLogDate(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function extractNumber(value: string) {
  const match = value.replace(",", ".").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function sleepValueToHours(value: string) {
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

export function getTrackingLogs(): TrackingLog[] {
  return readLogs();
}

export function getLogsByBabyId(babyId: string) {
  return readLogs().filter((log) => log.babyId === babyId);
}

export function getTodayLogsByBabyId(babyId: string) {
  const today = new Date().toDateString();
  return readLogs().filter(
    (log) =>
      log.babyId === babyId && new Date(log.loggedAt).toDateString() === today,
  );
}

export function getTrackingSummary(babyId: string): TrackingSummary {
  const todayLogs = getTodayLogsByBabyId(babyId);
  const milkLogs = todayLogs.filter((log) => log.type === "milk");
  const sleepLogs = todayLogs.filter((log) => log.type === "sleep");
  const mealLogs = todayLogs.filter((log) => log.type === "meal");
  const diaperLogs = todayLogs.filter((log) => log.type === "diaper");
  const moodLogs = todayLogs.filter((log) => log.type === "mood");
  const medicineLogs = todayLogs.filter((log) => log.type === "medicine");
  const temperatureLog = todayLogs.find((log) => log.type === "temperature");
  const weightLog = readLogs().find(
    (log) => log.babyId === babyId && log.type === "weight",
  );

  return {
    milkTodayMl: milkLogs.reduce(
      (sum, log) => sum + extractNumber(log.value),
      0,
    ),
    sleepTodayHours: Number(
      sleepLogs
        .reduce((sum, log) => sum + sleepValueToHours(log.value), 0)
        .toFixed(1),
    ),
    mealTodayCount: mealLogs.length,
    diaperTodayCount: diaperLogs.length,
    moodTodayCount: moodLogs.length,
    medicineTodayCount: medicineLogs.length,
    temperatureLastValue: temperatureLog?.value ?? "--",
    weightLastValue: weightLog?.value ?? "--",
    milkCount: milkLogs.length,
    sleepCount: sleepLogs.length,
    mealCount: mealLogs.length,
    diaperCount: diaperLogs.length,
    totalLogs: todayLogs.length,
  };
}

export function getTwinInsight(babyAId = "baby-a", babyBId = "baby-b") {
  const a = getTrackingSummary(babyAId);
  const b = getTrackingSummary(babyBId);
  const milkDiff = a.milkTodayMl - b.milkTodayMl;
  const sleepDiff = Number((a.sleepTodayHours - b.sleepTodayHours).toFixed(1));

  if (Math.abs(milkDiff) >= 80) {
    return milkDiff > 0
      ? `Bé B đang uống ít hơn Bé A khoảng ${Math.abs(milkDiff)}ml hôm nay.`
      : `Bé A đang uống ít hơn Bé B khoảng ${Math.abs(milkDiff)}ml hôm nay.`;
  }

  if (Math.abs(sleepDiff) >= 1) {
    return sleepDiff > 0
      ? `Bé B đang ngủ ít hơn Bé A khoảng ${Math.abs(sleepDiff)} giờ hôm nay.`
      : `Bé A đang ngủ ít hơn Bé B khoảng ${Math.abs(sleepDiff)} giờ hôm nay.`;
  }

  return "Hai bé đang có nhịp sinh hoạt khá cân bằng trong hôm nay.";
}

export function addTrackingLog(
  typeOrLog:
    | string
    | TrackingType
    | Omit<TrackingLog, "id" | "createdAt" | "loggedAt">,
  form?: { babyId?: string; value: string; note?: string },
) {
  const now = new Date().toISOString();
  const type = typeOrLog as TrackingType;
  const baseLog =
    typeof typeOrLog === "string"
      ? {
          babyId: form?.babyId ?? "baby-a",
          type,
          title: trackingMeta[type]?.title ?? "Hoạt động",
          value: form?.value ?? "",
          note: form?.note,
        }
      : typeOrLog;

  const newLog: TrackingLog = {
    ...baseLog,
    id: `tracking-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    loggedAt: now,
  };

  const nextLogs = [newLog, ...readLogs()];
  saveLogs(nextLogs);
  return nextLogs;
}

export function deleteTrackingLog(id: string) {
  const nextLogs = readLogs().filter((log) => log.id !== id);
  saveLogs(nextLogs);
  return nextLogs;
}

export function resetTrackingLogs() {
  saveLogs(demoTracking);
  return demoTracking;
}

export function useTrackingStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return useMemo(() => {
    const logs = JSON.parse(snapshot) as TrackingLog[];
    return {
      logs,
      addTrackingLog,
      deleteTrackingLog,
      resetTrackingLogs,
      getLogsByBabyId,
      getTodayLogsByBabyId,
      getTrackingSummary,
      getTwinInsight,
	entries: logs,
	addEntry: addTrackingLog,
	clearEntries: clearTrackingLogs,
	isReady: true,
    };
  }, [snapshot]);
}

function clearTrackingLogs() {
  if (typeof window === "undefined") return [];
  window.localStorage.setItem(TRACKING_KEY, JSON.stringify([]));
  emitChange();
  return [];
}
