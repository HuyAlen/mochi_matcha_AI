export type MilestoneCategory = "motor" | "language" | "social" | "cognitive";

export type MilestoneStatus = "not_started" | "observed" | "achieved";

export type MilestoneAssessment = "early" | "on_track" | "watch" | "delayed";

export interface MilestoneTemplate {
  id: string;
  title: string;
  category: MilestoneCategory;
  expectedFromMonth: number;
  expectedToMonth: number;
  description: string;
  parentTip: string;
}

export interface MilestoneRecord {
  id: string;
  babyId: string;
  milestoneId: string;
  status: MilestoneStatus;
  observedDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneTimelineItem extends MilestoneTemplate {
  babyId: string;
  status: MilestoneStatus;
  assessment: MilestoneAssessment;
  record?: MilestoneRecord;
}
