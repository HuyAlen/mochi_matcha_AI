import { babies } from "@/src/store/babyStore";
import type { BabyId } from "@/types/baby";

interface BabySelectorProps {
  selectedBabyId: BabyId;
  onChange: (babyId: BabyId) => void;
}

export default function BabySelector({
  selectedBabyId,
  onChange,
}: BabySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {babies.map((baby) => (
        <button
          key={baby.id}
          type="button"
          onClick={() => onChange(baby.id)}
          className={`rounded-3xl p-4 text-left ring-1 transition ${
            selectedBabyId === baby.id
              ? "bg-pink-50 ring-pink-300"
              : "bg-white ring-slate-100"
          }`}
        >
          <div className="text-3xl">{baby.avatarEmoji}</div>
          <p className="mt-2 font-bold text-slate-900">{baby.nickname}</p>
        </button>
      ))}
    </div>
  );
}
