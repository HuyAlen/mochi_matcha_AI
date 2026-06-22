"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BabyId } from "@/types/baby";
import type {
  TrackingEntry,
  TrackingTodaySummary,
  TrackingType,
} from "@/types/tracking";

export type TrackingLog = TrackingEntry;

interface TrackingState {
  entries: TrackingEntry[];
  addEntry: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
  updateEntry: (
    entryId: string,
    payload: Partial<Omit<TrackingEntry, "id">>,
  ) => void;
  duplicateEntry: (entryId: string) => void;
  deleteEntry: (entryId: string) => void;
  clearDemoEntries: () => void;
  replaceEntries: (entries: TrackingEntry[]) => void;
  getTodayEntries: (babyId?: BabyId) => TrackingEntry[];
  getTodaySummary: (babyId?: BabyId) => TrackingTodaySummary;
  getEntriesByDate: (date: Date, babyId?: BabyId) => TrackingEntry[];
  getEntriesInRange: (
    startDate: Date,
    endDate: Date,
    babyId?: BabyId,
  ) => TrackingEntry[];
}

function isSameDay(date: string | Date, targetDate: Date) {
  const input = new Date(date);

  return (
    input.getDate() === targetDate.getDate() &&
    input.getMonth() === targetDate.getMonth() &&
    input.getFullYear() === targetDate.getFullYear()
  );
}

function isToday(date: string) {
  return isSameDay(date, new Date());
}

function createEntryId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `tracking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const DEMO_CREATED_AT = "2026-06-20T15:00:00.000Z";

const demoEntries: TrackingEntry[] = [
  {
    id: "demo-mochi-milk",
    babyId: "mochi",
    type: "milk",
    value: 120,
    unit: "ml",
    note: "Bé bú tốt",
    durationMinutes: 12,
    remindAfterMinutes: 180,
    nextFeedAt: "2026-06-20T18:00:00.000Z",
    createdAt: DEMO_CREATED_AT,
  },
  {
    id: "demo-mochi-sleep",
    babyId: "mochi",
    type: "sleep",
    value: 1.5,
    unit: "giờ",
    note: "Ngủ trưa",
    createdAt: DEMO_CREATED_AT,
  },
  {
    id: "demo-matcha-milk",
    babyId: "matcha",
    type: "milk",
    value: 90,
    unit: "ml",
    note: "Bú bình",
    durationMinutes: 10,
    remindAfterMinutes: 180,
    nextFeedAt: "2026-06-20T18:00:00.000Z",
    createdAt: DEMO_CREATED_AT,
  },
  {
    id: "demo-matcha-diaper",
    babyId: "matcha",
    type: "diaper",
    value: 1,
    unit: "lần",
    note: "Tã ướt",
    createdAt: DEMO_CREATED_AT,
  },
];

function sortNewestFirst(entries: TrackingEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function getNearestFutureFeed(entries: TrackingEntry[]) {
  const now = Date.now();

  return entries
    .filter((entry) => entry.type === "milk" && entry.nextFeedAt)
    .map((entry) => entry.nextFeedAt!)
    .filter((nextFeedAt) => new Date(nextFeedAt).getTime() > now)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
}

function summarize(entries: TrackingEntry[]): TrackingTodaySummary {
  const summary = entries.reduce<TrackingTodaySummary>(
    (current, entry) => {
      const value = Number(entry.value || 0);

      if (entry.type === "milk") {
        current.milkMl += value;
        current.milkDurationMinutes += Number(entry.durationMinutes || 0);
      }

      if (entry.type === "sleep") current.sleepHours += value;
      if (entry.type === "meal") current.meals += 1;
      if (entry.type === "diaper") current.diapers += value;
      if (entry.type === "mood") current.moodCount += 1;
      if (entry.type === "medicine") current.medicineCount += 1;
      if (entry.type === "temperature") current.temperatureLatest = value;

      return current;
    },
    {
      milkMl: 0,
      milkDurationMinutes: 0,
      nextFeedAt: undefined,
      sleepHours: 0,
      meals: 0,
      diapers: 0,
      moodCount: 0,
      medicineCount: 0,
      temperatureLatest: undefined,
    },
  );

  summary.nextFeedAt = getNearestFutureFeed(entries);

  return summary;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      entries: demoEntries,

      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: createEntryId(),
              createdAt: new Date().toISOString(),
            },
            ...state.entries,
          ],
        })),

      updateEntry: (entryId, payload) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId ? { ...entry, ...payload } : entry,
          ),
        })),

      duplicateEntry: (entryId) =>
        set((state) => {
          const source = state.entries.find((entry) => entry.id === entryId);
          if (!source) return state;

          return {
            entries: [
              {
                ...source,
                id: createEntryId(),
                createdAt: new Date().toISOString(),
                note: source.note ? `${source.note} · Sao chép` : "Sao chép",
              },
              ...state.entries,
            ],
          };
        }),

      deleteEntry: (entryId) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== entryId),
        })),

      clearDemoEntries: () =>
        set((state) => ({
          entries: state.entries.filter(
            (entry) => !entry.id.startsWith("demo-"),
          ),
        })),

      replaceEntries: (entries) =>
        set({
          entries: sortNewestFirst(entries),
        }),

      getTodayEntries: (babyId) => {
        return sortNewestFirst(
          get().entries.filter((entry) => {
            const sameBaby = babyId ? entry.babyId === babyId : true;
            return sameBaby && isToday(entry.createdAt);
          }),
        );
      },

      getTodaySummary: (babyId) => summarize(get().getTodayEntries(babyId)),

      getEntriesByDate: (date, babyId) => {
        return sortNewestFirst(
          get().entries.filter((entry) => {
            const sameBaby = babyId ? entry.babyId === babyId : true;
            return sameBaby && isSameDay(entry.createdAt, date);
          }),
        );
      },

      getEntriesInRange: (startDate, endDate, babyId) => {
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        return sortNewestFirst(
          get().entries.filter((entry) => {
            const entryTime = new Date(entry.createdAt).getTime();
            const sameBaby = babyId ? entry.babyId === babyId : true;
            return sameBaby && entryTime >= startTime && entryTime <= endTime;
          }),
        );
      },
    }),
    {
      name: "mind-ai-tracking-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);

export function getTrackingLabel(type: TrackingType) {
  const labels: Record<TrackingType, string> = {
    milk: "Sữa",
    sleep: "Ngủ",
    meal: "Ăn dặm",
    diaper: "Tã",
    temperature: "Nhiệt độ",
    medicine: "Thuốc",
    mood: "Tâm trạng",
  };

  return labels[type];
}

export function getTrackingIcon(type: TrackingType) {
  const icons: Record<TrackingType, string> = {
    milk: "🍼",
    sleep: "😴",
    meal: "🥣",
    diaper: "🧷",
    temperature: "🌡️",
    medicine: "💊",
    mood: "😊",
  };

  return icons[type];
}

export function summarizeTrackingEntries(entries: TrackingEntry[]) {
  return summarize(entries);
}
