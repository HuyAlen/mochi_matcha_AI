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

export default function MilkQuickAdd() {
  const closeModal = useQuickAddStore((s) => s.closeModal);
  const showToast = useQuickAddStore((s) => s.showToast);
  const addEntry = useTrackingStore((s) => s.addEntry);

  const [babyId, setBabyId] = useState<BabyId>("mochi");
  const [amount, setAmount] = useState("120");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (isSaving) return;

    const milkAmount = Number(amount);

    if (!Number.isFinite(milkAmount) || milkAmount <= 0) {
      showToast("Nhập lượng sữa hợp lệ trước khi lưu", "error");
      return;
    }

    setIsSaving(true);

    addEntry({
      babyId,
      type: "milk",
      value: milkAmount,
      unit: "ml",
      note: note.trim(),
    });

    if (typeof window !== "undefined") {
      window.navigator.vibrate?.(20);
    }

    showToast(`Đã ghi nhận cữ bú cho ${babyNames[babyId]}`);
    setAmount("120");
    setNote("");
    closeModal();
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-2xl ring-1 ring-pink-100">
            🍼
          </div>

          <div>
            <h3 className="font-black text-slate-950">Ghi nhận cữ bú</h3>

            <p className="text-sm text-slate-400">
              Cập nhật nhanh ngay trên Dashboard
            </p>

            <p className="text-xs font-semibold text-pink-500">
              Hôm nay • {formatNow()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
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
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Bé
        </label>

        <select
          value={babyId}
          onChange={(e) => setBabyId(e.target.value as BabyId)}
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            p-4
            ring-1
            ring-slate-100
            focus:outline-none
            focus:ring-2
            focus:ring-pink-300
            disabled:opacity-70
          "
        >
          <option value="mochi">🎀 Mochi</option>
          <option value="matcha">🌸 Matcha</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Lượng sữa (ml)
        </label>

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="120"
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            p-4
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
        <label className="mb-2 block text-sm font-bold text-slate-600">
          Ghi chú
        </label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: bú hết bình, bú hơi chậm..."
          rows={4}
          disabled={isSaving}
          className="
            w-full
            rounded-2xl
            border-0
            bg-slate-50
            p-4
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
        onClick={handleSave}
        disabled={isSaving}
        className="
          h-12
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
        {isSaving ? "Đang lưu..." : "🍼 Lưu cữ bú"}
      </button>
    </div>
  );
}
