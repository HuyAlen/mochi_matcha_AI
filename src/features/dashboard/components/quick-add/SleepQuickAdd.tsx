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

function formatNow() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SleepQuickAdd() {
  const closeModal = useQuickAddStore((s) => s.closeModal);
  const showToast = useQuickAddStore((s) => s.showToast);
  const addEntry = useTrackingStore((s) => s.addEntry);

  const [babyId, setBabyId] = useState<BabyId>("mochi");
  const [hours, setHours] = useState("1.5");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (isSaving) return;

    const sleepHours = Number(hours);

    if (!Number.isFinite(sleepHours) || sleepHours <= 0) {
      showToast("Nhập thời lượng ngủ hợp lệ trước khi lưu", "error");
      return;
    }

    setIsSaving(true);

    addEntry({
      babyId,
      type: "sleep",
      value: sleepHours,
      unit: "h",
      note: note.trim(),
    });

    if (typeof window !== "undefined") {
      window.navigator.vibrate?.(20);
    }

    showToast(`Đã ghi nhận giấc ngủ cho ${babyNames[babyId]}`);
    setHours("1.5");
    setNote("");
    closeModal();
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl ring-1 ring-purple-100">
            🌙
          </div>

          <div>
            <h3 className="font-black text-slate-950">Ghi nhận giấc ngủ</h3>
            <p className="text-sm text-slate-400">
              Cập nhật nhanh ngay trên Dashboard
            </p>
            <p className="text-xs font-semibold text-purple-500">
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
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-70"
        >
          <option value="mochi">🎀 Mochi</option>
          <option value="matcha">🌸 Matcha</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Thời lượng ngủ (giờ)
        </label>

        <input
          type="number"
          min="0.1"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          disabled={isSaving}
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-70"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Ghi chú
        </label>

        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: ngủ sâu, dễ tỉnh giấc..."
          disabled={isSaving}
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-70"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="h-12 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Đang lưu..." : "🌙 Lưu giấc ngủ"}
      </button>
    </div>
  );
}
