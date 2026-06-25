export type ReminderType =
  | "feed"
  | "sleep"
  | "pump"
  | "medicine"
  | "diaper"
  | "meal"
  | "custom";

export type ReminderRepeat = "none" | "daily" | "weekly" | "custom";

export interface ReminderPayload {
  id: string;
  babyId?: string;
  title: string;
  type: ReminderType;
  time: string;
  enabled: boolean;
  repeat?: ReminderRepeat;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReminderRecord {
  id: string;
  user_id?: string;
  payload: ReminderPayload;
  updated_at?: string;
}
