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

export default function VaccineActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const [vaccineName, setVaccineName] = useState("Vaccine");
  const [note, setNote] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      babyId,
      type: "medicine",
      value: 1,
      unit: "lần",
      note: [vaccineName.trim(), note.trim()].filter(Boolean).join(" · "),
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Vaccine"
      title="Ghi nhận vaccine"
      icon="💉"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <BabySelector value={babyId} onChange={onBabyChange} />

        <label className="block">
          <FieldLabel>Tên vaccine</FieldLabel>
          <input
            value={vaccineName}
            onChange={(event) => setVaccineName(event.target.value)}
            placeholder="Ví dụ: 6in1, Rotavirus..."
            className="w-full rounded-3xl bg-slate-50 px-4 py-3 text-base font-black text-slate-950 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: mũi 1, sau tiêm hơi sốt..."
            className="min-h-20 w-full rounded-3xl bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <PrimaryButton>Lưu vaccine</PrimaryButton>
      </form>
    </ActivitySheetShell>
  );
}
