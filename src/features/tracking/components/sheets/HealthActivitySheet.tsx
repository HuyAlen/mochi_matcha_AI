"use client";

import { useState } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
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

export default function HealthActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const [temperature, setTemperature] = useState("37.0");
  const [symptom, setSymptom] = useState("Bình thường");
  const [note, setNote] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      babyId,
      type: "temperature",
      value: Number(temperature || 0),
      unit: "°C",
      note: [symptom, note.trim()].filter(Boolean).join(" · "),
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Sức khỏe"
      title="Nhiệt độ"
      icon="🌡️"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <BabySelector value={babyId} onChange={onBabyChange} />

        <label className="block">
          <FieldLabel>Nhiệt độ</FieldLabel>
          <div className="flex items-center rounded-3xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-100">
            <input
              value={temperature}
              onChange={(event) => setTemperature(event.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-xl font-black text-slate-950 outline-none"
            />
            <span className="text-sm font-black text-slate-400">°C</span>
          </div>
        </label>

        <label className="block">
          <FieldLabel>Tình trạng</FieldLabel>
          <select
            value={symptom}
            onChange={(event) => setSymptom(event.target.value)}
            className="w-full rounded-3xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none ring-1 ring-slate-100"
          >
            {["Bình thường", "Hơi nóng", "Sốt", "Ho", "Sổ mũi", "Khó chịu"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: đo sau khi ngủ dậy..."
            className="min-h-20 w-full rounded-3xl bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <PrimaryButton>Lưu sức khỏe</PrimaryButton>
      </form>
    </ActivitySheetShell>
  );
}
