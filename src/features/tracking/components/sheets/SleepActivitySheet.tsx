"use client";

import { useEffect, useMemo, useState } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import {
  useTimerStore,
  formatElapsedDuration,
  formatElapsedTime,
  getElapsedHours,
} from "@/store/timerStore";
import { useTrackingStore } from "@/store/trackingStore";
import {
  ActivitySheetShell,
  BabySelector,
  FieldLabel,
  PrimaryButton,
} from "./ActivitySheetShared";

type Props = {
  babyId: BabyId;
  onBabyChange: (babyId: BabyId) => void;
  onClose: () => void;
  onSave: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
};

type SleepQuality = "deep" | "normal" | "hard" | "wake";

const SLEEP_TYPES = ["Ngủ ngày", "Ngủ đêm", "Ngủ ngắn"] as const;

const DURATION_PRESETS = [
  { label: "15m", value: 0.25 },
  { label: "30m", value: 0.5 },
  { label: "45m", value: 0.75 },
  { label: "1h", value: 1 },
  { label: "1.5h", value: 1.5 },
  { label: "2h", value: 2 },
];

const SLEEP_QUALITIES: Array<{
  id: SleepQuality;
  label: string;
  icon: string;
}> = [
  { id: "deep", label: "Ngủ ngon", icon: "😴" },
  { id: "normal", label: "Bình thường", icon: "🙂" },
  { id: "hard", label: "Khó ngủ", icon: "😣" },
  { id: "wake", label: "Hay thức", icon: "👀" },
];

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function normalizeTime(value: string) {
  const cleaned = value.replace(/[^0-9:]/g, "").slice(0, 5);
  const compact = cleaned.replace(":", "");

  if (cleaned.includes(":")) {
    const [rawHour = "", rawMinute = ""] = cleaned.split(":");
    const hour = rawHour.slice(0, 2);
    const minute = rawMinute.slice(0, 2);
    return minute ? `${hour}:${minute}` : `${hour}:`;
  }

  if (compact.length <= 2) return compact;
  return `${compact.slice(0, 2)}:${compact.slice(2, 4)}`;
}

function formatTime24(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatHours(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 giờ";

  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
}

function formatLastSleepTime(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "";

  const diffMinutes = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    return remainingMinutes > 0
      ? `${diffHours} giờ ${remainingMinutes} phút trước`
      : `${diffHours} giờ trước`;
  }

  return formatTime24(createdAt);
}

function normalizeDuration(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDotIndex = cleaned.indexOf(".");

  if (firstDotIndex === -1) return cleaned;

  return (
    cleaned.slice(0, firstDotIndex + 1) +
    cleaned.slice(firstDotIndex + 1).replace(/\./g, "")
  );
}

function buildSleepTimerNote({
  sleepType,
  startAt,
  endAt,
  qualityLabel,
  extraNote,
}: {
  sleepType: string;
  startAt: string;
  endAt: string;
  qualityLabel?: string;
  extraNote?: string;
}) {
  const startTime = formatTime24(startAt);
  const endTime = formatTime24(endAt);

  return [
    sleepType,
    `Bắt đầu ${startTime}`,
    `Kết thúc ${endTime}`,
    qualityLabel,
    extraNote?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function SleepActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const entries = useTrackingStore((state) => state.entries);
  const activeSleepSession = useTimerStore(
    (state) => state.activeSleepSessions[babyId],
  );
  const startSleepTimer = useTimerStore((state) => state.startSleepTimer);
  const stopSleepTimer = useTimerStore((state) => state.stopSleepTimer);
  const cancelSleepTimer = useTimerStore((state) => state.cancelSleepTimer);

  const [hours, setHours] = useState("1.5");
  const [sleepType, setSleepType] =
    useState<(typeof SLEEP_TYPES)[number]>("Ngủ ngày");
  const [startTime, setStartTime] = useState(getCurrentTime);
  const [quality, setQuality] = useState<SleepQuality>("normal");
  const [note, setNote] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeSleepSession) return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeSleepSession]);

  const selectedHours = useMemo(() => Number(hours || 0), [hours]);
  const canSave = selectedHours > 0;

  const selectedQuality = useMemo(() => {
    return SLEEP_QUALITIES.find((item) => item.id === quality);
  }, [quality]);

  const timerDurationHours = useMemo(() => {
    return activeSleepSession
      ? Number(getElapsedHours(activeSleepSession.startAt, now).toFixed(2))
      : 0;
  }, [activeSleepSession, now]);

  const lastSleep = useMemo(() => {
    return entries
      .filter((entry) => entry.babyId === babyId && entry.type === "sleep")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
  }, [babyId, entries]);

  function handleStartTimer() {
    startSleepTimer(babyId);
    setStartTime(getCurrentTime());
  }

  function handleStopTimer() {
    const session = stopSleepTimer(babyId);

    if (!session) return;

    const endAt = new Date().toISOString();
    const durationHours = Number(getElapsedHours(session.startAt).toFixed(2));

    onSave({
      babyId,
      type: "sleep",
      value: Math.max(0.05, durationHours),
      unit: "giờ",
      note: buildSleepTimerNote({
        sleepType,
        startAt: session.startAt,
        endAt,
        qualityLabel: selectedQuality?.label,
        extraNote: note,
      }),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const details = [
      sleepType,
      startTime ? `Bắt đầu ${startTime}` : "",
      selectedQuality?.label,
      note.trim(),
    ]
      .filter(Boolean)
      .join(" · ");

    onSave({
      babyId,
      type: "sleep",
      value: selectedHours,
      unit: "giờ",
      note: details,
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Ghi nhanh"
      title="Giấc ngủ"
      icon="🌙"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <BabySelector value={babyId} onChange={onBabyChange} />

        {activeSleepSession ? (
          <section className="rounded-3xl bg-purple-500 p-3 text-white shadow-lg shadow-purple-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-100">
                  Đang ngủ
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums leading-none">
                  {formatElapsedTime(activeSleepSession.startAt, now)}
                </p>
                <p className="mt-1 text-xs font-bold text-purple-100">
                  Bắt đầu {formatTime24(activeSleepSession.startAt)} ·{" "}
                  {formatElapsedDuration(activeSleepSession.startAt, now)}
                </p>
              </div>

              <span className="rounded-2xl bg-white/15 px-3 py-1.5 text-sm font-black">
                😴
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStopTimer}
                className="h-11 rounded-2xl bg-white text-sm font-black text-purple-600 shadow-sm transition active:scale-[0.99]"
              >
                Kết thúc & lưu
              </button>

              <button
                type="button"
                onClick={() => cancelSleepTimer(babyId)}
                className="h-11 rounded-2xl bg-purple-400/60 text-sm font-black text-white ring-1 ring-white/20 transition active:scale-[0.99]"
              >
                Hủy timer
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-purple-50 p-3 ring-1 ring-purple-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-400">
                  Timer ngủ
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  Bấm bắt đầu khi bé ngủ, Mind AI sẽ tự tính thời lượng.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartTimer}
                className="h-10 shrink-0 rounded-2xl bg-purple-500 px-4 text-sm font-black text-white shadow-sm shadow-purple-200 transition active:scale-[0.99]"
              >
                ▶ Bắt đầu
              </button>
            </div>
          </section>
        )}

        {lastSleep ? (
          <div className="rounded-3xl bg-purple-50 px-3 py-2 ring-1 ring-purple-100">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-400">
                  Lần trước
                </p>
                <p className="mt-0.5 truncate text-xs font-black text-slate-700">
                  {formatTime24(lastSleep.createdAt)} ·{" "}
                  {formatLastSleepTime(lastSleep.createdAt)}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl bg-white px-3 py-1.5 text-sm font-black text-purple-500 shadow-sm">
                {formatHours(Number(lastSleep.value ?? 0))}
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <FieldLabel>Loại giấc</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {SLEEP_TYPES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSleepType(item)}
                className={`h-9 rounded-2xl px-2 text-[11px] font-black transition ${
                  sleepType === item
                    ? "bg-purple-500 text-white shadow-sm shadow-purple-200"
                    : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <FieldLabel>Thời gian bắt đầu</FieldLabel>
          <div className="flex h-10 items-center rounded-3xl bg-slate-50 px-3 ring-1 ring-slate-100">
            <input
              type="text"
              value={startTime}
              onChange={(event) =>
                setStartTime(normalizeTime(event.target.value))
              }
              inputMode="numeric"
              placeholder="14:30"
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
            />
            <span className="text-xs text-slate-400">⏰</span>
          </div>
        </label>

        <div>
          <FieldLabel>Thời lượng nhanh</FieldLabel>
          <div className="grid grid-cols-6 gap-1.5">
            {DURATION_PRESETS.map((preset) => {
              const active = selectedHours === preset.value;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setHours(String(preset.value))}
                  className={`h-9 rounded-2xl px-1 text-[11px] font-black transition ${
                    active
                      ? "bg-purple-500 text-white shadow-sm shadow-purple-200"
                      : "bg-purple-50 text-purple-500 ring-1 ring-purple-100"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <FieldLabel>Thời lượng</FieldLabel>
          <div className="flex h-10 items-center rounded-3xl bg-slate-50 px-3 ring-1 ring-slate-100">
            <input
              value={hours}
              onChange={(event) =>
                setHours(normalizeDuration(event.target.value))
              }
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
            />
            <span className="text-[11px] font-black text-slate-400">giờ</span>
          </div>
        </label>

        {activeSleepSession ? (
          <div className="rounded-3xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Thời lượng timer
                </p>
                <p className="mt-0.5 text-sm font-black text-slate-700">
                  {formatElapsedDuration(activeSleepSession.startAt, now)}
                </p>
              </div>

              <span className="rounded-2xl bg-white px-3 py-1 text-xs font-black text-purple-500 ring-1 ring-purple-100">
                {timerDurationHours.toFixed(2)} giờ
              </span>
            </div>
          </div>
        ) : null}

        <div>
          <FieldLabel>Chất lượng ngủ</FieldLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {SLEEP_QUALITIES.map((item) => {
              const active = quality === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuality(item.id)}
                  aria-label={item.label}
                  title={item.label}
                  className={`flex h-11 items-center justify-center rounded-2xl text-xl transition ${
                    active
                      ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                      : "bg-purple-50 text-slate-600 ring-1 ring-purple-100"
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>

          <p className="mt-1 text-center text-[10px] font-black text-slate-400">
            {selectedQuality?.label}
          </p>
        </div>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: ngủ sâu, khó vào giấc..."
            className="min-h-14 w-full rounded-3xl bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <div className="sticky bottom-0 -mx-3.5 bg-white px-3.5 pb-1 pt-1.5 sm:-mx-4 sm:px-4">
          <PrimaryButton disabled={!canSave}>Lưu giấc ngủ</PrimaryButton>
        </div>
      </form>
    </ActivitySheetShell>
  );
}
