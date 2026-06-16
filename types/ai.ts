import type { BabyId } from "./baby";

export type AIInsightCategory =
  | "nutrition"
  | "sleep"
  | "growth"
  | "tracking"
  | "twin_compare"
  | "reminder";

export type AIInsightSeverity = "info" | "positive" | "warning";

export interface AIInsight {
  id: string;
  category: AIInsightCategory;
  severity: AIInsightSeverity;
  babyId?: BabyId;
  title: string;
  description: string;
  recommendation: string;
  createdAt: string;
}

export interface AIQuickQuestion {
  id: string;
  label: string;
  prompt: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
}

export interface AICoachMetric {
  label: string;
  value: string;
  status?: "good" | "warning" | "danger";
}

export interface AICoachInsight {
  title: string;
  description: string;
}

export interface AICoachPlanItem {
  title: string;
  description: string;
}

export interface AICoachInput {
  babyId: string;
  ageMonths: number;

  sleepHours?: number;
  milkMl?: number;
  meals?: number;

  weightKg?: number;
  heightCm?: number;
}

export interface TwinComparison {
  title: string;
  description: string;
  mochiValue?: string | number;
  matchaValue?: string | number;
  status?: "balanced" | "watch" | "alert";
}

export interface AICoachReport {
  summary: string;
  insights: AICoachInsight[];
  metrics: AICoachMetric[];
  plan: AICoachPlanItem[];
  twinComparison?: TwinComparison;
}
