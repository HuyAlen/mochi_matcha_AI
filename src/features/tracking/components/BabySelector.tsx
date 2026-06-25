"use client";

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
    <div className="rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-slate-100">
      <div className="grid grid-cols-2 gap-2">
        {babies.map((baby) => {
          const active = selectedBabyId === baby.id;

          return (
            <button
              key={baby.id}
              type="button"
              onClick={() => onChange(baby.id)}
              className={`flex items-center justify-center gap-2 rounded-[1.5rem] px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                active
                  ? "bg-pink-50 text-slate-950 ring-1 ring-pink-200"
                  : "bg-slate-50 text-slate-500 ring-1 ring-transparent"
              }`}
            >
              <span className="text-xl">{baby.avatarEmoji}</span>
              <span>{baby.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
