"use client";

import { create } from "zustand";

import { useBabyStore } from "@/features/babies";
import { useTrackingStore } from "@/features/tracking/store/trackingStore";
import { useVaccineStore } from "@/features/vaccines";
import { pullItems, pushItems } from "@/lib/supabase/sync";

import type { Baby } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import type { BabyVaccineRecord, VaccineReaction } from "@/types/vaccine";

type SyncState = {
  syncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  syncNow: () => Promise<void>;
};

export const useSyncStore = create<SyncState>((set) => ({
  syncing: false,
  lastSyncedAt: null,
  error: null,

  syncNow: async () => {
    try {
      set({ syncing: true, error: null });

      const babyStore = useBabyStore.getState();
      const trackingStore = useTrackingStore.getState();
      const vaccineStore = useVaccineStore.getState();

      await pushItems("baby_profiles", babyStore.babyProfiles);
      await pushItems("tracking_entries", trackingStore.entries);
      await pushItems("vaccine_records", vaccineStore.records);
      await pushItems("vaccine_reactions", vaccineStore.reactions);

      const babyProfiles = await pullItems<Baby>("baby_profiles");
      const trackingEntries =
        await pullItems<TrackingEntry>("tracking_entries");
      const vaccineRecords =
        await pullItems<BabyVaccineRecord>("vaccine_records");
      const vaccineReactions =
        await pullItems<VaccineReaction>("vaccine_reactions");

      babyStore.replaceBabyProfiles(babyProfiles);
      trackingStore.replaceEntries(trackingEntries);
      vaccineStore.replaceRecords(vaccineRecords);
      vaccineStore.replaceReactions(vaccineReactions);

      set({
        syncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (error) {
      set({
        syncing: false,
        error:
          error instanceof Error ? error.message : "Đồng bộ dữ liệu thất bại.",
      });
    }
  },
}));
