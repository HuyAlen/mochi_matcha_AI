"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTrackingStore } from "@/src/store/trackingStore";
import { useQuickAddStore } from "@/src/store/quickAddStore";
import type { BabyId } from "@/types/baby";

const babyNames: Record<BabyId, string> = {
  mochi: "Mochi",
  matcha: "Matcha",
};

const diaperLabels: Record<string, string> = {
  wet: "Tã ướt",
  dirty: "Tã bẩn",
  mixed: "Tã ướt và bẩn",
};

function formatNow() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DiaperQuickAdd() {
  const closeModal = useQuickAddStore((s) => s.closeModal);
  const showToast = useQuickAddStore((s) => s.showToast);
  const addEntry = useTrackingStore((s) => s.addEntry);

  const [babyId, setBabyId] = useState<BabyId>("mochi");
  const [diaperType, setDiaperType] = useState("wet");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (isSaving) return;

    setIsSaving(true);

    addEntry({
      babyId,
      type: "diaper",
      value: 1,
      unit: "lần",
      note: diaperLabels[diaperType] ?? diaperType,
    });

    if (typeof window !== "undefined") {
      window.navigator.vibrate?.(20);
    }

    showToast(`Đã ghi nhận thay tã cho ${babyNames[babyId]}`);
    setDiaperType("wet");
    closeModal();
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl ring-1 ring-slate-200">
            🧷
          </div>

          <div>
            <h3 className="font-black text-slate-950">Ghi nhận thay tã</h3>
            <p className="text-sm text-slate-400">
              Cập nhật nhanh ngay trên Dashboard
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Hôm nay • {formatNow()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          disabled={isSaving}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100 transition active:scale-95 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Bé
        </label>

        <select
          value={babyId}
          onChange={(e) => setBabyId(e.target.value as BabyId)}
          disabled={isSaving}
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-70"
        >
          <option value="mochi">🎀 Mochi</option>
          <option value="matcha">🌸 Matcha</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Loại thay tã
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "wet", label: "💧 Ướt" },
            { value: "dirty", label: "💩 Bẩn" },
            { value: "mixed", label: "🍼 Cả hai" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDiaperType(item.value)}
              disabled={isSaving}
              className={`rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-70 ${
                diaperType === item.value
                  ? "bg-pink-500 text-white"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="h-12 w-full rounded-2xl bg-gradient-to-r from-slate-500 to-slate-700 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Đang lưu..." : "🧷 Lưu thay tã"}
      </button>
    </div>
  );
}
