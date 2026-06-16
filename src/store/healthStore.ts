"use client";

import { create } from "zustand";
import { healthEvents as demoHealthEvents } from "@/src/data/health/healthEvents";
import type { BabyId } from "@/types/baby";
import type { HealthEvent } from "@/types/health";

interface HealthState {
  events: HealthEvent[];
  addHealthEvent: (event: Omit<HealthEvent, "id" | "createdAt">) => void;
  getEventsByBaby: (babyId: BabyId) => HealthEvent[];
}

export const useHealthStore = create<HealthState>((set, get) => ({
  events: demoHealthEvents,

  addHealthEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...state.events,
      ],
    })),

  getEventsByBaby: (babyId) =>
    get().events.filter((event) => event.babyId === babyId),
}));
