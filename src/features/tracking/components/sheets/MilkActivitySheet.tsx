"use client";

import { useEffect, useMemo, useState } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import {
  formatElapsedDuration,
  formatElapsedTime,
  getElapsedMinutes,
  useTimerStore,
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

type MilkStatus = "finish" | "leftover" | "spitup";

const MILK_TYPES = [
  "Sữa công thức",
  "Sữa tươi",
  "Sữa chua uống",
  "Khác",
] as const;
const MILK_PRESETS = [60, 90, 120, 150, 180];

const MILK_STATUSES: Array<{
  id: MilkStatus;
  label: string;
  icon: string;
}> = [
  { id: "finish", label: "Uống hết", icon: "✅" },
  { id: "leftover", label: "Còn sữa", icon: "🍼" },
  { id: "spitup", label: "Ọc sữa", icon: "🤍" },
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

function formatLastFeedTime(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "";

  const diffMinutes = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 60000),
  );

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    return remainingMinutes > 0
      ? `${diffHours} giờ ${remainingMinutes} phút trước`
      : `${diffHours} giờ trước`;
  }

  return formatTime24(createdAt);
}

function buildTimerNote({
  milkType,
  startAt,
  endAt,
  durationMinutes,
  statusLabels,
  note,
}: {
  milkType: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  statusLabels: string[];
  note: string;
}) {
  return [
    milkType,
    `Uống lúc ${formatTime24(startAt)}`,
    `Kết thúc ${formatTime24(endAt)}`,
    `${durationMinutes} phút`,
    statusLabels.length > 0 ? statusLabels.join(", ") : "",
    note.trim(),
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function MilkActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const entries = useTrackingStore((state) => state.entries);
  const activeMilkSession = useTimerStore(
    (state) => state.activeMilkSessions[babyId],
  );
  const startMilkTimer = useTimerStore((state) => state.startMilkTimer);
  const stopMilkTimer = useTimerStore((state) => state.stopMilkTimer);
  const cancelMilkTimer = useTimerStore((state) => state.cancelMilkTimer);

  const [amount, setAmount] = useState("120");
  const [milkType, setMilkType] =
    useState<(typeof MILK_TYPES)[number]>("Sữa công thức");
  const [startTime, setStartTime] = useState(getCurrentTime);
  const [duration, setDuration] = useState("15");
  const [statuses, setStatuses] = useState<MilkStatus[]>(["finish"]);
  const [note, setNote] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeMilkSession) return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeMilkSession]);

  const selectedAmount = useMemo(() => Number(amount || 0), [amount]);
  const canSave = selectedAmount > 0;

  const statusLabels = useMemo(() => {
    return statuses
      .map((status) => MILK_STATUSES.find((item) => item.id === status)?.label)
      .filter(Boolean) as string[];
  }, [statuses]);

  const lastFeed = useMemo(() => {
    return entries
      .filter((entry) => entry.babyId === babyId && entry.type === "milk")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
  }, [babyId, entries]);

  function toggleStatus(status: MilkStatus) {
    setStatuses((current) => {
      if (current.includes(status)) {
        return current.filter((item) => item !== status);
      }

      if (status === "finish") {
        return ["finish"];
      }

      return [...current.filter((item) => item !== "finish"), status];
    });
  }

  function handleStartTimer() {
    startMilkTimer(babyId);
    setStartTime(getCurrentTime());
  }

  function handleStopTimer() {
    if (!canSave) return;

    const session = stopMilkTimer(babyId);

    if (!session) return;

    const endAt = new Date().toISOString();
    const durationMinutes = Math.max(
      1,
      Math.round(getElapsedMinutes(session.startAt)),
    );

    setDuration(String(durationMinutes));

    onSave({
      babyId,
      type: "milk",
      value: selectedAmount,
      unit: "ml",
      note: buildTimerNote({
        milkType,
        startAt: session.startAt,
        endAt,
        durationMinutes,
        statusLabels,
        note,
      }),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const details = [
      milkType,
      startTime ? `Uống lúc ${startTime}` : "",
      duration ? `${duration} phút` : "",
      statusLabels.length > 0 ? statusLabels.join(", ") : "",
      note.trim(),
    ]
      .filter(Boolean)
      .join(" · ");

    onSave({
      babyId,
      type: "milk",
      value: selectedAmount,
      unit: "ml",
      note: details,
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Ghi nhanh"
      title="Sữa"
      icon="🍼"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <BabySelector value={babyId} onChange={onBabyChange} />

        {activeMilkSession ? (
          <section className="rounded-3xl bg-pink-500 p-3 text-white shadow-lg shadow-pink-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-100">
                  Đang uống sữa
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums leading-none">
                  {formatElapsedTime(activeMilkSession.startAt, now)}
                </p>
                <p className="mt-1 text-xs font-bold text-pink-100">
                  Bắt đầu {formatTime24(activeMilkSession.startAt)} ·{" "}
                  {formatElapsedDuration(activeMilkSession.startAt, now)}
                </p>
              </div>

              <span className="rounded-2xl bg-white/15 px-3 py-1.5 text-sm font-black">
                🍼
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStopTimer}
                disabled={!canSave}
                className={`h-11 rounded-2xl text-sm font-black shadow-sm transition active:scale-[0.99] ${
                  canSave
                    ? "bg-white text-pink-600"
                    : "bg-white/30 text-pink-100"
                }`}
              >
                Kết thúc & lưu
              </button>

              <button
                type="button"
                onClick={() => cancelMilkTimer(babyId)}
                className="h-11 rounded-2xl bg-pink-400/60 text-sm font-black text-white ring-1 ring-white/20 transition active:scale-[0.99]"
              >
                Hủy timer
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-pink-50 p-3 ring-1 ring-pink-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-400">
                  Timer uống sữa
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  Bấm bắt đầu khi bé uống, Mind AI sẽ tự tính thời lượng.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartTimer}
                className="h-10 shrink-0 rounded-2xl bg-pink-500 px-4 text-sm font-black text-white shadow-sm shadow-pink-200 transition active:scale-[0.99]"
              >
                ▶ Bắt đầu
              </button>
            </div>
          </section>
        )}

        {lastFeed ? (
          <div className="rounded-3xl bg-pink-50 px-3 py-2 ring-1 ring-pink-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-400">
                  Lần trước
                </p>
                <p className="mt-0.5 text-xs font-black text-slate-700">
                  {formatTime24(lastFeed.createdAt)} ·{" "}
                  {formatLastFeedTime(lastFeed.createdAt)}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl bg-white px-3 py-1.5 text-sm font-black text-pink-500 shadow-sm">
                {Number(lastFeed.value ?? 0)}
                {lastFeed.unit || "ml"}
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <FieldLabel>Loại sữa</FieldLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {MILK_TYPES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMilkType(item)}
                className={`h-9 rounded-2xl px-2 text-[11px] font-black transition ${
                  milkType === item
                    ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                    : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <FieldLabel>Thời gian</FieldLabel>
            <div className="flex h-10 items-center rounded-3xl bg-slate-50 px-3 ring-1 ring-slate-100">
              <input
                type="text"
                value={startTime}
                onChange={(event) =>
                  setStartTime(normalizeTime(event.target.value))
                }
                inputMode="numeric"
                placeholder="07:15"
                className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
              />
              <span className="text-xs text-slate-400">⏰</span>
            </div>
          </label>

          <label className="block">
            <FieldLabel>Thời lượng</FieldLabel>
            <div className="flex h-10 items-center rounded-3xl bg-slate-50 px-3 ring-1 ring-slate-100">
              <input
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value.replace(/[^0-9]/g, ""))
                }
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
              />
              <span className="text-[11px] font-black text-slate-400">
                phút
              </span>
            </div>
          </label>
        </div>

        <div>
          <FieldLabel>Lượng nhanh</FieldLabel>
          <div className="grid grid-cols-5 gap-1.5">
            {MILK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`h-9 rounded-2xl px-2 text-xs font-black transition ${
                  selectedAmount === preset
                    ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                    : "bg-pink-50 text-pink-500 ring-1 ring-pink-100"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <FieldLabel>Lượng sữa</FieldLabel>
          <div className="flex h-10 items-center rounded-3xl bg-slate-50 px-3 ring-1 ring-slate-100">
            <input
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value.replace(/[^0-9.]/g, ""))
              }
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-950 outline-none"
            />
            <span className="text-xs font-black text-slate-400">ml</span>
          </div>
        </label>

        <div>
          <FieldLabel>Tình trạng</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {MILK_STATUSES.map((item) => {
              const active = statuses.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className={`h-9 rounded-2xl px-2 text-[11px] font-black transition ${
                    active
                      ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: bé uống tốt, hơi ọc sữa..."
            className="min-h-14 w-full rounded-3xl bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <div className="sticky bottom-0 -mx-3.5 bg-white px-3.5 pb-1 pt-1.5 sm:-mx-4 sm:px-4">
          <PrimaryButton disabled={!canSave}>Lưu cữ sữa</PrimaryButton>
        </div>
      </form>
    </ActivitySheetShell>
  );
}
