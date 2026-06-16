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
