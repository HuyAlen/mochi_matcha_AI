"use client";

import { useReminderStore } from "@/src/store/reminderStore";
import type { Reminder } from "@/types/reminder";
import ReminderCard from "./ReminderCard";

export default function ReminderCategoryList() {
  const reminders = useReminderStore(
    (state: { reminders: Reminder[] }) => state.reminders,
  );

  const toggleReminder = useReminderStore(
    (state: { toggleReminder: (id: string) => void }) => state.toggleReminder,
  );

  const toggleAll = useReminderStore(
    (state: { toggleAll: (enabled: boolean) => void }) => state.toggleAll,
  );

  const allEnabled = reminders.every((reminder) => reminder.enabled);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-950">Nhắc nhở</h3>

        <button
          type="button"
          onClick={() => toggleAll(!allEnabled)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500"
        >
          Bật tất cả
          <span
            className={`h-6 w-10 rounded-full p-1 transition ${
              allEnabled ? "bg-pink-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`block size-4 rounded-full bg-white transition ${
                allEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onToggle={() => toggleReminder(reminder.id)}
          />
        ))}
      </div>
    </div>
  );
}
