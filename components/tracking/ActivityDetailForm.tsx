"use client";

import { useMemo, useState } from "react";
import { useBabyStore } from "@/src/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

function getBabyDisplayName(baby: Baby | undefined) {
  return baby?.nickname?.trim() || baby?.name?.trim() || "Bé";
}

function getBabyAvatar(baby: Baby | undefined) {
  return baby?.avatarEmoji?.trim() || "👶";
}

type ActivityConfig = {
  title: string;
  editTitle: string;
  icon: string;
  unit: string;
  defaultValue: number;
  valueLabel: string;
  presets: number[];
  notePlaceholder: string;
  tone: {
    bg: string;
    ring: string;
    text: string;
    chip: string;
    selected: string;
  };
};

const config: Record<TrackingType, ActivityConfig> = {
  milk: {
    title: "Sữa",
    editTitle: "Sửa cữ sữa",
    icon: "🍼",
    unit: "ml",
    defaultValue: 120,
    valueLabel: "Lượng sữa",
    presets: [60, 90, 120, 150, 180, 210],
    notePlaceholder: "Ví dụ: sữa công thức, bắt đầu 10:32, bú hết...",
    tone: {
      bg: "bg-pink-50",
      ring: "ring-pink-100",
      text: "text-pink-600",
      chip: "bg-pink-50 text-pink-600 ring-pink-100",
      selected: "bg-pink-500 text-white shadow-md shadow-pink-200",
    },
  },
  sleep: {
    title: "Giấc ngủ",
    editTitle: "Sửa giấc ngủ",
    icon: "🌙",
    unit: "giờ",
    defaultValue: 1.5,
    valueLabel: "Thời lượng ngủ",
    presets: [0.25, 0.5, 0.75, 1, 1.5, 2],
    notePlaceholder: "Ví dụ: ngủ ngày, ngủ sâu, hơi khó vào giấc...",
    tone: {
      bg: "bg-purple-50",
      ring: "ring-purple-100",
      text: "text-purple-600",
      chip: "bg-purple-50 text-purple-600 ring-purple-100",
      selected: "bg-purple-500 text-white shadow-md shadow-purple-200",
    },
  },
  meal: {
    title: "Ăn dặm",
    editTitle: "Sửa bữa ăn",
    icon: "🥣",
    unit: "bữa",
    defaultValue: 1,
    valueLabel: "Số bữa",
    presets: [1, 2, 3],
    notePlaceholder: "Ví dụ: cháo, ăn vừa, bình thường...",
    tone: {
      bg: "bg-amber-50",
      ring: "ring-amber-100",
      text: "text-amber-600",
      chip: "bg-amber-50 text-amber-600 ring-amber-100",
      selected: "bg-amber-400 text-white shadow-md shadow-amber-200",
    },
  },
  diaper: {
    title: "Thay tã",
    editTitle: "Sửa thay tã",
    icon: "🧷",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Số lần",
    presets: [1, 2, 3, 4],
    notePlaceholder: "Ví dụ: tã ướt, phân vàng, hơi lỏng...",
    tone: {
      bg: "bg-cyan-50",
      ring: "ring-cyan-100",
      text: "text-cyan-600",
      chip: "bg-cyan-50 text-cyan-600 ring-cyan-100",
      selected: "bg-cyan-500 text-white shadow-md shadow-cyan-200",
    },
  },
  temperature: {
    title: "Nhiệt độ",
    editTitle: "Sửa sức khỏe",
    icon: "🌡️",
    unit: "°C",
    defaultValue: 37.2,
    valueLabel: "Nhiệt độ",
    presets: [36.8, 37, 37.2, 37.5, 38],
    notePlaceholder: "Ví dụ: đo sau khi ngủ dậy, bé hơi nóng...",
    tone: {
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
      text: "text-emerald-600",
      chip: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      selected: "bg-emerald-500 text-white shadow-md shadow-emerald-200",
    },
  },
  medicine: {
    title: "Vaccine / thuốc",
    editTitle: "Sửa vaccine / thuốc",
    icon: "💉",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Số lần",
    presets: [1, 2, 3],
    notePlaceholder: "Ví dụ: mũi 1, sau tiêm hơi sốt...",
    tone: {
      bg: "bg-rose-50",
      ring: "ring-rose-100",
      text: "text-rose-600",
      chip: "bg-rose-50 text-rose-600 ring-rose-100",
      selected: "bg-rose-500 text-white shadow-md shadow-rose-200",
    },
  },
  mood: {
    title: "Tâm trạng",
    editTitle: "Sửa tâm trạng",
    icon: "😊",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Ghi nhận",
    presets: [1],
    notePlaceholder: "Ví dụ: vui vẻ, quấy khóc, buồn ngủ...",
    tone: {
      bg: "bg-violet-50",
      ring: "ring-violet-100",
      text: "text-violet-600",
      chip: "bg-violet-50 text-violet-600 ring-violet-100",
      selected: "bg-violet-500 text-white shadow-md shadow-violet-200",
    },
  },
};

interface ActivityDetailFormProps {
  type: TrackingType;
  babyId: BabyId;
  initialEntry?: TrackingEntry | null;
  onBack: () => void;
  onSave: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
}

function formatTime24(dateValue?: string) {
  const date = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatPresetLabel(value: number, unit: string) {
  if (unit === "giờ") {
    if (value < 1) return `${Math.round(value * 60)}m`;
    return `${String(value).replace(".5", ".5")}h`;
  }

  return `${value}${unit}`;
}

function splitNote(note?: string) {
  return (note ?? "")
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildMilkSummary(noteParts: string[]) {
  const milkType = noteParts.find((part) =>
    ["Sữa công thức", "Sữa tươi", "Sữa chua uống", "Khác"].some((keyword) =>
      part.includes(keyword),
    ),
  );

  const startTime = noteParts.find((part) => part.startsWith("Bắt đầu"));
  const duration = noteParts.find((part) => part.includes("phút"));
  const status = noteParts.find((part) =>
    ["Bú hết", "Còn sữa", "Ọc sữa"].some((keyword) => part.includes(keyword)),
  );

  return [
    milkType ? { label: "Loại sữa", value: milkType } : null,
    startTime
      ? { label: "Bắt đầu", value: startTime.replace("Bắt đầu", "").trim() }
      : null,
    duration ? { label: "Thời lượng", value: duration } : null,
    status ? { label: "Tình trạng", value: status } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

export default function ActivityDetailForm({
  type,
  babyId,
  initialEntry,
  onBack,
  onSave,
}: ActivityDetailFormProps) {
  const item = config[type];
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const baby = babyProfiles.find((profile) => profile.id === babyId);
  const babyName = getBabyDisplayName(baby);
  const babyAvatar = getBabyAvatar(baby);

  const [value, setValue] = useState(initialEntry?.value ?? item.defaultValue);
  const [note, setNote] = useState(initialEntry?.note ?? "");

  const noteParts = useMemo(() => splitNote(note), [note]);
  const milkSummary = useMemo(() => buildMilkSummary(noteParts), [noteParts]);
  const displayTime = formatTime24(initialEntry?.createdAt);

  const canSave = Number(value) > 0;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
        <div className="sticky top-0 z-10 -mx-4 bg-pink-50/90 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-black text-slate-700 shadow-sm ring-1 ring-slate-100 active:scale-95"
              aria-label="Quay lại"
            >
              ←
            </button>

            <div className="min-w-0 flex-1 text-center">
              <h2 className="truncate text-base font-black text-slate-950">
                {initialEntry ? item.editTitle : item.title}
              </h2>
            </div>

            <div className="size-10 shrink-0" />
          </div>
        </div>

        <div className="mt-4 rounded-4xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-3xl ${item.tone.bg} text-3xl ring-1 ${item.tone.ring}`}
            >
              {item.icon}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                {initialEntry ? "Đang sửa" : "Ghi nhanh"}
              </p>
              <h3 className="mt-0.5 text-2xl font-black leading-tight text-slate-950">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {babyAvatar} {babyName} • {displayTime}
              </p>
            </div>
          </div>

          {type === "milk" && milkSummary.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {milkSummary.map((summary) => (
                <div
                  key={`${summary.label}-${summary.value}`}
                  className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    {summary.label}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-black text-slate-700">
                    {summary.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <form
          className="mt-4 flex flex-1 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();

            if (!canSave) return;

            onSave({
              babyId,
              type,
              value,
              unit: item.unit,
              note: note.trim() || undefined,
            });
          }}
        >
          <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                {item.valueLabel}
              </span>

              {item.presets.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue(preset)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-black transition active:scale-95 ${
                        value === preset
                          ? item.tone.selected
                          : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
                      }`}
                    >
                      {formatPresetLabel(preset, item.unit)}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex h-12 items-center rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-pink-200">
                <input
                  name="value"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={value}
                  onChange={(event) =>
                    setValue(Number(event.currentTarget.value))
                  }
                  className="min-w-0 flex-1 bg-transparent text-base font-black text-slate-950 outline-none"
                />
                <span className="text-sm font-black text-slate-400">
                  {item.unit}
                </span>
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Ghi chú
              </span>
              <textarea
                name="note"
                rows={4}
                placeholder={item.notePlaceholder}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 min-h-24 w-full resize-none rounded-3xl bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300 focus:bg-white focus:ring-pink-200"
              />
            </label>
          </section>

          <div className="sticky bottom-0 -mx-1 mt-auto bg-white/90 pb-1 pt-2 backdrop-blur">
            <button
              type="submit"
              disabled={!canSave}
              className={`h-13 w-full rounded-3xl text-sm font-black shadow-sm transition active:scale-[0.99] ${
                canSave
                  ? "bg-pink-500 text-white shadow-pink-200"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              {initialEntry ? "Cập nhật ghi nhận" : "Lưu ghi nhận"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="mt-2 h-12 w-full rounded-3xl bg-white text-sm font-black text-slate-500 ring-1 ring-slate-100 transition active:scale-[0.99]"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
