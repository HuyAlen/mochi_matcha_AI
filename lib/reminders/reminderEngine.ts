import type {
  Reminder,
  ReminderDraft,
  ReminderRepeat,
  ReminderStatus,
  ReminderType,
} from "@/types/reminder";

const STORAGE_KEY = "mind-ai-reminders-v1";

function createReminderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `reminder-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getDefaultReminderTitle(type: ReminderType) {
  const titleMap: Record<ReminderType, string> = {
    feed: "Đến giờ bú",
    sleep: "Đến giờ ngủ",
    pump: "Đến giờ hút sữa",
    medicine: "Đến giờ uống thuốc",
    custom: "Nhắc nhở mới",
  };

  return titleMap[type];
}

export function getDefaultIntervalMinutes(type: ReminderType) {
  const intervalMap: Record<ReminderType, number> = {
    feed: 180,
    sleep: 240,
    pump: 180,
    medicine: 480,
    custom: 60,
  };

  return intervalMap[type];
}

export function createReminderFromDraft(draft: ReminderDraft): Reminder {
  const now = new Date().toISOString();

  return {
    id: createReminderId(),
    babyId: draft.babyId,
    type: draft.type,
    title: draft.title.trim() || getDefaultReminderTitle(draft.type),
    note: draft.note?.trim() || undefined,
    remindAt: draft.remindAt,
    repeat: draft.repeat,
    intervalMinutes: draft.intervalMinutes,
    customRepeatMinutes: draft.customRepeatMinutes,
    enabled: true,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export function createReminder(draft: ReminderDraft): Reminder {
  return createReminderFromDraft(draft);
}

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Reminder => {
      return Boolean(
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.remindAt === "string",
      );
    });
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function upsertReminder(reminder: Reminder): Reminder;
export function upsertReminder(
  reminders: Reminder[],
  reminder: Reminder,
): Reminder[];
export function upsertReminder(
  first: Reminder | Reminder[],
  second?: Reminder,
): Reminder | Reminder[] {
  if (!Array.isArray(first)) {
    const current = loadReminders();
    const next = upsertReminder(current, first);
    saveReminders(next);
    return first;
  }

  if (!second) return first;

  const exists = first.some((item) => item.id === second.id);

  if (!exists) {
    const next = [second, ...first];
    saveReminders(next);
    return next;
  }

  const next = first.map((item) =>
    item.id === second.id
      ? {
          ...item,
          ...second,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );

  saveReminders(next);
  return next;
}

export function deleteReminder(id: string): Reminder[] {
  const next = loadReminders().filter((item) => item.id !== id);
  saveReminders(next);
  return next;
}

export function updateReminderStatus(
  id: string,
  status: ReminderStatus,
): Reminder[] {
  const next = loadReminders().map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          enabled: status === "active",
          updatedAt: new Date().toISOString(),
        }
      : item,
  );

  saveReminders(next);
  return next;
}

export function formatReminderDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function getRepeatMinutes(
  repeat: ReminderRepeat,
  intervalMinutes?: number,
  customRepeatMinutes?: number,
) {
  if (repeat === "daily") return 24 * 60;
  if (repeat === "interval")
    return intervalMinutes || customRepeatMinutes || 180;

  return 0;
}

export function getNextReminderTime(reminder: Reminder): string | null {
  if (!reminder.enabled || reminder.status !== "active") {
    return null;
  }

  const baseTime = new Date(reminder.remindAt);

  if (Number.isNaN(baseTime.getTime())) {
    return null;
  }

  if (reminder.repeat === "none") {
    return baseTime.toISOString();
  }

  const next = new Date(baseTime);
  const repeatMinutes = getRepeatMinutes(
    reminder.repeat,
    reminder.intervalMinutes,
    reminder.customRepeatMinutes,
  );

  if (repeatMinutes <= 0) {
    return null;
  }

  while (next.getTime() <= Date.now()) {
    next.setMinutes(next.getMinutes() + repeatMinutes);
  }

  return next.toISOString();
}

export function isReminderDue(reminder: Reminder, now = new Date()): boolean {
  if (!reminder.enabled || reminder.status !== "active") {
    return false;
  }

  const remindAt = new Date(reminder.remindAt);

  if (Number.isNaN(remindAt.getTime())) {
    return false;
  }

  return remindAt.getTime() <= now.getTime();
}

export function updateReminderAfterTrigger(reminder: Reminder): Reminder {
  const now = new Date().toISOString();

  if (reminder.repeat === "none") {
    return {
      ...reminder,
      enabled: false,
      status: "done",
      updatedAt: now,
    };
  }

  const nextTime = getNextReminderTime(reminder);

  return {
    ...reminder,
    remindAt: nextTime || reminder.remindAt,
    status: "active",
    enabled: true,
    updatedAt: now,
  };
}

export function pauseReminder(reminder: Reminder): Reminder {
  return {
    ...reminder,
    enabled: false,
    status: "paused",
    updatedAt: new Date().toISOString(),
  };
}

export function resumeReminder(reminder: Reminder): Reminder {
  return {
    ...reminder,
    enabled: true,
    status: "active",
    updatedAt: new Date().toISOString(),
  };
}
