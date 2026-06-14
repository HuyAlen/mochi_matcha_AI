export type VaccineDoseStatus = "upcoming" | "due" | "overdue" | "completed";

export type VaccineScheduleItem = {
  id: string;
  name: string;
  disease: string;
  recommendedAgeMonths: number;
  dose: string;
  description: string;
};

export type BabyVaccineRecord = {
  id: string;
  babyId: string;
  vaccineId: string;
  completedAt: string;
  note?: string;
};

export type VaccineStatusItem = VaccineScheduleItem & {
  status: VaccineDoseStatus;
  daysUntilDue: number;
  completedAt?: string;
  note?: string;
};

export type TwinVaccineSummary = {
  completedA: number;
  completedB: number;
  total: number;
  message: string;
  status: "balanced" | "watch";
};
