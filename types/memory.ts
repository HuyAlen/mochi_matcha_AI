import type { BabyId } from "@/types/baby";

export type MemoryBabyScope = BabyId | "both";

export type MemoryType =
  | "first_moment"
  | "milestone"
  | "photo"
  | "note"
  | "health"
  | "family";

export interface MemoryEntry {
  id: string;
  babyId: MemoryBabyScope;
  type: MemoryType;
  title: string;
  note: string;
  date: string;
  photoUrl: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MemoryDraft = {
  babyId: MemoryBabyScope;
  type: MemoryType;
  title: string;
  note: string;
  date: string;
  photoUrl: string;
  isFavorite: boolean;
};

export type MemoryFilterBaby = "all" | MemoryBabyScope;

export type MemoryFilterType = "all" | MemoryType;
