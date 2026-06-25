export type ActivityType =
  | "milk"
  | "sleep"
  | "meal"
  | "diaper"
  | "medicine"
  | "health"
  | "vaccine"
  | "custom";

export type ActivitySource = "manual" | "quick_add" | "reminder" | "sync";

export interface TrackingEntry {
  id: string;
  babyId: string;
  type: ActivityType;
  startedAt: string;
  endedAt?: string;
  amount?: number;
  unit?: string;
  note?: string;
  source?: ActivitySource;
  createdAt: string;
  updatedAt?: string;
}
