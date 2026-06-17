import type { BabyId } from "./baby";

export type TrackingType =
  | "milk"
  | "sleep"
  | "meal"
  | "diaper"
  | "temperature"
  | "medicine"
  | "mood";

export interface TrackingEntry {
  id: string;
  babyId: BabyId;
  type: TrackingType;
  value: number;
  unit: string;
  note?: string;
  createdAt: string;
}

export interface TrackingTodaySummary {
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
  moodCount: number;
  medicineCount: number;
  temperatureLatest?: number;
}
