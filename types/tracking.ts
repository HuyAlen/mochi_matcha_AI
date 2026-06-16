import type { BabyId } from "./baby";

export type TrackingType =
  | "milk"
  | "sleep"
  | "meal"
  | "diaper"
  | "temperature"
  | "medicine";

export interface TrackingEntry {
  id: string;
  babyId: BabyId;
  type: TrackingType;
  value: number;
  unit: string;
  note?: string;
  createdAt: string;
}
