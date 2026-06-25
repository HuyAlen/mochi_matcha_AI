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

export default function MealQuickAdd() {
  const closeModal = useQuickAddStore((s) => s.closeModal);
  const showToast = useQuickAddStore((s) => s.showToast);
  const addEntry = useTrackingStore((s) => s.addEntry);

  const [babyId, setBabyId] = useState<BabyId>("mochi");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("120");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (isSaving) return;

    const mealCalories = Number(calories);

    if (!mealName.trim()) {
      showToast("Nhập tên món ăn trước khi lưu", "error");
      return;
    }

    if (!Number.isFinite(mealCalories) || mealCalories < 0) {
      showToast("Nhập calories hợp lệ trước khi lưu", "error");
      return;
    }

    setIsSaving(true);

    addEntry({
      babyId,
      type: "meal",
      value: mealCalories,
      unit: "kcal",
      note: mealName.trim(),
    });

    if (typeof window !== "undefined") {
      window.navigator.vibrate?.(20);
    }

    showToast(`Đã ghi nhận bữa ăn cho ${babyNames[babyId]}`);
    setMealName("");
    setCalories("120");
    closeModal();
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl ring-1 ring-amber-100">
            🥣
          </div>

          <div>
            <h3 className="font-black text-slate-950">Ghi nhận bữa ăn</h3>
            <p className="text-sm text-slate-400">
              Cập nhật nhanh ngay trên Dashboard
            </p>

            <p className="text-xs font-semibold text-amber-500">
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
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-70"
        >
          <option value="mochi">🎀 Mochi</option>
          <option value="matcha">🌸 Matcha</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Tên món ăn
        </label>

        <input
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="Ví dụ: cháo bí đỏ, bơ nghiền..."
          disabled={isSaving}
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-70"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Calories (kcal)
        </label>

        <input
          type="number"
          min="0"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories"
          disabled={isSaving}
          className="w-full rounded-2xl border-0 bg-slate-50 p-4 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-70"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Đang lưu..." : "🥣 Lưu bữa ăn"}
      </button>
    </div>
  );
}
