"use client";

import { useMemo } from "react";

import { useBabyStore } from "@/src/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";

interface VaccineBabySelectorProps {
  selectedBabyId?: BabyId;
  onChange?: (babyId: BabyId) => void;
}

function getDisplayName(baby: Baby) {
  return baby.nickname?.trim() || baby.name?.trim() || baby.id;
}

function BabyAvatar({ baby, selected }: { baby: Baby; selected: boolean }) {
  const avatarUrl = baby.avatarUrl?.trim();

  if (avatarUrl) {
    return (
      <span
        className={`size-9 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-2 ${
          selected ? "ring-white/70" : "ring-white"
        }`}
      >
        <img
          src={avatarUrl}
          alt={getDisplayName(baby)}
          className="size-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-2 ${
        selected ? "ring-white/70" : "ring-white"
      }`}
      aria-hidden="true"
    >
      {baby.avatarEmoji || "👶"}
    </span>
  );
}

export default function VaccineBabySelector({
  selectedBabyId: controlledSelectedBabyId,
  onChange,
}: VaccineBabySelectorProps) {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const storeSelectedBabyId = useBabyStore((state) => state.selectedBabyId);
  const setSelectedBabyId = useBabyStore((state) => state.setSelectedBabyId);

  const selectedBabyId = controlledSelectedBabyId ?? storeSelectedBabyId;

  const babies = useMemo(
    () =>
      babyProfiles.filter(
        (baby) => baby.id === "mochi" || baby.id === "matcha",
      ),
    [babyProfiles],
  );

  const handleSelect = (babyId: BabyId) => {
    setSelectedBabyId(babyId);
    onChange?.(babyId);
  };

  return (
    <section className="rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-pink-100/80">
      <div className="grid grid-cols-2 gap-2">
        {babies.map((baby) => {
          const isSelected = selectedBabyId === baby.id;
          const displayName = getDisplayName(baby);

          return (
            <button
              key={baby.id}
              type="button"
              onClick={() => handleSelect(baby.id)}
              className={`flex min-h-[4.1rem] items-center justify-center gap-3 rounded-[1.45rem] px-4 text-center transition active:scale-[0.98] ${
                isSelected
                  ? "bg-pink-500 text-white shadow-sm"
                  : "bg-pink-50/50 text-slate-500 hover:bg-pink-50"
              }`}
              aria-pressed={isSelected}
            >
              <BabyAvatar baby={baby} selected={isSelected} />
              <span
                className={`min-w-0 truncate text-lg font-black leading-none ${
                  isSelected ? "text-white" : "text-slate-500"
                }`}
              >
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
