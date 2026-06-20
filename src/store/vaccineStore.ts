"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { babies } from "@/src/store/babyStore";
import {
  completedVaccineRecords,
  vaccineDoses,
  vaccineReactions,
} from "@/src/data/health/vaccineSchedule";
import {
  generateVaccineScheduleForBabies,
  resolveVaccineStatus,
  type BabyVaccineProfile,
} from "@/src/services/health/vaccineEngine";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord, VaccineReaction } from "@/types/vaccine";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildInitialRecords(sourceBabies: BabyVaccineProfile[] = babies) {
  return generateVaccineScheduleForBabies(
    sourceBabies,
    vaccineDoses,
    completedVaccineRecords,
  );
}

function mergeGeneratedRecords(
  sourceBabies: BabyVaccineProfile[],
  currentRecords: BabyVaccineRecord[],
) {
  return generateVaccineScheduleForBabies(
    sourceBabies,
    vaccineDoses,
    currentRecords,
  );
}

interface VaccineState {
  records: BabyVaccineRecord[];
  reactions: VaccineReaction[];
  refreshGeneratedSchedule: (sourceBabies?: BabyVaccineProfile[]) => void;
  markCompleted: (recordId: string, completedDate?: string) => void;
  addReaction: (reaction: Omit<VaccineReaction, "id" | "createdAt">) => void;
  replaceRecords: (records: BabyVaccineRecord[]) => void;
  replaceReactions: (reactions: VaccineReaction[]) => void;
  getRecordsByBaby: (babyId: BabyId) => BabyVaccineRecord[];
  getReactionsByBaby: (babyId: BabyId) => VaccineReaction[];
}

export const useVaccineStore = create<VaccineState>()(
  persist(
    (set, get) => ({
      records: buildInitialRecords(),
      reactions: vaccineReactions,

      refreshGeneratedSchedule: (sourceBabies = babies) =>
        set((state) => ({
          records: mergeGeneratedRecords(sourceBabies, state.records),
        })),

      markCompleted: (recordId, completedDate) =>
        set((state) => ({
          records: state.records.map((record) => {
            if (record.id !== recordId) return record;

            const nextCompletedDate = completedDate ?? todayIsoDate();

            return {
              ...record,
              status: "completed",
              completedDate: nextCompletedDate,
            };
          }),
        })),

      addReaction: (reaction) =>
        set((state) => ({
          reactions: [
            {
              ...reaction,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.reactions,
          ],
        })),

      replaceRecords: (records) =>
        set({
          records,
        }),

      replaceReactions: (reactions) =>
        set({
          reactions,
        }),

      getRecordsByBaby: (babyId) =>
        get()
          .records.filter((record) => record.babyId === babyId)
          .map((record) => ({
            ...record,
            status: resolveVaccineStatus(
              record.scheduledDate,
              record.completedDate,
            ),
          })),

      getReactionsByBaby: (babyId) =>
        get().reactions.filter((reaction) => reaction.babyId === babyId),
    }),
    {
      name: "mind-ai-vaccine-store",
      version: 1,
      partialize: (state) => ({
        records: state.records,
        reactions: state.reactions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.refreshGeneratedSchedule();
      },
    },
  ),
);
