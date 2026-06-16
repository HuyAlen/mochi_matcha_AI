"use client";

import { create } from "zustand";
import {
  babyVaccineRecords,
  vaccineReactions,
} from "@/src/data/health/vaccineSchedule";
import type { BabyId } from "@/types/baby";
import type { BabyVaccineRecord, VaccineReaction } from "@/types/vaccine";

interface VaccineState {
  records: BabyVaccineRecord[];
  reactions: VaccineReaction[];
  markCompleted: (recordId: string, completedDate?: string) => void;
  addReaction: (reaction: Omit<VaccineReaction, "id" | "createdAt">) => void;
  getRecordsByBaby: (babyId: BabyId) => BabyVaccineRecord[];
  getReactionsByBaby: (babyId: BabyId) => VaccineReaction[];
}

export const useVaccineStore = create<VaccineState>((set, get) => ({
  records: babyVaccineRecords,
  reactions: vaccineReactions,

  markCompleted: (recordId, completedDate) =>
    set((state) => ({
      records: state.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: "completed",
              completedDate:
                completedDate ?? new Date().toISOString().slice(0, 10),
            }
          : record,
      ),
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

  getRecordsByBaby: (babyId) =>
    get().records.filter((record) => record.babyId === babyId),

  getReactionsByBaby: (babyId) =>
    get().reactions.filter((reaction) => reaction.babyId === babyId),
}));
