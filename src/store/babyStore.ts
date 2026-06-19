import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Baby, BabyId } from "@/types/baby";

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

export function normalizeBabyProfile(profile: Partial<Baby> | undefined): Baby {
  const fallbackId = isBabyId(profile?.id) ? profile.id : "mochi";
  const fallback = babies.find((baby) => baby.id === fallbackId) ?? babies[0];

  return {
    id: fallback.id,
    name: profile?.name ?? fallback.name,
    nickname: profile?.nickname ?? fallback.nickname,
    gender: profile?.gender ?? fallback.gender,
    birthDate: profile?.birthDate ?? fallback.birthDate,
    avatarEmoji: profile?.avatarEmoji ?? fallback.avatarEmoji,
    avatarUrl: profile?.avatarUrl ?? "",
    allergies: profile?.allergies ?? "",
    medicalNotes: profile?.medicalNotes ?? "",
    likes: profile?.likes ?? "",
    dislikes: profile?.dislikes ?? "",
    sleepHabits: profile?.sleepHabits ?? "",
    eatingHabits: profile?.eatingHabits ?? "",
    careNotes: profile?.careNotes ?? "",
    doctor: profile?.doctor ?? "",
    hospital: profile?.hospital ?? fallback.hospital,
    insurance: profile?.insurance ?? "",
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

type BabyStore = {
  babyProfiles: Baby[];
  selectedBabyId: BabyId;
  setSelectedBabyId: (id: BabyId) => void;
  updateBabyProfile: (id: BabyId, data: Partial<Baby>) => void;
  resetBabyProfiles: () => void;
};

export const useBabyStore = create<BabyStore>()(
  persist(
    (set) => ({
      babyProfiles: babies,
      selectedBabyId: "mochi",

      setSelectedBabyId: (id) => set({ selectedBabyId: id }),

      updateBabyProfile: (id, data) =>
        set((state) => ({
          babyProfiles: normalizeBabyProfiles(
            state.babyProfiles.map((baby) =>
              baby.id === id ? { ...baby, ...data } : baby,
            ),
          ),
        })),

      resetBabyProfiles: () =>
        set({
          babyProfiles: babies,
          selectedBabyId: "mochi",
        }),
    }),
    {
      name: "mind-ai-baby-profiles",
      version: 11,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        babyProfiles: state.babyProfiles.map((baby) => ({
          ...baby,
          avatarUrl: "",
        })),
        selectedBabyId: state.selectedBabyId,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<BabyStore> | undefined;

        return {
          babyProfiles: normalizeBabyProfiles(state?.babyProfiles),
          selectedBabyId: isBabyId(state?.selectedBabyId)
            ? state.selectedBabyId
            : "mochi",
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
        };
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
