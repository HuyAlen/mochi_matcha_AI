export type GrowthMetric = "weight" | "height";

export type GrowthRecord = {
  id: string;
  babyId: string;
  date: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
};

export type WHOReferencePoint = {
  ageMonths: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
};

export type GrowthAssessmentStatus = "low" | "normal" | "high" | "watch";

export type GrowthAssessment = {
  metric: GrowthMetric;
  value: number;
  ageMonths: number;
  percentileLabel: string;
  status: GrowthAssessmentStatus;
  message: string;
};

export type TwinGrowthComparison = {
  weightDiffKg: number;
  heightDiffCm: number;
  message: string;
  status: "balanced" | "watch";
};
