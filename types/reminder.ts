export type ReminderCategory =
  | "milk"
  | "sleep"
  | "diaper"
  | "meal"
  | "medicine"
  | "vaccine";

export interface Reminder {
  id: string;
  category: ReminderCategory;
  title: string;
  scheduleText: string;
  time?: string;
  enabled: boolean;
}
