"use client";

import { create } from "zustand";
import { growthRecords as demoGrowthRecords } from "@/src/data/growth/growthRecords";
import type { BabyId } from "@/types/baby";
import type { GrowthRecord } from "@/types/growth";

interface GrowthState {
  records: GrowthRecord[];
  addGrowthRecord: (record: Omit<GrowthRecord, "id">) => void;
  getRecordsByBaby: (babyId: BabyId) => GrowthRecord[];
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  records: demoGrowthRecords,

  addGrowthRecord: (record) =>
    set((state) => ({
      records: [
        ...state.records,
        {
          ...record,
          id: crypto.randomUUID(),
        },
      ],
    })),

  getRecordsByBaby: (babyId) =>
    get()
      .records.filter((record) => record.babyId === babyId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
}));
