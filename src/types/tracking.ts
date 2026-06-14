import type { BabyId, TimelineItem } from "@/types/dashboard";

export type TrackingType =
  | "milk"
  | "sleep"
  | "meal"
  | "diaper"
  | "mood"
  | "weight"
  | "medicine"
  | "temperature"
  | "growth"
  | "note";

export type TrackingLog = {
  id: string;
  babyId: string;
  type: TrackingType;
  title: string;
  value: string;
  unit?: string;
  note?: string;
  createdAt: string;
  loggedAt: string;
  updatedAt?: string;
};
export type TrackingEntry = TrackingLog;

export type TodayTrackingMetrics = {
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
};

export type AddTrackingInput = {
  babyId: BabyId;
  type: TrackingType;
  title?: string;
  value?: string;
  unit?: string;
  note?: string;
};

export type TrackingTimelineItem = TimelineItem & {
  createdAt: string;
};
