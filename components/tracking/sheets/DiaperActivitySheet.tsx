"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
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

type DiaperType = "wet" | "dirty" | "both" | "dry";
type StoolColor = "yellow" | "green" | "brown" | "other";
type DiaperAmount = "Ít" | "Vừa" | "Nhiều";
type DiaperCondition = "normal" | "constipation" | "diarrhea" | "watch";

const DIAPER_TYPES: Array<{
  id: DiaperType;
  label: string;
  shortLabel: string;
  icon: string;
}> = [
  { id: "wet", label: "Tã ướt", shortLabel: "Ướt", icon: "💧" },
  { id: "dirty", label: "Tã bẩn", shortLabel: "Bẩn", icon: "💩" },
  { id: "both", label: "Ướt + bẩn", shortLabel: "Cả hai", icon: "💧💩" },
  { id: "dry", label: "Tã khô", shortLabel: "Khô", icon: "🧷" },
];

const STOOL_COLORS: Array<{
  id: StoolColor;
  label: string;
  icon: string;
}> = [
  { id: "yellow", label: "Vàng", icon: "🟡" },
  { id: "green", label: "Xanh", icon: "🟢" },
  { id: "brown", label: "Nâu", icon: "🟤" },
  { id: "other", label: "Khác", icon: "⚫" },
];

const DIAPER_AMOUNTS: DiaperAmount[] = ["Ít", "Vừa", "Nhiều"];

const DIAPER_CONDITIONS: Array<{
  id: DiaperCondition;
  label: string;
  icon: string;
}> = [
  { id: "normal", label: "Bình thường", icon: "😊" },
  { id: "constipation", label: "Táo bón", icon: "😖" },
  { id: "diarrhea", label: "Tiêu chảy", icon: "💧" },
  { id: "watch", label: "Theo dõi", icon: "⚠️" },
];

function formatTime24(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getRelativeDay(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfInput = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  const diffDays = Math.round(
    (startOfToday - startOfInput) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getEntryTime(entry: TrackingEntry) {
  const candidate =
    typeof entry.createdAt === "string"
      ? entry.createdAt
      : String(entry.createdAt);

  return candidate;
}

function getDiaperLabel(diaperType: DiaperType) {
  return DIAPER_TYPES.find((item) => item.id === diaperType)?.label ?? "Tã";
}

function getStoolColorLabel(stoolColor: StoolColor) {
  return STOOL_COLORS.find((item) => item.id === stoolColor)?.label ?? "Khác";
}

function getConditionLabel(condition: DiaperCondition) {
  return (
    DIAPER_CONDITIONS.find((item) => item.id === condition)?.label ??
    "Bình thường"
  );
}

export default function DiaperActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const entries = useTrackingStore((state) => state.entries);

  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [stoolColor, setStoolColor] = useState<StoolColor>("yellow");
  const [amount, setAmount] = useState<DiaperAmount>("Vừa");
  const [condition, setCondition] = useState<DiaperCondition>("normal");
  const [note, setNote] = useState("");

  const selectedDiaper = DIAPER_TYPES.find((item) => item.id === diaperType);
  const selectedConditionIndex = DIAPER_CONDITIONS.findIndex(
    (item) => item.id === condition,
  );
  const selectedCondition = DIAPER_CONDITIONS[selectedConditionIndex];

  const shouldShowStoolFields = diaperType === "dirty" || diaperType === "both";

  const lastDiaper = useMemo(() => {
    return entries
      .filter((entry) => entry.babyId === babyId && entry.type === "diaper")
      .sort(
        (a, b) =>
          new Date(getEntryTime(b)).getTime() -
          new Date(getEntryTime(a)).getTime(),
      )[0];
  }, [babyId, entries]);

  const canSave = Boolean(diaperType);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) return;

    const diaperLabel = getDiaperLabel(diaperType);
    const conditionLabel = getConditionLabel(condition);

    const noteParts = [
      diaperLabel,
      shouldShowStoolFields
        ? `Màu phân: ${getStoolColorLabel(stoolColor)}`
        : "",
      `Mức độ: ${amount}`,
      `Tình trạng: ${conditionLabel}`,
      note.trim(),
    ].filter(Boolean);

    onSave({
      babyId,
      type: "diaper",
      value: 1,
      unit: "lần",
      note: noteParts.join(" · "),
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Ghi nhanh"
      title="Thay tã"
      icon="🧷"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <BabySelector value={babyId} onChange={onBabyChange} />

        <div className="rounded-3xl bg-cyan-50/80 p-3 ring-1 ring-cyan-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-500">
                Lần trước
              </p>

              {lastDiaper ? (
                <p className="mt-1 text-sm font-black text-slate-800">
                  {formatTime24(getEntryTime(lastDiaper))} ·{" "}
                  {lastDiaper.note?.split(" · ")[0] || "Thay tã"}
                </p>
              ) : (
                <p className="mt-1 text-sm font-black text-slate-800">
                  Chưa có dữ liệu thay tã
                </p>
              )}
            </div>

            {lastDiaper ? (
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-cyan-600 ring-1 ring-cyan-100">
                {getRelativeDay(getEntryTime(lastDiaper))}
              </span>
            ) : null}
          </div>
        </div>

        <section>
          <FieldLabel>Loại tã</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {DIAPER_TYPES.map((item) => {
              const isSelected = diaperType === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDiaperType(item.id)}
                  className={`flex min-h-14 items-center gap-2 rounded-2xl px-3 py-2 text-left transition ${
                    isSelected
                      ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                      : "bg-cyan-50 text-slate-600 ring-1 ring-cyan-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-black leading-tight">
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {shouldShowStoolFields ? (
          <section>
            <FieldLabel>Màu phân</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {STOOL_COLORS.map((item) => {
                const isSelected = stoolColor === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStoolColor(item.id)}
                    className={`flex h-12 flex-col items-center justify-center rounded-2xl text-[11px] font-black transition ${
                      isSelected
                        ? "bg-amber-400 text-white shadow-md shadow-amber-200"
                        : "bg-amber-50 text-slate-600 ring-1 ring-amber-100"
                    }`}
                    aria-label={item.label}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    <span className="mt-0.5 leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <FieldLabel>Mức độ</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {DIAPER_AMOUNTS.map((item) => {
              const isSelected = amount === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAmount(item)}
                  className={`h-11 rounded-2xl text-sm font-black transition ${
                    isSelected
                      ? "bg-pink-500 text-white shadow-md shadow-pink-200"
                      : "bg-pink-50 text-slate-600 ring-1 ring-pink-100"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <FieldLabel>Tình trạng</FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {DIAPER_CONDITIONS.map((item) => {
              const isSelected = condition === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCondition(item.id)}
                  className={`flex h-12 items-center justify-center rounded-2xl text-2xl transition ${
                    isSelected
                      ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                      : "bg-purple-50 text-slate-600 ring-1 ring-purple-100"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>

          {selectedCondition ? (
            <div className="mt-1 grid grid-cols-4 gap-2">
              <p
                className="text-center text-[11px] font-black text-purple-500"
                style={{
                  gridColumnStart:
                    selectedConditionIndex >= 0
                      ? selectedConditionIndex + 1
                      : 1,
                }}
              >
                {selectedCondition.label}
              </p>
            </div>
          ) : null}
        </section>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: phân vàng, hơi lỏng..."
            className="min-h-16 w-full resize-none rounded-3xl bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300 focus:bg-white focus:ring-cyan-200"
          />
        </label>

        <div className="sticky bottom-0 -mx-1 bg-white/95 pt-1 backdrop-blur">
          <PrimaryButton disabled={!canSave}>Lưu thay tã</PrimaryButton>
        </div>
      </form>
    </ActivitySheetShell>
  );
}
