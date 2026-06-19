import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  MemoryDraft,
  MemoryEntry,
  MemoryFilterBaby,
  MemoryFilterType,
} from "@/types/memory";

function createId() {
  return `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const defaultMemoryDraft: MemoryDraft = {
  babyId: "both",
  type: "first_moment",
  title: "",
  note: "",
  date: todayISO(),
  photoUrl: "",
  isFavorite: false,
};

const seedMemories: MemoryEntry[] = [
  {
    id: "memory-seed-1",
    babyId: "both",
    type: "first_moment",
    title: "Ngày đầu tiên về nhà",
    note: "Mochi & Matcha bắt đầu hành trình lớn lên cùng ba mẹ.",
    date: "2025-10-20",
    photoUrl: "",
    isFavorite: true,
    createdAt: "2025-10-20T08:00:00.000Z",
    updatedAt: "2025-10-20T08:00:00.000Z",
  },
  {
    id: "memory-seed-2",
    babyId: "mochi",
    type: "milestone",
    title: "Mochi biết cười thật tươi",
    note: "Một khoảnh khắc nhỏ nhưng rất đáng nhớ.",
    date: "2026-02-12",
    photoUrl: "",
    isFavorite: false,
    createdAt: "2026-02-12T08:00:00.000Z",
    updatedAt: "2026-02-12T08:00:00.000Z",
  },
  {
    id: "memory-seed-3",
    babyId: "matcha",
    type: "note",
    title: "Matcha thích nghe nhạc ru",
    note: "Bé dịu lại nhanh hơn khi nghe nhạc nhẹ trước giờ ngủ.",
    date: "2026-03-01",
    photoUrl: "",
    isFavorite: false,
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-01T08:00:00.000Z",
  },
];

type MemoryStore = {
  memories: MemoryEntry[];
  selectedBabyFilter: MemoryFilterBaby;
  selectedTypeFilter: MemoryFilterType;
  setBabyFilter: (filter: MemoryFilterBaby) => void;
  setTypeFilter: (filter: MemoryFilterType) => void;
  addMemory: (draft: MemoryDraft) => void;
  updateMemory: (id: string, data: Partial<MemoryEntry>) => void;
  deleteMemory: (id: string) => void;
  toggleFavorite: (id: string) => void;
  resetMemories: () => void;
};

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      memories: seedMemories,
      selectedBabyFilter: "all",
      selectedTypeFilter: "all",

      setBabyFilter: (filter) => set({ selectedBabyFilter: filter }),

      setTypeFilter: (filter) => set({ selectedTypeFilter: filter }),

      addMemory: (draft) =>
        set((state) => {
          const now = new Date().toISOString();
          const memory: MemoryEntry = {
            id: createId(),
            babyId: draft.babyId,
            type: draft.type,
            title: draft.title.trim(),
            note: draft.note.trim(),
            date: draft.date || todayISO(),
            photoUrl: draft.photoUrl,
            isFavorite: draft.isFavorite,
            createdAt: now,
            updatedAt: now,
          };

          return {
            memories: [memory, ...state.memories],
          };
        }),

      updateMemory: (id, data) =>
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id
              ? {
                  ...memory,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : memory,
          ),
        })),

      deleteMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((memory) => memory.id !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === id
              ? {
                  ...memory,
                  isFavorite: !memory.isFavorite,
                  updatedAt: new Date().toISOString(),
                }
              : memory,
          ),
        })),

      resetMemories: () =>
        set({
          memories: seedMemories,
          selectedBabyFilter: "all",
          selectedTypeFilter: "all",
        }),
    }),
    {
      name: "mind-ai-memory-book",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        memories: state.memories,
        selectedBabyFilter: state.selectedBabyFilter,
        selectedTypeFilter: state.selectedTypeFilter,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<MemoryStore> | undefined;

        return {
          memories:
            Array.isArray(state?.memories) && state.memories.length > 0
              ? state.memories
              : seedMemories,
          selectedBabyFilter: state?.selectedBabyFilter ?? "all",
          selectedTypeFilter: state?.selectedTypeFilter ?? "all",
        };
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<MemoryStore> | undefined;

        return {
          ...currentState,
          ...state,
          memories:
            Array.isArray(state?.memories) && state.memories.length > 0
              ? state.memories
              : currentState.memories,
          selectedBabyFilter:
            state?.selectedBabyFilter ?? currentState.selectedBabyFilter,
          selectedTypeFilter:
            state?.selectedTypeFilter ?? currentState.selectedTypeFilter,
        };
      },
    },
  ),
);
