"use client";

import { useState } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

const babyMeta: Record<BabyId, { name: string; emoji: string }> = {
  mochi: { name: "Mochi", emoji: "🎀" },
  matcha: { name: "Matcha", emoji: "🌸" },
};

const config: Record<
  TrackingType,
  {
    title: string;
    icon: string;
    unit: string;
    defaultValue: number;
    valueLabel: string;
    presets: number[];
    notePlaceholder: string;
  }
> = {
  milk: {
    title: "Sữa",
    icon: "🍼",
    unit: "ml",
    defaultValue: 120,
    valueLabel: "Lượng sữa",
    presets: [30, 60, 90, 120, 150, 180],
    notePlaceholder: "Ví dụ: Bé bú tốt, bú bình, sữa công thức...",
  },
  sleep: {
    title: "Ngủ",
    icon: "😴",
    unit: "giờ",
    defaultValue: 1.5,
    valueLabel: "Thời lượng ngủ",
    presets: [0.5, 1, 1.5, 2, 3],
    notePlaceholder: "Ví dụ: Ngủ trưa, ngủ sâu, dễ thức giấc...",
  },
  meal: {
    title: "Ăn dặm",
    icon: "🥣",
    unit: "bữa",
    defaultValue: 1,
    valueLabel: "Số bữa",
    presets: [1, 2, 3],
    notePlaceholder: "Ví dụ: Cháo bí đỏ, ăn tốt, ăn ít...",
  },
  diaper: {
    title: "Tã",
    icon: "🧷",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Số lần",
    presets: [1, 2, 3, 4],
    notePlaceholder: "Ví dụ: Tã ướt, tã bẩn, phân mềm...",
  },
  temperature: {
    title: "Nhiệt độ",
    icon: "🌡️",
    unit: "°C",
    defaultValue: 37.2,
    valueLabel: "Nhiệt độ",
    presets: [36.8, 37.2, 37.5, 38, 38.5],
    notePlaceholder: "Ví dụ: Đo nách, bé hơi nóng, theo dõi thêm...",
  },
  medicine: {
    title: "Thuốc",
    icon: "💊",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Số lần",
    presets: [1, 2, 3],
    notePlaceholder: "Ví dụ: Vitamin D, thuốc theo chỉ định...",
  },
  mood: {
    title: "Tâm trạng",
    icon: "😊",
    unit: "lần",
    defaultValue: 1,
    valueLabel: "Ghi nhận",
    presets: [1],
    notePlaceholder: "Ví dụ: Vui vẻ, quấy khóc, buồn ngủ, khó chịu...",
  },
};

interface ActivityDetailFormProps {
  type: TrackingType;
  babyId: BabyId;
  onBack: () => void;
  onSave: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
}

export default function ActivityDetailForm({
  type,
  babyId,
  onBack,
  onSave,
}: ActivityDetailFormProps) {
  const item = config[type];
  const baby = babyMeta[babyId];
  const [value, setValue] = useState(item.defaultValue);

  return (
    <div className="fixed inset-0 z-[80] bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-pink-50 via-white to-purple-50 px-4 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
            aria-label="Quay lại"
          >
            ←
          </button>
          <h2 className="font-black text-slate-950">{item.title}</h2>
          <div className="size-10" />
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-white text-6xl shadow-sm ring-1 ring-pink-100">
            {item.icon}
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-950">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {baby.emoji} {baby.name} ·{" "}
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            const form = event.currentTarget;
            const noteInput = form.elements.namedItem(
              "note",
            ) as HTMLTextAreaElement;

            onSave({
              babyId,
              type,
              value,
              unit: item.unit,
              note: noteInput.value.trim() || undefined,
            });
          }}
        >
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-bold text-slate-500">Bé</span>
              <span className="font-black text-slate-950">
                {baby.emoji} {baby.name}
              </span>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-500">
                {item.valueLabel}
              </span>

              {item.presets.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setValue(preset)}
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${
                        value === preset
                          ? "bg-pink-500 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {preset}
                      {item.unit}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex items-center rounded-2xl bg-slate-50 px-4 py-3">
                <input
                  name="value"
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    setValue(Number(event.currentTarget.value))
                  }
                  className="min-w-0 flex-1 bg-transparent text-base font-bold text-slate-950 outline-none"
                />
                <span className="text-sm font-bold text-slate-400">
                  {item.unit}
                </span>
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-500">Ghi chú</span>
              <textarea
                name="note"
                rows={4}
                placeholder={item.notePlaceholder}
                className="mt-2 w-full resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-pink-500 py-4 font-black text-white shadow-sm active:scale-[0.99]"
          >
            Lưu ghi nhận
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl bg-white py-4 font-bold text-slate-500 shadow-sm ring-1 ring-slate-100"
          >
            Hủy
          </button>
        </form>
      </div>
    </div>
  );
}
