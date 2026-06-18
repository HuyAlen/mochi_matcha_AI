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
  getTodayEntries: (babyId?: BabyId) => TrackingEntry[];
  getTodaySummary: (babyId?: BabyId) => TrackingTodaySummary;
}

function isToday(date: string) {
  const input = new Date(date);
  const now = new Date();

  return (
    input.getDate() === now.getDate() &&
    input.getMonth() === now.getMonth() &&
    input.getFullYear() === now.getFullYear()
  );
}

function createEntryId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `tracking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const now = new Date().toISOString();

const demoEntries: TrackingEntry[] = [
  {
    id: "demo-mochi-milk",
    babyId: "mochi",
    type: "milk",
    value: 120,
    unit: "ml",
    note: "Bé bú tốt",
    createdAt: now,
  },
  {
    id: "demo-mochi-sleep",
    babyId: "mochi",
    type: "sleep",
    value: 1.5,
    unit: "giờ",
    note: "Ngủ trưa",
    createdAt: now,
  },
  {
    id: "demo-matcha-milk",
    babyId: "matcha",
    type: "milk",
    value: 90,
    unit: "ml",
    note: "Bú bình",
    createdAt: now,
  },
  {
    id: "demo-matcha-diaper",
    babyId: "matcha",
    type: "diaper",
    value: 1,
    unit: "lần",
    note: "Tã ướt",
    createdAt: now,
  },
];

function summarize(entries: TrackingEntry[]): TrackingTodaySummary {
  return entries.reduce<TrackingTodaySummary>(
    (summary, entry) => {
      const value = Number(entry.value || 0);

      if (entry.type === "milk") summary.milkMl += value;
      if (entry.type === "sleep") summary.sleepHours += value;
      if (entry.type === "meal") summary.meals += 1;
      if (entry.type === "diaper") summary.diapers += value;
      if (entry.type === "mood") summary.moodCount += 1;
      if (entry.type === "medicine") summary.medicineCount += 1;
      if (entry.type === "temperature") summary.temperatureLatest = value;

      return summary;
    },
    {
      milkMl: 0,
      sleepHours: 0,
      meals: 0,
      diapers: 0,
      moodCount: 0,
      medicineCount: 0,
      temperatureLatest: undefined,
    },
  );
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

      getTodayEntries: (babyId) => {
        return get()
          .entries.filter((entry) => {
            const sameBaby = babyId ? entry.babyId === babyId : true;
            return sameBaby && isToday(entry.createdAt);
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      },

      getTodaySummary: (babyId) => summarize(get().getTodayEntries(babyId)),
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
