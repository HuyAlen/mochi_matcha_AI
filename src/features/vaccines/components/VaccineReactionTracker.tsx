"use client";

import type { BabyId } from "@/types/baby";
import type { VaccineReaction, VaccineReactionSeverity } from "@/types/vaccine";

interface VaccineReactionTrackerProps {
  babyId: BabyId;
  recordId?: string;
  babyName?: string;
  onAddReaction: (reaction: Omit<VaccineReaction, "id" | "createdAt">) => void;
}

export default function VaccineReactionTracker({
  babyId,
  recordId,
  babyName = "bé",
  onAddReaction,
}: VaccineReactionTrackerProps) {
  return (
    <form
      className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const symptom = (form.elements.namedItem("symptom") as HTMLInputElement)
          .value;
        const temperatureValue = (
          form.elements.namedItem("temperature") as HTMLInputElement
        ).value;
        const temperature = Number(temperatureValue);
        const severity = (
          form.elements.namedItem("severity") as HTMLSelectElement
        ).value as VaccineReactionSeverity;
        const note = (form.elements.namedItem("note") as HTMLTextAreaElement)
          .value;

        if (!recordId || !symptom.trim()) return;

        onAddReaction({
          babyId,
          vaccineRecordId: recordId,
          symptom: symptom.trim(),
          severity,
          temperature:
            temperatureValue.trim() && Number.isFinite(temperature)
              ? temperature
              : undefined,
          note: note.trim() || undefined,
        });

        form.reset();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
          🌡️
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-pink-400">
            Sau tiêm
          </p>
          <h3 className="mt-1 font-black text-slate-950">
            Theo dõi phản ứng của {babyName}
          </h3>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <input
          name="symptom"
          placeholder="Triệu chứng, ví dụ: sốt nhẹ"
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:font-semibold placeholder:text-slate-400"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="temperature"
            type="number"
            step="0.1"
            placeholder="Nhiệt độ"
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:font-semibold placeholder:text-slate-400"
          />

          <select
            name="severity"
            defaultValue="mild"
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-600 outline-none"
          >
            <option value="mild">Nhẹ</option>
            <option value="moderate">Vừa</option>
            <option value="severe">Nặng</option>
          </select>
        </div>

        <textarea
          name="note"
          rows={3}
          placeholder="Ghi chú thêm..."
          className="w-full resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:font-semibold placeholder:text-slate-400"
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-2xl bg-pink-500 py-3 text-sm font-black text-white shadow-sm shadow-pink-200 transition active:scale-[0.99]"
      >
        Lưu phản ứng
      </button>
    </form>
  );
}
