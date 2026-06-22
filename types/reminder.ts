export type BabyId = "mochi" | "matcha" | "both";

export type ReminderType = "feed" | "sleep" | "pump" | "medicine" | "custom";

export type ReminderRepeat = "none" | "daily" | "interval";

export type ReminderStatus = "active" | "paused" | "done";

export interface Reminder {
  id: string;
  babyId: BabyId;
  type: ReminderType;
  title: string;
  note?: string;
  remindAt: string;
  repeat: ReminderRepeat;
  intervalMinutes?: number;
  customRepeatMinutes?: number;
  enabled: boolean;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReminderDraft = {
  babyId: BabyId;
  type: ReminderType;
  title: string;
  note?: string;
  remindAt: string;
  repeat: ReminderRepeat;
  intervalMinutes?: number;
  customRepeatMinutes?: number;
};

export const reminderTypeLabels: Record<ReminderType, string> = {
  feed: "Cữ bú",
  sleep: "Giấc ngủ",
  pump: "Hút sữa",
  medicine: "Uống thuốc",
  custom: "Tùy chỉnh",
};

export const reminderTypeDescriptions: Record<ReminderType, string> = {
  feed: "Nhắc cữ bú, sữa mẹ hoặc sữa công thức.",
  sleep: "Nhắc giờ ngủ, thức dậy hoặc theo dõi giấc ngủ.",
  pump: "Nhắc hút sữa theo lịch của mẹ.",
  medicine: "Nhắc uống thuốc, vitamin hoặc chăm sóc sức khỏe.",
  custom: "Tạo nhắc nhở riêng theo nhu cầu gia đình.",
};

export const reminderTypeIcons: Record<ReminderType, string> = {
  feed: "🍼",
  sleep: "🌙",
  pump: "🤱",
  medicine: "💊",
  custom: "✨",
};

export const reminderRepeatLabels: Record<ReminderRepeat, string> = {
  none: "Không lặp lại",
  daily: "Hằng ngày",
  interval: "Theo khoảng giờ",
};

export const babyLabels: Record<BabyId, string> = {
  mochi: "Mochi",
  matcha: "Matcha",
  both: "Cả hai bé",
};
