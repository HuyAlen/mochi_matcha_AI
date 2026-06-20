"use client";

import { useBabyStore } from "@/src/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";
import type { TrackingType } from "@/types/tracking";

function getBabyDisplayName(baby: Baby) {
  return baby.nickname?.trim() || baby.name?.trim() || "Bé";
}

function getBabyAvatar(baby: Baby) {
  return baby.avatarEmoji?.trim() || "👶";
}

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
    label: "Vaccine",
    icon: "💉",
    description: "Mũi tiêm hoặc thuốc",
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
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const selectedBaby =
    babyProfiles.find((baby) => baby.id === selectedBabyId) ?? babyProfiles[0];
  const selectedBabyName = selectedBaby
    ? getBabyDisplayName(selectedBaby)
    : "bé";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/20 px-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Đóng ghi nhanh"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-4 shadow-[0_20px_60px_rgba(236,72,153,0.22)] ring-1 ring-pink-100">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-pink-100" />

        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Quick add
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-950">
              Ghi gì cho {selectedBabyName}?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-black text-pink-500 ring-1 ring-pink-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {babyProfiles.map((baby) => (
            <button
              key={baby.id}
              type="button"
              onClick={() => onBabyChange(baby.id)}
              className={`rounded-[1.35rem] p-3 text-left ring-1 transition active:scale-[0.98] ${
                selectedBabyId === baby.id
                  ? "bg-pink-50 ring-pink-300"
                  : "bg-slate-50 ring-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {getBabyAvatar(baby)}
                </span>
                <span className="font-black text-slate-900">
                  {getBabyDisplayName(baby)}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {activityOptions.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectActivity(item.type)}
              className="rounded-[1.35rem] bg-pink-50/70 p-3 text-left ring-1 ring-pink-100 transition active:scale-[0.98]"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                {item.icon}
              </span>
              <p className="mt-2 text-sm font-black text-slate-950">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
