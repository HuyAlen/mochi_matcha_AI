"use client";

import { useEffect, useMemo, useState } from "react";
import { showReminderSavedNotification } from "@/src/services/notifications/localNotifications";

type RepeatMode = "once" | "daily" | "custom";

interface ReminderItem {
  id: string;
  title: string;
  hour: string;
  minute: string;
  repeatMode: RepeatMode;
  repeatDays: string[];
  enabled: boolean;
  icon: string;
}

const STORAGE_KEY = "mind-ai-reminders-v1";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const defaultReminders: ReminderItem[] = [
  {
    id: "milk",
    title: "Nhắc cho bé uống sữa",
    hour: "08",
    minute: "00",
    repeatMode: "daily",
    repeatDays: weekDays,
    enabled: true,
    icon: "🍼",
  },
  {
    id: "sleep",
    title: "Nhắc giờ ngủ",
    hour: "19",
    minute: "00",
    repeatMode: "daily",
    repeatDays: weekDays,
    enabled: true,
    icon: "🌙",
  },
  {
    id: "diaper",
    title: "Nhắc thay tã",
    hour: "10",
    minute: "00",
    repeatMode: "daily",
    repeatDays: weekDays,
    enabled: true,
    icon: "🧷",
  },
  {
    id: "meal",
    title: "Nhắc ăn dặm",
    hour: "11",
    minute: "00",
    repeatMode: "custom",
    repeatDays: ["T2", "T3", "T4", "T5", "T6"],
    enabled: true,
    icon: "🥣",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function createReminderId() {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isReminderItem(value: unknown): value is ReminderItem {
  if (!value || typeof value !== "object") return false;

  const reminder = value as Partial<ReminderItem>;

  return (
    typeof reminder.id === "string" &&
    typeof reminder.title === "string" &&
    typeof reminder.hour === "string" &&
    typeof reminder.minute === "string" &&
    typeof reminder.enabled === "boolean" &&
    typeof reminder.icon === "string" &&
    ["once", "daily", "custom"].includes(reminder.repeatMode ?? "") &&
    Array.isArray(reminder.repeatDays)
  );
}

function loadStoredReminders(): ReminderItem[] {
  if (!isBrowser()) return defaultReminders;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return defaultReminders;

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) return defaultReminders;

    const validReminders = parsedValue.filter(isReminderItem);

    return validReminders.length > 0 ? validReminders : defaultReminders;
  } catch (error) {
    console.error("Failed to load reminders:", error);
    return defaultReminders;
  }
}

function saveStoredReminders(reminders: ReminderItem[]) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Failed to save reminders:", error);
  }
}

function clampNumber(value: string, min: number, max: number) {
  const cleanValue = value.replace(/\D/g, "").slice(0, 2);
  if (!cleanValue) return "";

  const numericValue = Math.min(Math.max(Number(cleanValue), min), max);

  return String(numericValue).padStart(2, "0");
}

function normalizeTimeValue(
  value: string,
  fallback: string,
  min: number,
  max: number,
) {
  const cleanValue = value.replace(/\D/g, "").slice(0, 2);

  if (!cleanValue) return fallback;

  const numericValue = Math.min(Math.max(Number(cleanValue), min), max);

  return String(numericValue).padStart(2, "0");
}

function formatTime(reminder: ReminderItem) {
  return `${reminder.hour}:${reminder.minute}`;
}

function getRepeatLabel(reminder: ReminderItem) {
  if (reminder.repeatMode === "once") return "Một lần";
  if (reminder.repeatMode === "daily") return "Mỗi ngày";
  if (reminder.repeatDays.length === 0) return "Chọn ngày";

  return reminder.repeatDays.join(", ");
}

function normalizeReminder(reminder: ReminderItem): ReminderItem {
  const hour = normalizeTimeValue(reminder.hour, "08", 0, 23);
  const minute = normalizeTimeValue(reminder.minute, "00", 0, 59);
  const repeatDays =
    reminder.repeatMode === "daily"
      ? weekDays
      : reminder.repeatMode === "once"
        ? []
        : reminder.repeatDays.filter((day) => weekDays.includes(day));

  const repeatMode =
    reminder.repeatMode === "custom" && repeatDays.length === weekDays.length
      ? "daily"
      : reminder.repeatMode;

  return {
    ...reminder,
    title: reminder.title.trim(),
    hour,
    minute,
    repeatMode,
    repeatDays: repeatMode === "daily" ? weekDays : repeatDays,
    enabled: true,
  };
}

function createEmptyReminder(): ReminderItem {
  return {
    id: createReminderId(),
    title: "",
    hour: "08",
    minute: "00",
    repeatMode: "daily",
    repeatDays: weekDays,
    enabled: true,
    icon: "🔔",
  };
}

export default function ReminderCard() {
  const [reminders, setReminders] =
    useState<ReminderItem[]>(loadStoredReminders);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] =
    useState<ReminderItem>(createEmptyReminder);

  const activeCount = useMemo(
    () => reminders.filter((reminder) => reminder.enabled).length,
    [reminders],
  );

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  function openCreateForm() {
    setEditingReminder(createEmptyReminder());
    setIsFormOpen(true);
  }

  function openEditForm(reminder: ReminderItem) {
    setEditingReminder({ ...reminder });
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingReminder(createEmptyReminder());
    setIsFormOpen(false);
  }

  function updateEditingReminder(next: Partial<ReminderItem>) {
    setEditingReminder((current) => ({ ...current, ...next }));
  }

  function toggleRepeatDay(day: string) {
    setEditingReminder((current) => {
      const hasDay = current.repeatDays.includes(day);
      const nextDays = hasDay
        ? current.repeatDays.filter((item) => item !== day)
        : [...current.repeatDays, day];

      return {
        ...current,
        repeatMode: nextDays.length === weekDays.length ? "daily" : "custom",
        repeatDays: nextDays,
      };
    });
  }

  function setRepeatMode(mode: RepeatMode) {
    setEditingReminder((current) => ({
      ...current,
      repeatMode: mode,
      repeatDays:
        mode === "daily" ? weekDays : mode === "once" ? [] : current.repeatDays,
    }));
  }

  function toggleReminder(reminderId: string) {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder,
      ),
    );
  }

  function deleteReminder(reminderId: string) {
    setReminders((current) =>
      current.filter((reminder) => reminder.id !== reminderId),
    );

    if (editingReminder.id === reminderId) {
      closeForm();
    }
  }

  async function saveReminder() {
    if (!editingReminder.title.trim()) return;

    const nextReminder = normalizeReminder(editingReminder);

    setReminders((current) => {
      const exists = current.some(
        (reminder) => reminder.id === nextReminder.id,
      );

      if (exists) {
        return current.map((reminder) =>
          reminder.id === nextReminder.id ? nextReminder : reminder,
        );
      }

      return [nextReminder, ...current];
    });

    closeForm();

    void showReminderSavedNotification({
      id: nextReminder.id,
      title: nextReminder.title,
      time: formatTime(nextReminder),
      repeatLabel: getRepeatLabel(nextReminder),
      enabled: nextReminder.enabled,
    });
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-400">
            Reminder
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-950">
            Nhắc nhở chăm bé
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Tạo lịch nhắc giống Alarm: một lần, mỗi ngày hoặc chọn ngày trong
            tuần.
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
          ⏰
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center gap-3 rounded-3xl bg-slate-50 p-3"
          >
            <button
              type="button"
              onClick={() => openEditForm(reminder)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                {reminder.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-black text-slate-950">
                  {reminder.title}
                </span>
                <span className="mt-0.5 block text-sm text-slate-400">
                  {formatTime(reminder)} · {getRepeatLabel(reminder)}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleReminder(reminder.id)}
              className={`relative h-8 w-14 rounded-full transition ${
                reminder.enabled ? "bg-pink-500" : "bg-slate-200"
              }`}
              aria-label="Bật/tắt nhắc nhở"
            >
              <span
                className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition ${
                  reminder.enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {isFormOpen ? (
        <div className="mt-5 rounded-[1.75rem] bg-pink-50 p-4 ring-1 ring-pink-100">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="font-black text-slate-950">
              {reminders.some((item) => item.id === editingReminder.id)
                ? "Chỉnh sửa nhắc nhở"
                : "Thêm nhắc nhở"}
            </h4>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-pink-500 shadow-sm">
              {activeCount} đang bật
            </span>
          </div>

          <label className="block">
            <span className="text-xs font-black text-pink-500">
              Tên nhắc nhở
            </span>
            <input
              value={editingReminder.title}
              onChange={(event) =>
                updateEditingReminder({ title: event.currentTarget.value })
              }
              placeholder="Ví dụ: Uống vitamin D"
              className="mt-2 w-full rounded-2xl bg-white px-4 py-4 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-300"
            />
          </label>

          <div className="mt-4">
            <span className="text-xs font-black text-pink-500">Giờ nhắc</span>

            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <input
                inputMode="numeric"
                value={editingReminder.hour}
                onChange={(event) =>
                  updateEditingReminder({
                    hour: clampNumber(event.currentTarget.value, 0, 23),
                  })
                }
                onBlur={() =>
                  updateEditingReminder({
                    hour: normalizeTimeValue(editingReminder.hour, "08", 0, 23),
                  })
                }
                className="min-w-0 rounded-2xl bg-white px-4 py-4 text-center text-lg font-black text-slate-950 outline-none"
                aria-label="Giờ"
              />
              <span className="text-2xl font-black text-slate-300">:</span>
              <input
                inputMode="numeric"
                value={editingReminder.minute}
                onChange={(event) =>
                  updateEditingReminder({
                    minute: clampNumber(event.currentTarget.value, 0, 59),
                  })
                }
                onBlur={() =>
                  updateEditingReminder({
                    minute: normalizeTimeValue(
                      editingReminder.minute,
                      "00",
                      0,
                      59,
                    ),
                  })
                }
                className="min-w-0 rounded-2xl bg-white px-4 py-4 text-center text-lg font-black text-slate-950 outline-none"
                aria-label="Phút"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Nhập giờ 24h, ví dụ 08:00 hoặc 21:30.
            </p>
          </div>

          <div className="mt-4">
            <span className="text-xs font-black text-pink-500">Lặp lại</span>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepeatMode("once")}
                className={`rounded-2xl px-3 py-3 text-sm font-bold ${
                  editingReminder.repeatMode === "once"
                    ? "bg-pink-500 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                Một lần
              </button>
              <button
                type="button"
                onClick={() => setRepeatMode("daily")}
                className={`rounded-2xl px-3 py-3 text-sm font-bold ${
                  editingReminder.repeatMode === "daily"
                    ? "bg-pink-500 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                Mỗi ngày
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => {
                const isSelected = editingReminder.repeatDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleRepeatDay(day)}
                    className={`aspect-square rounded-full text-xs font-black transition ${
                      isSelected
                        ? "bg-purple-500 text-white"
                        : "bg-white text-slate-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-2xl bg-white py-4 font-bold text-slate-500"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={saveReminder}
              disabled={!editingReminder.title.trim()}
              className="rounded-2xl bg-pink-500 py-4 font-black text-white shadow-sm disabled:bg-pink-300"
            >
              Lưu
            </button>
          </div>

          {reminders.some((item) => item.id === editingReminder.id) ? (
            <button
              type="button"
              onClick={() => deleteReminder(editingReminder.id)}
              className="mt-3 w-full rounded-2xl bg-white py-3 text-sm font-bold text-rose-500"
            >
              Xóa nhắc nhở
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={openCreateForm}
          className="mt-5 w-full rounded-2xl bg-pink-500 py-4 font-black text-white shadow-sm active:scale-[0.99]"
        >
          + Thêm nhắc nhở
        </button>
      )}
    </div>
  );
}
