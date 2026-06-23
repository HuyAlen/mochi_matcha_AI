import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Baby, BabyId } from "@/types/baby";
import { queuePushItems } from "@/lib/supabase/sync";

export const babies: Baby[] = [
  {
    id: "mochi",
    name: "Mochi",
    nickname: "Bé Mochi",
    gender: "female",
    birthDate: "2025-10-16",
    avatarEmoji: "🎀",
    avatarUrl: "",
    allergies: "",
    medicalNotes: "",
    likes: "",
    dislikes: "",
    sleepHabits: "",
    eatingHabits: "",
    careNotes: "",
    doctor: "",
    hospital: "Bệnh viện Đại học Y Dược TP.HCM",
    insurance: "",
  },
  {
    id: "matcha",
    name: "Matcha",
    nickname: "Bé Matcha",
    gender: "female",
    birthDate: "2025-10-16",
    avatarEmoji: "🌸",
    avatarUrl: "",
    allergies: "",
    medicalNotes: "",
    likes: "",
    dislikes: "",
    sleepHabits: "",
    eatingHabits: "",
    careNotes: "",
    doctor: "",
    hospital: "Bệnh viện Đại học Y Dược TP.HCM",
    insurance: "",
  },
];

function isBabyId(value: unknown): value is BabyId {
  return value === "mochi" || value === "matcha";
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function normalizeBabyProfile(profile: Partial<Baby> | undefined): Baby {
  const fallbackId = isBabyId(profile?.id) ? profile.id : "mochi";
  const fallback = babies.find((baby) => baby.id === fallbackId) ?? babies[0];

  return {
    id: fallback.id,
    name: cleanText(profile?.name, fallback.name),
    nickname: cleanText(profile?.nickname, fallback.nickname),
    gender: profile?.gender ?? fallback.gender,
    birthDate: cleanText(profile?.birthDate, fallback.birthDate),
    avatarEmoji: cleanText(profile?.avatarEmoji, fallback.avatarEmoji),
    avatarUrl: cleanText(profile?.avatarUrl, ""),
    allergies: cleanText(profile?.allergies),
    medicalNotes: cleanText(profile?.medicalNotes),
    likes: cleanText(profile?.likes),
    dislikes: cleanText(profile?.dislikes),
    sleepHabits: cleanText(profile?.sleepHabits),
    eatingHabits: cleanText(profile?.eatingHabits),
    careNotes: cleanText(profile?.careNotes),
    doctor: cleanText(profile?.doctor),
    hospital: cleanText(profile?.hospital, fallback.hospital),
    insurance: cleanText(profile?.insurance),
  };
}

export function normalizeBabyProfiles(
  profiles: Partial<Baby>[] | undefined,
): Baby[] {
  return babies.map((fallbackBaby) => {
    const matched = profiles?.find((baby) => baby?.id === fallbackBaby.id);

    return normalizeBabyProfile({
      ...fallbackBaby,
      ...matched,
    });
  });
}

function canRunSupabaseSync() {
  return typeof window !== "undefined" && navigator.onLine;
}

function syncBabyProfiles(profiles: Baby[]) {
  if (!canRunSupabaseSync()) return;

  queuePushItems("baby_profiles", profiles);
}

type BabyStore = {
  babyProfiles: Baby[];
  selectedBabyId: BabyId;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSelectedBabyId: (id: BabyId) => void;
  updateBabyProfile: (id: BabyId, data: Partial<Baby>) => void;
  resetBabyProfiles: () => void;
  replaceBabyProfiles: (profiles: Baby[]) => void;
};

export const useBabyStore = create<BabyStore>()(
  persist(
    (set) => ({
      babyProfiles: babies,
      selectedBabyId: "mochi",
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setSelectedBabyId: (id) => set({ selectedBabyId: id }),

      updateBabyProfile: (id, data) =>
        set((state) => {
          const nextProfiles = normalizeBabyProfiles(
            state.babyProfiles.map((baby) =>
              baby.id === id ? { ...baby, ...data, id } : baby,
            ),
          );

          syncBabyProfiles(nextProfiles);

          return { babyProfiles: nextProfiles };
        }),

      resetBabyProfiles: () => {
        set({
          babyProfiles: babies,
          selectedBabyId: "mochi",
        });
        syncBabyProfiles(babies);
      },

      replaceBabyProfiles: (profiles) => {
        const nextProfiles = normalizeBabyProfiles(profiles);

        set({ babyProfiles: nextProfiles });
        syncBabyProfiles(nextProfiles);
      },
    }),
    {
      name: "mind-ai-baby-profiles",
      version: 12,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        babyProfiles: state.babyProfiles,
        selectedBabyId: state.selectedBabyId,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<BabyStore> | undefined;

        return {
          babyProfiles: normalizeBabyProfiles(state?.babyProfiles),
          selectedBabyId: isBabyId(state?.selectedBabyId)
            ? state.selectedBabyId
            : "mochi",
          hasHydrated: false,
        };
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<BabyStore> | undefined;

        return {
          ...currentState,
          ...state,
          babyProfiles: normalizeBabyProfiles(state?.babyProfiles),
          selectedBabyId: isBabyId(state?.selectedBabyId)
            ? state.selectedBabyId
            : currentState.selectedBabyId,
          hasHydrated: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getBabyById(
  id: BabyId,
  source: Partial<Baby>[] = babies,
): Baby {
  const matched = source.find((baby) => baby?.id === id);

  return normalizeBabyProfile({
    ...(babies.find((baby) => baby.id === id) ?? babies[0]),
    ...matched,
  });
}
