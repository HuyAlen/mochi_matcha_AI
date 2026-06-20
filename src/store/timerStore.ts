"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BabyId } from "@/types/baby";

export type TimerKind = "sleep" | "milk";

export interface ActiveTimerSession {
  babyId: BabyId;
  kind: TimerKind;
  startAt: string;
}

type TimerSessionsByBaby = Partial<Record<BabyId, ActiveTimerSession>>;

interface TimerState {
  activeSleepSessions: TimerSessionsByBaby;
  activeMilkSessions: TimerSessionsByBaby;

  startSleepTimer: (babyId: BabyId, startAt?: string) => void;
  stopSleepTimer: (babyId: BabyId) => ActiveTimerSession | undefined;
  cancelSleepTimer: (babyId: BabyId) => void;
  getActiveSleepSession: (babyId: BabyId) => ActiveTimerSession | undefined;

  startMilkTimer: (babyId: BabyId, startAt?: string) => void;
  stopMilkTimer: (babyId: BabyId) => ActiveTimerSession | undefined;
  cancelMilkTimer: (babyId: BabyId) => void;
  getActiveMilkSession: (babyId: BabyId) => ActiveTimerSession | undefined;
}

export function createTimerId(kind: TimerKind, babyId: BabyId) {
  return `${kind}-${babyId}`;
}

export function getElapsedMs(startAt?: string, now = Date.now()) {
  if (!startAt) return 0;

  const startTime = new Date(startAt).getTime();

  if (Number.isNaN(startTime)) return 0;

  return Math.max(0, now - startTime);
}

export function getElapsedHours(startAt?: string, now = Date.now()) {
  return getElapsedMs(startAt, now) / (1000 * 60 * 60);
}

export function getElapsedMinutes(startAt?: string, now = Date.now()) {
  return getElapsedMs(startAt, now) / (1000 * 60);
}

export function formatElapsedTime(startAt?: string, now = Date.now()) {
  const elapsedSeconds = Math.floor(getElapsedMs(startAt, now) / 1000);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

export function formatElapsedDuration(startAt?: string, now = Date.now()) {
  const elapsedMinutes = Math.max(
    0,
    Math.round(getElapsedMs(startAt, now) / 60000),
  );

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      activeSleepSessions: {},
      activeMilkSessions: {},

      startSleepTimer: (babyId, startAt) =>
        set((state) => ({
          activeSleepSessions: {
            ...state.activeSleepSessions,
            [babyId]: {
              babyId,
              kind: "sleep",
              startAt: startAt ?? new Date().toISOString(),
            },
          },
        })),

      stopSleepTimer: (babyId) => {
        const session = get().activeSleepSessions[babyId];

        set((state) => {
          const nextSessions = { ...state.activeSleepSessions };
          delete nextSessions[babyId];

          return {
            activeSleepSessions: nextSessions,
          };
        });

        return session;
      },

      cancelSleepTimer: (babyId) =>
        set((state) => {
          const nextSessions = { ...state.activeSleepSessions };
          delete nextSessions[babyId];

          return {
            activeSleepSessions: nextSessions,
          };
        }),

      getActiveSleepSession: (babyId) => get().activeSleepSessions[babyId],

      startMilkTimer: (babyId, startAt) =>
        set((state) => ({
          activeMilkSessions: {
            ...state.activeMilkSessions,
            [babyId]: {
              babyId,
              kind: "milk",
              startAt: startAt ?? new Date().toISOString(),
            },
          },
        })),

      stopMilkTimer: (babyId) => {
        const session = get().activeMilkSessions[babyId];

        set((state) => {
          const nextSessions = { ...state.activeMilkSessions };
          delete nextSessions[babyId];

          return {
            activeMilkSessions: nextSessions,
          };
        });

        return session;
      },

      cancelMilkTimer: (babyId) =>
        set((state) => {
          const nextSessions = { ...state.activeMilkSessions };
          delete nextSessions[babyId];

          return {
            activeMilkSessions: nextSessions,
          };
        }),

      getActiveMilkSession: (babyId) => get().activeMilkSessions[babyId],
    }),
    {
      name: "mind-ai-timer-store-v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as Partial<TimerState>;

        return {
          ...state,
          activeSleepSessions: state.activeSleepSessions ?? {},
          activeMilkSessions: state.activeMilkSessions ?? {},
        };
      },
    },
  ),
);
