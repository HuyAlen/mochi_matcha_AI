"use client";

import { useReminderStore } from "@/src/store/reminderStore";
import type { Reminder } from "@/types/reminder";

export default function ReminderStatsCard() {
  const reminders = useReminderStore(
    (state: { reminders: Reminder[] }) => state.reminders,
  );

  const enabledCount = reminders.filter((reminder) => reminder.enabled).length;

  return (
    <div className="rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-purple-700">Smart Reminders</p>
      <h3 className="mt-2 text-lg font-black text-slate-950">
        {enabledCount}/{reminders.length} nhắc nhở đang bật
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Mind AI sẽ dùng dữ liệu này để gợi ý lịch sinh hoạt phù hợp hơn cho
        Mochi & Matcha.
      </p>
    </div>
  );
}
