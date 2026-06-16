import { babies } from "@/src/store/babyStore";
import type { BabyId } from "@/types/baby";

interface VaccineBabySelectorProps {
  selectedBabyId: BabyId;
  onChange: (babyId: BabyId) => void;
}

export default function VaccineBabySelector({
  selectedBabyId,
  onChange,
}: VaccineBabySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {babies.map((baby) => (
        <button
          key={baby.id}
          type="button"
          onClick={() => onChange(baby.id)}
          className={`rounded-3xl p-4 text-left shadow-sm ring-1 transition ${
            selectedBabyId === baby.id
              ? "bg-pink-50 ring-pink-300"
              : "bg-lime-50 ring-lime-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-white text-3xl">
              {baby.avatarEmoji}
            </div>
            <p className="font-black text-slate-900">{baby.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
