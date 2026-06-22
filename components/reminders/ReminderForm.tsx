"use client";

import { useMemo, useState } from "react";
import type {
  BabyId,
  Reminder,
  ReminderRepeat,
  ReminderType,
} from "@/types/reminder";
import {
  createReminder,
  getDefaultIntervalMinutes,
  getDefaultReminderTitle,
  upsertReminder,
} from "@/lib/reminders/reminderEngine";
import { scheduleReminderNotification } from "@/lib/pwa/reminderNotification";
import ReminderTypePicker from "@/components/reminders/ReminderTypePicker";

type ReminderFormProps = {
  onSaved?: (reminder: Reminder) => void;
};

function toDatetimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function ReminderForm({ onSaved }: ReminderFormProps) {
  const defaultTime = useMemo(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return toDatetimeLocalValue(date);
  }, []);

  const [type, setType] = useState<ReminderType>("feed");
  const [babyId, setBabyId] = useState<BabyId | "both">("both");
  const [title, setTitle] = useState(getDefaultReminderTitle("feed"));
  const [note, setNote] = useState("");
  const [remindAt, setRemindAt] = useState(defaultTime);
  const [repeat, setRepeat] = useState<ReminderRepeat>("none");
  const [intervalMinutes, setIntervalMinutes] = useState(
    getDefaultIntervalMinutes("feed"),
  );
  const [isSaving, setIsSaving] = useState(false);

  function handleTypeChange(nextType: ReminderType) {
    setType(nextType);
    setTitle(getDefaultReminderTitle(nextType));
    setIntervalMinutes(getDefaultIntervalMinutes(nextType));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const reminder = createReminder({
        babyId,
        type,
        title,
        note,
        remindAt: new Date(remindAt).toISOString(),
        repeat,
        intervalMinutes,
      });

      const savedReminder = upsertReminder(reminder);

      await scheduleReminderNotification({
        id: savedReminder.id,
        title: savedReminder.title,
        body: savedReminder.note || "Đến giờ chăm sóc bé.",
        remindAt: savedReminder.remindAt,
        url: "/reminders",
      });

      onSaved?.(savedReminder);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <p className="text-lg font-bold text-slate-950">Tạo hẹn nhắc</p>
        <p className="mt-1 text-sm text-slate-500">
          Feed, Sleep, Pump, Medicine hoặc Custom reminder.
        </p>
      </div>

      <ReminderTypePicker value={type} onChange={handleTypeChange} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Bé</span>
          <select
            value={babyId}
            onChange={(event) =>
              setBabyId(event.target.value as BabyId | "both")
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
          >
            <option value="both">Cả hai bé</option>
            <option value="mochi">Mochi</option>
            <option value="matcha">Matcha</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Giờ nhắc</span>
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(event) => setRemindAt(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
            required
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-sm font-semibold text-slate-700">Tiêu đề</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
          placeholder="VD: Đến giờ bú sữa"
          required
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-sm font-semibold text-slate-700">Ghi chú</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
          placeholder="VD: 120ml, bên trái, sau ăn..."
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Lặp lại</span>
          <select
            value={repeat}
            onChange={(event) =>
              setRepeat(event.target.value as ReminderRepeat)
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
          >
            <option value="none">Không lặp</option>
            <option value="daily">Mỗi ngày</option>
            <option value="interval">Theo khoảng thời gian</option>
          </select>
        </label>

        {repeat === "interval" ? (
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Khoảng cách phút
            </span>
            <input
              type="number"
              min={5}
              value={intervalMinutes}
              onChange={(event) =>
                setIntervalMinutes(Number(event.target.value))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
            />
          </label>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50"
      >
        {isSaving ? "Đang lưu..." : "Lưu hẹn nhắc"}
      </button>
    </form>
  );
}
