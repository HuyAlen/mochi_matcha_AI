"use client";

import {
  cancelNativeReminder,
  scheduleNativeReminder,
} from "@/services/notifications/nativeLocalNotifications";
import { useReminderStore } from "@/store/reminderStore";
import type {
  Reminder,
  ReminderDraft,
  ReminderStatus,
  ReminderType,
} from "@/types/reminder";

const CHANGE_EVENT = "mind-ai-reminders-change";

function emitReminderChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function createReminderId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function scheduleReminderSafely(reminder: Reminder) {
  void scheduleNativeReminder(reminder).then((scheduled) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[MindAI Reminder] Native schedule result", {
        id: reminder.id,
        remindAt: reminder.remindAt,
        scheduled,
      });
    }
  });
}

function cancelReminderSafely(id: string) {
  void cancelNativeReminder(id).then((cancelled) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[MindAI Reminder] Native cancel result", {
        id,
        cancelled,
      });
    }
  });
}

export function getDefaultReminderTitle(type: ReminderType) {
  switch (type) {
    case "feed":
      return "Đến giờ bú sữa";
    case "sleep":
      return "Đến giờ ngủ";
    case "pump":
      return "Đến giờ hút sữa";
    case "medicine":
      return "Đến giờ uống thuốc";
    case "custom":
    default:
      return "Hẹn nhắc mới";
  }
}

export function getDefaultIntervalMinutes(type: ReminderType) {
  switch (type) {
    case "feed":
      return 180;
    case "sleep":
      return 120;
    case "pump":
      return 180;
    case "medicine":
      return 360;
    case "custom":
    default:
      return 60;
  }
}

export function createReminder(draft: ReminderDraft): Reminder {
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

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  return useReminderStore.getState().reminders;
}

export function upsertReminder(reminder: Reminder): Reminder {
  const now = new Date().toISOString();

  const nextReminder: Reminder = {
    ...reminder,
    enabled: reminder.status === "active",
    updatedAt: now,
  };

  useReminderStore.setState((state) => {
    const exists = state.reminders.some((item) => item.id === reminder.id);

    return {
      reminders: exists
        ? state.reminders.map((item) =>
            item.id === reminder.id ? nextReminder : item,
          )
        : [...state.reminders, nextReminder],
    };
  });

  emitReminderChange();

  if (process.env.NODE_ENV !== "production") {
    console.info("[MindAI Reminder] Saved locally", nextReminder);
  }

  if (nextReminder.status === "active" && nextReminder.enabled) {
    scheduleReminderSafely(nextReminder);
  } else {
    cancelReminderSafely(nextReminder.id);
  }

  return nextReminder;
}

export function updateReminderStatus(
  id: string,
  status: ReminderStatus,
): Reminder | undefined {
  let updatedReminder: Reminder | undefined;

  useReminderStore.setState((state) => {
    const reminders = state.reminders.map((item) => {
      if (item.id !== id) return item;

      updatedReminder = {
        ...item,
        status,
        enabled: status === "active",
        updatedAt: new Date().toISOString(),
      };

      return updatedReminder;
    });

    return { reminders };
  });

  emitReminderChange();

  if (status === "active" && updatedReminder) {
    scheduleReminderSafely(updatedReminder);
  } else {
    cancelReminderSafely(id);
  }

  return updatedReminder;
}

export function deleteReminder(id: string) {
  useReminderStore.getState().deleteReminder(id);
  emitReminderChange();
  cancelReminderSafely(id);
}

export function formatReminderDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa có thời gian";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
