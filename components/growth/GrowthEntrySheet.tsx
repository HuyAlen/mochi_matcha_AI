"use client";

import { X } from "lucide-react";

type GrowthDraft = {
  date: string;
  weightKg: string;
  heightCm: string;
  headCircumferenceCm: string;
};

interface GrowthEntrySheetProps {
  displayName: string;
  draft: GrowthDraft;
  isEditing: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: <K extends keyof GrowthDraft>(
    key: K,
    value: GrowthDraft[K],
  ) => void;
}

export default function GrowthEntrySheet({
  displayName,
  draft,
  isEditing,
  isSaving,
  onClose,
  onSave,
  onChange,
}: GrowthEntrySheetProps) {
  return (
    <div className="space-y-4">
      <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-xl ring-1 ring-pink-100">
            📏
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              {isEditing ? "Sửa chỉ số đo" : "Thêm chỉ số đo"}
            </h3>

            <p className="text-sm font-medium text-slate-400">
              Cập nhật tăng trưởng cho {displayName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-slate-50
            ring-1
            ring-slate-100
            transition
            active:scale-95
            disabled:opacity-50
          "
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Ngày đo
        </label>

        <input
          type="date"
          value={draft.date}
          onChange={(event) => onChange("date", event.target.value)}
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            px-4 py-3
            ring-1
            ring-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-pink-300
            disabled:opacity-70
          "
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Cân nặng (kg)
        </label>

        <input
          inputMode="decimal"
          value={draft.weightKg}
          onChange={(event) => onChange("weightKg", event.target.value)}
          placeholder="Ví dụ: 7.2"
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            px-4 py-3
            ring-1
            ring-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-pink-300
            disabled:opacity-70
          "
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Chiều cao (cm)
        </label>

        <input
          inputMode="decimal"
          value={draft.heightCm}
          onChange={(event) => onChange("heightCm", event.target.value)}
          placeholder="Ví dụ: 68.5"
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            px-4 py-3
            ring-1
            ring-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-pink-300
            disabled:opacity-70
          "
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-600">
          Vòng đầu (cm)
        </label>

        <input
          inputMode="decimal"
          value={draft.headCircumferenceCm}
          onChange={(event) =>
            onChange("headCircumferenceCm", event.target.value)
          }
          placeholder="Ví dụ: 43"
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            px-4 py-3
            ring-1
            ring-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-pink-300
            disabled:opacity-70
          "
        />
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="
          h-11
          w-full
          rounded-2xl
          bg-gradient-to-r
          from-pink-500
          to-purple-500
          font-black
          text-white
          shadow-sm
          transition
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        {isSaving
          ? "Đang lưu..."
          : isEditing
            ? "📏 Lưu thay đổi"
            : "📏 Lưu chỉ số"}
      </button>
    </div>
  );
}
