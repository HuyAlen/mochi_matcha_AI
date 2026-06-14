import type { LucideIcon } from "lucide-react";

export type BabyId = "baby-a" | "baby-b";

export type BabyDashboardProfile = {
  id: BabyId;
  name: string;
  nickname: string;
  age: string;
  avatar: string;
  weight: number;
  height: number;
  developmentScore: number;
  today: {
    milkMl: number;
    sleepHours: number;
    meals: number;
    diapers: number;
  };
};

export type DailyTargets = {
  milkMl: number;
  sleepHours: number;
  meals: number;
  diapers: number;
};

export type GrowthPoint = {
  day: string;
  weight: number;
  height: number;
};

export type TimelineItem = {
  id: string;
  babyId: BabyId;
  time: string;
  title: string;
  description: string;
  type: "milk" | "sleep" | "meal" | "diaper" | "mood";
};

export type VaccineReminder = {
  id: string;
  name: string;
  recommendedAge: string;
  dueInDays: number;
  note: string;
};

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};

export type AiStatus = "Tốt" | "Cần theo dõi" | "Cảnh báo";

export type AiInsight = {
  id: string;
  status: AiStatus;
  title: string;
  description: string;
};

export type WeeklyAiReport = {
  summary: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
};
