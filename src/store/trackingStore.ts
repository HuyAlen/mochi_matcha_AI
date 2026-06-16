"use client";

import { create } from "zustand";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

interface TrackingState {
  entries: TrackingEntry[];
  addEntry: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
  getTodayEntries: (babyId?: BabyId) => TrackingEntry[];
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

const demoEntries: TrackingEntry[] = [
  {
    id: "demo-1",
    babyId: "mochi",
    type: "milk",
    value: 520,
    unit: "ml",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    babyId: "matcha",
    type: "milk",
    value: 480,
    unit: "ml",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    babyId: "mochi",
    type: "sleep",
    value: 11.5,
    unit: "giờ",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    babyId: "matcha",
    type: "sleep",
    value: 12.7,
    unit: "giờ",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-5",
    babyId: "mochi",
    type: "meal",
    value: 3,
    unit: "bữa",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-6",
    babyId: "matcha",
    type: "meal",
    value: 2,
    unit: "bữa",
    createdAt: new Date().toISOString(),
  },
];

export const useTrackingStore = create<TrackingState>((set, get) => ({
  entries: demoEntries,

  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...state.entries,
      ],
    })),

  getTodayEntries: (babyId) => {
    return get().entries.filter((entry) => {
      const sameBaby = babyId ? entry.babyId === babyId : true;
      return sameBaby && isToday(entry.createdAt);
    });
  },
}));

export function getTrackingLabel(type: TrackingType) {
  const labels: Record<TrackingType, string> = {
    milk: "Sữa",
    sleep: "Ngủ",
    meal: "Ăn dặm",
    diaper: "Tã",
    temperature: "Nhiệt độ",
    medicine: "Thuốc",
  };

  return labels[type];
}
