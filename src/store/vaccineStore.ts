"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { BabyVaccineRecord } from "@/types/vaccine";

const VACCINE_KEY = "be-mind-ai-vaccine-records";

const demoRecords: BabyVaccineRecord[] = [
  {
    id: "vaccine-record-1",
    babyId: "baby-a",
    vaccineId: "bcg",
    completedAt: "2025-10-05",
    note: "Đã tiêm sau sinh.",
  },
  {
    id: "vaccine-record-2",
    babyId: "baby-b",
    vaccineId: "bcg",
    completedAt: "2025-10-05",
    note: "Đã tiêm sau sinh.",
  },
  {
    id: "vaccine-record-3",
    babyId: "baby-a",
    vaccineId: "six-in-one-1",
    completedAt: "2025-12-01",
  },
];

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRecords(): BabyVaccineRecord[] {
  if (typeof window === "undefined") return demoRecords;

  const raw = window.localStorage.getItem(VACCINE_KEY);

  if (!raw) {
    window.localStorage.setItem(VACCINE_KEY, JSON.stringify(demoRecords));
    return demoRecords;
  }

  try {
    return JSON.parse(raw) as BabyVaccineRecord[];
  } catch {
    window.localStorage.setItem(VACCINE_KEY, JSON.stringify(demoRecords));
    return demoRecords;
  }
}

function saveRecords(records: BabyVaccineRecord[]) {
  window.localStorage.setItem(VACCINE_KEY, JSON.stringify(records));
  emitChange();
}

function getSnapshot() {
  return JSON.stringify(readRecords());
}

function getServerSnapshot() {
  return JSON.stringify(demoRecords);
}

export function getVaccineRecords() {
  return readRecords();
}

export function markVaccineCompleted(
  babyId: string,
  vaccineId: string,
  note?: string,
) {
  const records = readRecords();
  const exists = records.some(
    (record) => record.babyId === babyId && record.vaccineId === vaccineId,
  );

  if (exists) return records;

  const newRecord: BabyVaccineRecord = {
    id: `vaccine-record-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    babyId,
    vaccineId,
    completedAt: new Date().toISOString(),
    note,
  };

  const nextRecords = [newRecord, ...records];
  saveRecords(nextRecords);
  return nextRecords;
}

export function undoVaccineCompleted(babyId: string, vaccineId: string) {
  const nextRecords = readRecords().filter(
    (record) => !(record.babyId === babyId && record.vaccineId === vaccineId),
  );

  saveRecords(nextRecords);
  return nextRecords;
}

export function resetVaccineRecords() {
  saveRecords(demoRecords);
  return demoRecords;
}

export function useVaccineStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return useMemo(() => {
    const records = JSON.parse(snapshot) as BabyVaccineRecord[];

    return {
      records,
      markVaccineCompleted,
      undoVaccineCompleted,
      resetVaccineRecords,
    };
  }, [snapshot]);
}
