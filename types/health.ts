import type { BabyId } from "./baby";

export type HealthEventType =
  | "fever"
  | "cough"
  | "medicine"
  | "doctor_visit"
  | "vaccine_reaction";

export interface HealthEvent {
  id: string;
  babyId: BabyId;
  type: HealthEventType;
  title: string;
  value?: string;
  note?: string;
  createdAt: string;
}

export interface HealthSummary {
  feverCount: number;
  medicineCount: number;
  doctorVisitCount: number;
  latestNote: string;
}
