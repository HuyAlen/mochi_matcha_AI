"use client";

import { useMemo, useState } from "react";
import type {
  BabyId,
  Reminder,
  ReminderRepeat,
  ReminderType,
} from "@/types/reminder";
import {
  babyLabels,
  reminderTypeIcons,
  reminderTypeLabels,
} from "@/types/reminder";
import {
  createReminder,
  getDefaultIntervalMinutes,
  getDefaultReminderTitle,
  upsertReminder,
} from "@/src/services/reminders/reminderCrud";
import { scheduleReminderNotification } from "@/lib/pwa/reminderNotification";

type ReminderFormProps = {
  onSaved?: (reminder: Reminder) => void;
};

type PresetOption = {
  label: string;
  minutes: number;
};

type ReminderTypeView = {
  label: string;
  shortLabel: string;
};

const REMINDER_TYPES: ReminderType[] = [
  "feed",
  "sleep",
  "pump",
  "medicine",
  "custom",
];

const BABY_OPTIONS: BabyId[] = ["both", "mochi", "matcha"];
const REPEAT_OPTIONS: ReminderRepeat[] = ["none", "daily", "interval"];

const REPEAT_LABELS: Record<ReminderRepeat, string> = {
  none: "Không lặp",
  daily: "Hằng ngày",
  interval: "Theo cữ",
};

const TYPE_VIEW: Record<ReminderType, ReminderTypeView> = {
  feed: { label: reminderTypeLabels.feed, shortLabel: "Cữ bú" },
  sleep: { label: reminderTypeLabels.sleep, shortLabel: "Ngủ" },
  pump: { label: reminderTypeLabels.pump, shortLabel: "Hút sữa" },
  medicine: { label: reminderTypeLabels.medicine, shortLabel: "Thuốc" },
  custom: { label: reminderTypeLabels.custom, shortLabel: "Khác" },
};

const PRESET_OPTIONS: Record<ReminderType, PresetOption[]> = {
  feed: [
    { label: "+2h", minutes: 120 },
    { label: "+3h", minutes: 180 },
    { label: "+4h", minutes: 240 },
  ],
  sleep: [
    { label: "+30p", minutes: 30 },
    { label: "+1h", minutes: 60 },
    { label: "+2h", minutes: 120 },
  ],
  pump: [
    { label: "+3h", minutes: 180 },
    { label: "+4h", minutes: 240 },
    { label: "+6h", minutes: 360 },
  ],
  medicine: [
    { label: "+4h", minutes: 240 },
    { label: "+6h", minutes: 360 },
    { label: "+8h", minutes: 480 },
  ],
  custom: [
    { label: "+1h", minutes: 60 },
    { label: "+2h", minutes: 120 },
    { label: "+3h", minutes: 180 },
  ],
};

function toDatetimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getPreviewParts(value: string) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return {
      dateText: "Chưa chọn ngày",
      timeText: "--:--",
    };
  }

  return {
    dateText: new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    timeText: new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function getRelativePreview(value: string) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "Chưa chọn giờ";
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 0) {
    return "Đã qua";
  }

  if (diffMinutes < 60) {
    return `Sau ${diffMinutes} phút`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `Sau ${hours} giờ`;
  }

  return `Sau ${hours} giờ ${minutes} phút`;
}

export default function ReminderForm({ onSaved }: ReminderFormProps) {
  const defaultTime = useMemo(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return toDatetimeLocalValue(date);
  }, []);

  const [type, setType] = useState<ReminderType>("feed");
  const [babyId, setBabyId] = useState<BabyId>("both");
  const [title, setTitle] = useState(getDefaultReminderTitle("feed"));
  const [note, setNote] = useState("");
  const [remindAt, setRemindAt] = useState(defaultTime);
  const [repeat, setRepeat] = useState<ReminderRepeat>("none");
  const [intervalMinutes, setIntervalMinutes] = useState(
    getDefaultIntervalMinutes("feed"),
  );
  const [isSaving, setIsSaving] = useState(false);

  const relativePreview = useMemo(
    () => getRelativePreview(remindAt),
    [remindAt],
  );

  const previewParts = useMemo(() => getPreviewParts(remindAt), [remindAt]);

  function handleTypeChange(nextType: ReminderType) {
    setType(nextType);
    setTitle(getDefaultReminderTitle(nextType));
    setIntervalMinutes(getDefaultIntervalMinutes(nextType));
  }

  function applyPreset(minutes: number) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    setRemindAt(toDatetimeLocalValue(date));

    if (repeat === "interval") {
      setIntervalMinutes(minutes);
    }
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
      className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="max-h-[78vh] space-y-4 overflow-y-auto bg-slate-50/40 px-4 pb-4 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <header className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-lg">
              ⏰
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-950">Tạo hẹn nhắc</p>
              <p className="mt-0.5 text-sm leading-5 text-slate-500">
                Đặt lịch chăm sóc Mochi & Matcha.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-2">
          <p className="px-1 text-sm font-semibold text-slate-700">
            Loại hẹn nhắc
          </p>
          <div className="grid grid-cols-3 gap-2">
            {REMINDER_TYPES.map((item) => {
              const isActive = item === type;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleTypeChange(item)}
                  aria-label={TYPE_VIEW[item].label}
                  className={[
                    "flex min-h-[70px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 text-center transition",
                    isActive
                      ? "border-violet-200 bg-violet-600 text-white shadow-md shadow-violet-200"
                      : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-200 hover:bg-violet-50",
                  ].join(" ")}
                >
                  <span className="text-xl leading-none">
                    {reminderTypeIcons[item]}
                  </span>
                  <span className="text-xs font-bold leading-tight">
                    {TYPE_VIEW[item].shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-violet-100 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">Nhắc nhanh</p>
              <p className="text-xs text-slate-500">
                Đặt giờ theo cữ tiếp theo.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
              {TYPE_VIEW[type].shortLabel}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {PRESET_OPTIONS[type].map((preset) => (
              <button
                key={`${type}-${preset.label}`}
                type="button"
                onClick={() => applyPreset(preset.minutes)}
                className="h-10 rounded-2xl border border-violet-100 bg-violet-50/70 text-sm font-bold text-violet-700 transition hover:border-violet-200 hover:bg-violet-100"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Bé</p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
            {BABY_OPTIONS.map((item) => {
              const isActive = item === babyId;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBabyId(item)}
                  className={[
                    "min-h-10 rounded-xl px-2 text-sm font-bold transition",
                    isActive
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  {babyLabels[item]}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Giờ nhắc
            </span>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(event) => setRemindAt(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              required
            />
          </label>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                  ⏰
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-500">
                    Preview
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {relativePreview}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Ngày
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-600">
                  {previewParts.dateText}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Giờ
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-600">
                  {previewParts.timeText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Tiêu đề
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="VD: Đến giờ bú sữa"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Ghi chú
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="VD: 120ml, bên trái, sau ăn..."
            />
          </label>
        </section>

        <section className="space-y-2 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Lặp lại</p>
          <div className="flex flex-wrap gap-2">
            {REPEAT_OPTIONS.map((item) => {
              const isActive = item === repeat;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRepeat(item)}
                  className={[
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition",
                    isActive
                      ? "border-violet-200 bg-violet-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "size-2 rounded-full",
                      isActive ? "bg-white" : "bg-slate-300",
                    ].join(" ")}
                  />
                  {REPEAT_LABELS[item]}
                </button>
              );
            })}
          </div>
        </section>

        {repeat === "interval" ? (
          <label className="block space-y-1.5 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
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
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-12px_28px_rgba(15,23,42,0.06)] backdrop-blur">
        <button
          type="submit"
          disabled={isSaving}
          className="h-12 w-full rounded-2xl bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : "Lưu hẹn nhắc"}
        </button>
      </div>
    </form>
  );
}
