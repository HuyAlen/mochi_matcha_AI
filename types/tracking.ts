import type { BabyId, TimelineItem } from "@/types/dashboard";

export type TrackingType = "milk" | "sleep" | "meal" | "diaper" | "mood";

export type TrackingEntry = {
  id: string;
  babyId: BabyId;
  type: TrackingType;
  value: number;
  unit: "ml" | "h" | "bữa" | "lần" | "điểm";
  note?: string;
  createdAt: string;
};

export type TodayTrackingMetrics = {
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
};

export type AddTrackingInput = {
  babyId: BabyId;
  type: TrackingType;
  value?: number;
  note?: string;
};

export type TrackingTimelineItem = TimelineItem & {
  createdAt: string;
};

export type TrackingLog = {
  id: string;
  babyId: string;
  type: TrackingType;
  title?: string;
  value: string | number;
  note?: string;
  createdAt: string;
  loggedAt: string;
};
