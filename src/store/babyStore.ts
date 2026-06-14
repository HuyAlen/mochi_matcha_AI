"use client";

import { useMemo, useSyncExternalStore } from "react";
import { demoBabies } from "@/data/demoBabies";
import type { Baby, BabyProfile } from "@/types/baby";

const BABIES_KEY = "be-mind-ai-babies";
const ACTIVE_BABY_KEY = "be-mind-ai-active-baby-id";

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readBabies(): Baby[] {
  if (typeof window === "undefined") return demoBabies;

  const raw = window.localStorage.getItem(BABIES_KEY);

  if (!raw) {
    window.localStorage.setItem(BABIES_KEY, JSON.stringify(demoBabies));
    return demoBabies;
  }

  try {
    return JSON.parse(raw) as Baby[];
  } catch {
    window.localStorage.setItem(BABIES_KEY, JSON.stringify(demoBabies));
    return demoBabies;
  }
}

function readActiveBabyId(): string {
  if (typeof window === "undefined") return demoBabies[0].id;

  const storedId = window.localStorage.getItem(ACTIVE_BABY_KEY);
  const babies = readBabies();
  const exists = babies.some((baby) => baby.id === storedId);

  if (storedId && exists) return storedId;

  window.localStorage.setItem(ACTIVE_BABY_KEY, babies[0].id);
  return babies[0].id;
}

function getSnapshot() {
  return JSON.stringify({
    babies: readBabies(),
    activeBabyId: readActiveBabyId(),
  });
}

function getServerSnapshot() {
  return JSON.stringify({
    babies: demoBabies,
    activeBabyId: demoBabies[0].id,
  });
}

export function calculateBabyAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth();

  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    return "Chưa đến ngày sinh";
  }

  if (months < 1) {
    return `${days} ngày`;
  }

  return `${months} tháng ${days} ngày`;
}

export function getBabies(): Baby[] {
  return readBabies();
}

export function saveBabies(babies: Baby[]) {
  window.localStorage.setItem(BABIES_KEY, JSON.stringify(babies));
  emitChange();
}

export function getActiveBabyId(): string {
  return readActiveBabyId();
}

export function setActiveBabyId(id: string) {
  window.localStorage.setItem(ACTIVE_BABY_KEY, id);
  emitChange();
}

export function addBaby(newBabyData: Omit<BabyProfile, "id">) {
  const newBaby: BabyProfile = {
    ...newBabyData,
    id: `baby-${Date.now()}`,
  };

  const babies = [...readBabies(), newBaby];

  saveBabies(babies);
  window.localStorage.setItem(ACTIVE_BABY_KEY, newBaby.id);
  emitChange();

  return babies;
}

export function updateBaby(idOrBaby: string | Baby, patch?: Partial<Baby>) {
  const babies = readBabies();
  const updatedBabies = babies.map((baby) => {
    if (typeof idOrBaby === "string") {
      return baby.id === idOrBaby ? { ...baby, ...patch } : baby;
    }

    return baby.id === idOrBaby.id ? idOrBaby : baby;
  });

  saveBabies(updatedBabies);
  return updatedBabies;
}

export function resetBabies() {
  window.localStorage.setItem(BABIES_KEY, JSON.stringify(demoBabies));
  window.localStorage.setItem(ACTIVE_BABY_KEY, demoBabies[0].id);
  emitChange();

  return demoBabies;
}

export function useBabyStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return useMemo(() => {
    const parsed = JSON.parse(snapshot) as {
      babies: Baby[];
      activeBabyId: string;
    };

    const activeBaby =
      parsed.babies.find((baby) => baby.id === parsed.activeBabyId) ??
      parsed.babies[0];

    return {
      babies: parsed.babies,
      activeBabyId: parsed.activeBabyId,
      activeBaby,
      addBaby,
      setActiveBabyId,
      updateBaby,
      resetBabies,
    };
  }, [snapshot]);
}
