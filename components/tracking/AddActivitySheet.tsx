"use client";

import type { BabyId } from "@/types/baby";
import type { TrackingType } from "@/types/tracking";

const babyMeta: Record<BabyId, { name: string; emoji: string }> = {
  mochi: { name: "Mochi", emoji: "🎀" },
  matcha: { name: "Matcha", emoji: "🌸" },
};

const activityOptions: {
  type: TrackingType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    type: "milk",
    label: "Sữa",
    icon: "🍼",
    description: "Lượng sữa",
  },
  {
    type: "sleep",
    label: "Ngủ",
    icon: "😴",
    description: "Thời lượng",
  },
  {
    type: "meal",
    label: "Ăn dặm",
    icon: "🥣",
    description: "Bữa ăn",
  },
  {
    type: "diaper",
    label: "Tã",
    icon: "🧷",
    description: "Tã ướt/bẩn",
  },
  {
    type: "mood",
    label: "Tâm trạng",
    icon: "😊",
    description: "Vui, quấy, buồn ngủ",
  },
  {
    type: "temperature",
    label: "Nhiệt độ",
    icon: "🌡️",
    description: "Theo dõi sốt",
  },
  {
    type: "medicine",
    label: "Thuốc",
    icon: "💊",
    description: "Liều dùng",
  },
];

interface AddActivitySheetProps {
  open: boolean;
  selectedBabyId: BabyId;
  onBabyChange: (babyId: BabyId) => void;
  onClose: () => void;
  onSelectActivity: (type: TrackingType) => void;
}

export default function AddActivitySheet({
  open,
  selectedBabyId,
  onBabyChange,
  onClose,
  onSelectActivity,
}: AddActivitySheetProps) {
  if (!open) return null;

  const selectedBaby = babyMeta[selectedBabyId];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/30 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Quick add
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              Ghi gì cho {selectedBaby.name}?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(babyMeta) as BabyId[]).map((babyId) => {
            const baby = babyMeta[babyId];

            return (
              <button
                key={babyId}
                type="button"
                onClick={() => onBabyChange(babyId)}
                className={`rounded-3xl p-3 text-left ring-1 transition ${
                  selectedBabyId === babyId
                    ? "bg-pink-50 ring-pink-300"
                    : "bg-slate-50 ring-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    {baby.emoji}
                  </span>
                  <span className="font-black text-slate-900">{baby.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {activityOptions.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectActivity(item.type)}
              className="rounded-3xl bg-slate-50 p-4 text-left transition active:scale-[0.98]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                {item.icon}
              </span>
              <p className="mt-3 font-black text-slate-950">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-slate-50 py-3 text-sm font-bold text-slate-500"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
