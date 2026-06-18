"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { reminderTemplates } from "@/src/data/reminders/reminderTemplates";
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

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: reminderTemplates,

      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id
              ? { ...reminder, enabled: !reminder.enabled }
              : reminder,
          ),
        })),

      toggleAll: (enabled) =>
        set((state) => ({
          reminders: state.reminders.map((reminder) => ({
            ...reminder,
            enabled,
          })),
        })),

      addReminder: (reminder) =>
        set((state) => ({
          reminders: [
            ...state.reminders,
            {
              ...reminder,
              id: createReminderId(),
            },
          ],
        })),

      updateReminder: (id, reminder) =>
        set((state) => ({
          reminders: state.reminders.map((item) =>
            item.id === id ? { ...item, ...reminder } : item,
          ),
        })),

      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        })),
    }),
    {
      name: "mind-ai-reminder-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ reminders: state.reminders }),
    },
  ),
);
