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

  /**
   * Milk tracking pro
   * durationMinutes: bé bú trong bao lâu
   * remindAfterMinutes: nhắc bú lại sau bao lâu
   * nextFeedAt: thời điểm dự kiến cữ bú tiếp theo
   */
  durationMinutes?: number;
  remindAfterMinutes?: number;
  nextFeedAt?: string;
}

export interface TrackingTodaySummary {
  milkMl: number;
  milkDurationMinutes: number;
  nextFeedAt?: string;
  sleepHours: number;
  meals: number;
  diapers: number;
  moodCount: number;
  medicineCount: number;
  temperatureLatest?: number;
}
