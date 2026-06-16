import type { BabyId } from "./baby";

export type VaccineStatus = "completed" | "upcoming" | "overdue";
export type VaccineReactionSeverity = "mild" | "moderate" | "severe";

export interface VaccineDose {
  id: string;
  name: string;
  disease: string;
  recommendedAgeMonths: number;
  doseLabel: string;
  description: string;
}

export interface BabyVaccineRecord {
  id: string;
  babyId: BabyId;
  vaccineId: string;
  scheduledDate: string;
  completedDate?: string;
  status: VaccineStatus;
  location?: string;
  note?: string;
}

export interface VaccineReaction {
  id: string;
  babyId: BabyId;
  vaccineRecordId: string;
  symptom: string;
  severity: VaccineReactionSeverity;
  temperature?: number;
  note?: string;
  createdAt: string;
}

export interface VaccineSummary {
  completedCount: number;
  upcomingCount: number;
  overdueCount: number;
  nextVaccineTitle: string;
  nextVaccineDate?: string;
}
