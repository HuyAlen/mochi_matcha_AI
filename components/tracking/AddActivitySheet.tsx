"use client";

import { babies } from "@/src/store/babyStore";
import type { BabyId } from "@/types/baby";
import type { TrackingType } from "@/types/tracking";

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
    description: "Lượng sữa, loại sữa, thời gian",
  },
  {
    type: "sleep",
    label: "Ngủ",
    icon: "🌙",
    description: "Thời lượng giấc ngủ",
  },
  {
    type: "meal",
    label: "Ăn dặm",
    icon: "🥣",
    description: "Bữa ăn, lượng ăn",
  },
  { type: "diaper", label: "Tã", icon: "🧷", description: "Tã ướt, tã bẩn" },
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
    description: "Liều dùng, ghi chú",
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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/30 px-3 pb-3 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-950">Thêm ghi nhận</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {babies.map((baby) => (
            <button
              key={baby.id}
              type="button"
              onClick={() => onBabyChange(baby.id)}
              className={`rounded-3xl p-3 text-left ring-1 transition ${
                selectedBabyId === baby.id
                  ? "bg-pink-50 ring-pink-300"
                  : "bg-lime-50 ring-lime-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-2xl">
                  {baby.avatarEmoji}
                </span>
                <span className="font-black text-slate-900">{baby.name}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {activityOptions.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectActivity(item.type)}
              className="flex w-full items-center justify-between rounded-3xl bg-slate-50 p-4 text-left transition hover:bg-pink-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {item.icon}
                </span>
                <div>
                  <p className="font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
              <span className="text-slate-300">›</span>
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
