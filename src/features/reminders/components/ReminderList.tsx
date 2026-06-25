"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import type { Reminder } from "@/types/reminder";
import { reminderTypeLabels } from "@/types/reminder";
import {
  deleteReminder,
  formatReminderDateTime,
  loadReminders,
  updateReminderStatus,
} from "@/services/reminders/reminderCrud";

type ReminderListProps = {
  limit?: number;
};

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("mind-ai-reminders-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("mind-ai-reminders-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return loadReminders();
}

function getServerSnapshot(): Reminder[] {
  return [];
}

export default function ReminderList({ limit }: ReminderListProps) {
  const reminders = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
    .filter((item) => item.status === "active")
    .sort(
      (a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
    )
    .slice(0, limit);

  if (reminders.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-center">
        <p className="font-semibold text-slate-900">Chưa có hẹn nhắc</p>
        <p className="mt-1 text-sm text-slate-500">
          Tạo nhắc bú, ngủ, hút sữa, uống thuốc hoặc nhắc tùy chỉnh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                  {reminderTypeLabels[reminder.type]}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {reminder.babyId === "both"
                    ? "Cả hai bé"
                    : reminder.babyId || "Không chọn bé"}
                </span>
              </div>

              <p className="mt-2 font-bold text-slate-950">{reminder.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatReminderDateTime(reminder.remindAt)}
              </p>
              {reminder.note ? (
                <p className="mt-2 text-sm text-slate-600">{reminder.note}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => updateReminderStatus(reminder.id, "done")}
                className="rounded-2xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600"
                aria-label="Hoàn thành hẹn nhắc"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => deleteReminder(reminder.id)}
                className="rounded-2xl border border-rose-100 bg-rose-50 p-2 text-rose-600"
                aria-label="Xóa hẹn nhắc"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
