"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { growthRecords as demoGrowthRecords } from "@/src/data/growth/growthRecords";
import type { BabyId } from "@/types/baby";
import type { GrowthRecord } from "@/types/growth";

type GrowthRecordInput = Omit<GrowthRecord, "id">;

interface GrowthState {
  records: GrowthRecord[];
  addGrowthRecord: (record: GrowthRecordInput) => void;
  updateGrowthRecord: (id: string, data: Partial<GrowthRecordInput>) => void;
  deleteGrowthRecord: (id: string) => void;
  getRecordsByBaby: (babyId: BabyId) => GrowthRecord[];
  resetGrowthRecords: () => void;
}

function createGrowthId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `growth-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortGrowthRecords(records: GrowthRecord[]) {
  return [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      records: demoGrowthRecords,

      addGrowthRecord: (record) =>
        set((state) => ({
          records: sortGrowthRecords([
            ...state.records,
            {
              ...record,
              id: createGrowthId(),
            },
          ]),
        })),

      updateGrowthRecord: (id, data) =>
        set((state) => ({
          records: sortGrowthRecords(
            state.records.map((record) =>
              record.id === id
                ? {
                    ...record,
                    ...data,
                  }
                : record,
            ),
          ),
        })),

      deleteGrowthRecord: (id) =>
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        })),

      getRecordsByBaby: (babyId) =>
        sortGrowthRecords(
          get().records.filter((record) => record.babyId === babyId),
        ),

      resetGrowthRecords: () =>
        set({
          records: demoGrowthRecords,
        }),
    }),
    {
      name: "mind-ai-growth-records",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        records: state.records,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<GrowthState> | undefined;

        return {
          ...currentState,
          records:
            Array.isArray(state?.records) && state.records.length > 0
              ? sortGrowthRecords(state.records)
              : currentState.records,
        };
      },
    },
  ),
);
