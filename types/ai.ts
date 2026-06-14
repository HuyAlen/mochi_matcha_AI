import type { BabyProfile } from "@/types/baby";
import type { TrackingLog } from "@/store/trackingStore";

export type AICoachMetric = {
  label: string;
  value: string;
  status: "good" | "warning" | "danger" | "neutral";
  description: string;
};

export type AICoachInsight = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

export type AICoachPlanItem = {
  title: string;
  description: string;
  duration: string;
};

export type TwinComparison = {
  title: string;
  description: string;
  status: "balanced" | "watch";
};

export type AICoachReport = {
  baby: BabyProfile;
  generatedAt: string;
  score: number;
  summary: string;
  metrics: AICoachMetric[];
  insights: AICoachInsight[];
  plan: AICoachPlanItem[];
  twinComparison?: TwinComparison;
};

export type AICoachInput = {
  activeBaby: BabyProfile;
  allBabies: BabyProfile[];
  logs: TrackingLog[];
};
