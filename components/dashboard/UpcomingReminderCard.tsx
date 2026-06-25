"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useReminderStore } from "@/features/reminders";
import { reminderTypeLabels } from "@/types/reminder";

const STARTUP_NOW = Date.now();

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function UpcomingReminderCard() {
  const router = useRouter();
  const reminders = useReminderStore((state) => state.reminders);

  const upcoming = useMemo(() => {
    return reminders
      .filter((reminder) => {
        const time = new Date(reminder.remindAt).getTime();

        return (
          reminder.enabled &&
          reminder.status === "active" &&
          !Number.isNaN(time) &&
          time >= STARTUP_NOW
        );
      })
      .sort(
        (a, b) =>
          new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
      )
      .slice(0, 3);
  }, [reminders]);

  return (
    <section className="rounded-4xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-400">
            Reminder
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Nháº¯c sáº¯p tá»›i
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Cá»¯ chÄƒm bÃ© tiáº¿p theo trong ngÃ y
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/reminders")}
          className="rounded-2xl bg-violet-50 px-3 py-2 text-sm font-black text-violet-700 active:scale-95"
        >
          + Táº¡o
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.length > 0 ? (
          upcoming.map((reminder) => (
            <button
              key={reminder.id}
              type="button"
              onClick={() => router.push("/reminders")}
              className="flex w-full items-center gap-3 rounded-3xl bg-linear-to-br from-violet-50 to-white p-4 text-left ring-1 ring-violet-100 active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                â°
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">
                  {reminder.title}
                </p>
                <p className="mt-1 truncate text-xs font-bold text-slate-400">
                  {reminderTypeLabels[reminder.type]} â€¢ {reminder.babyId}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-violet-700 shadow-sm">
                {formatTime(reminder.remindAt)}
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 p-5 text-center">
            <div className="text-4xl">â°</div>
            <p className="mt-3 text-sm font-black text-slate-900">
              ChÆ°a cÃ³ reminder sáº¯p tá»›i
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Táº¡o nháº¯c cá»¯ sá»¯a, ngá»§ hoáº·c thuá»‘c cho bÃ©.
            </p>
            <button
              type="button"
              onClick={() => router.push("/reminders")}
              className="mt-4 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-black text-white shadow-sm active:scale-95"
            >
              Táº¡o reminder
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
