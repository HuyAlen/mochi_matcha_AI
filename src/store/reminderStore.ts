"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { reminderTemplates } from "@/data/reminders/reminderTemplates";
import { deleteItem, pullItems, queuePushItems } from "@/lib/supabase/sync";
import type { Reminder } from "@/types/reminder";

interface ReminderState {
  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  toggleAll: (enabled: boolean) => void;
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
}

function createReminderId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function withUpdatedAt(reminder: Reminder): Reminder {
  return {
    ...reminder,
    updatedAt: new Date().toISOString(),
  };
}

function queueReminderSync(reminders: Reminder[]) {
  queuePushItems("reminders", reminders);
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: reminderTemplates,

      toggleReminder: (id) =>
        set((state) => {
          const reminders = state.reminders.map((reminder) =>
            reminder.id === id
              ? withUpdatedAt({ ...reminder, enabled: !reminder.enabled })
              : reminder,
          );

          queueReminderSync(reminders);

          return { reminders };
        }),

      toggleAll: (enabled) =>
        set((state) => {
          const updatedAt = new Date().toISOString();
          const reminders = state.reminders.map((reminder) => ({
            ...reminder,
            enabled,
            updatedAt,
          }));

          queueReminderSync(reminders);

          return { reminders };
        }),

      addReminder: (reminder) =>
        set((state) => {
          const savedReminder: Reminder = {
            ...reminder,
            id: createReminderId(),
            updatedAt: reminder.updatedAt || new Date().toISOString(),
          };

          const reminders = [...state.reminders, savedReminder];

          queueReminderSync(reminders);

          return { reminders };
        }),

      updateReminder: (id, reminder) =>
        set((state) => {
          const reminders = state.reminders.map((item) =>
            item.id === id ? withUpdatedAt({ ...item, ...reminder }) : item,
          );

          queueReminderSync(reminders);

          return { reminders };
        }),

      deleteReminder: (id) =>
        set((state) => {
          const reminders = state.reminders.filter(
            (reminder) => reminder.id !== id,
          );

          void deleteItem("reminders", id).catch(() => {
            // deleteItem already updates sync status. Keep local delete offline-first.
          });
          queueReminderSync(reminders);

          return { reminders };
        }),
    }),
    {
      name: "mind-ai-reminder-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ reminders: state.reminders }),
    },
  ),
);

export async function syncRemindersFromCloud() {
  try {
    const cloudReminders = await pullItems<Reminder>("reminders");

    if (!cloudReminders.length) return;

    useReminderStore.setState({
      reminders: cloudReminders,
    });
  } catch {
    // Offline, not signed in, or Supabase table not ready yet.
    // Zustand persist keeps local reminders available.
  }
}
