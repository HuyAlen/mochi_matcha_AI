import type { BabyId } from "./baby";

export type GrowthMetricType = "weight" | "height" | "head";

export interface GrowthRecord {
  id: string;
  babyId: BabyId;
  date: string;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm: number;
}

export interface GrowthSummary {
  babyId: BabyId;
  latestWeightKg: number;
  latestHeightCm: number;
  latestHeadCircumferenceCm: number;
  weightChangeKg: number;
  heightChangeCm: number;
  estimatedWeightPercentile: number;
  estimatedHeightPercentile: number;
  trend: "slow" | "normal" | "fast";
}

export interface TwinGrowthComparison {
  weightDiffKg: number;
  heightDiffCm: number;
  headDiffCm: number;
  insight: string;
}
