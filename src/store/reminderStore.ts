"use client";

import { create } from "zustand";
import { reminderTemplates } from "@/src/data/reminders/reminderTemplates";
import type { Reminder } from "@/types/reminder";

interface ReminderState {
  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  toggleAll: (enabled: boolean) => void;
  addReminder: (reminder: Omit<Reminder, "id">) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
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
          id: crypto.randomUUID(),
        },
      ],
    })),
}));
