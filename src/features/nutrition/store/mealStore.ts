"use client";

import { create } from "zustand";
import type { BabyId } from "@/types/baby";
import type { MealEntry } from "@/types/meal";

interface MealState {
  entries: MealEntry[];
  addMealEntry: (entry: Omit<MealEntry, "id" | "createdAt">) => void;
  getTodayMealEntries: (babyId?: BabyId) => MealEntry[];
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

const demoMealEntries: MealEntry[] = [
  {
    id: "meal-demo-1",
    babyId: "mochi",
    recipeId: "oat-banana",
    eatenPercent: 85,
    reaction: "liked",
    createdAt: new Date().toISOString(),
  },
  {
    id: "meal-demo-2",
    babyId: "matcha",
    recipeId: "pumpkin-chicken",
    eatenPercent: 60,
    reaction: "normal",
    createdAt: new Date().toISOString(),
  },
];

export const useMealStore = create<MealState>((set, get) => ({
  entries: demoMealEntries,

  addMealEntry: (entry) =>
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

  getTodayMealEntries: (babyId) =>
    get().entries.filter((entry) => {
      const sameBaby = babyId ? entry.babyId === babyId : true;
      return sameBaby && isToday(entry.createdAt);
    }),
}));
