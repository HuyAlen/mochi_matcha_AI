"use client";

import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";
import DiaperActivitySheet from "./DiaperActivitySheet";
import HealthActivitySheet from "./HealthActivitySheet";
import MealActivitySheet from "./MealActivitySheet";
import MilkActivitySheet from "./MilkActivitySheet";
import SleepActivitySheet from "./SleepActivitySheet";
import VaccineActivitySheet from "./VaccineActivitySheet";

type ActivitySheetRouterProps = {
  type: TrackingType;
  babyId: BabyId;
  onBabyChange: (babyId: BabyId) => void;
  onClose: () => void;
  onSave: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
};

export default function ActivitySheetRouter({
  type,
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: ActivitySheetRouterProps) {
  if (type === "milk") {
    return (
      <MilkActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  if (type === "sleep") {
    return (
      <SleepActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  if (type === "meal") {
    return (
      <MealActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  if (type === "diaper") {
    return (
      <DiaperActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  if (type === "temperature") {
    return (
      <HealthActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  if (type === "medicine") {
    return (
      <VaccineActivitySheet
        babyId={babyId}
        onBabyChange={onBabyChange}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  return null;
}
