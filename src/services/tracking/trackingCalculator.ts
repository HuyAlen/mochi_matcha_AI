import type { TimelineItem } from "@/types/dashboard";
import type { BabyDashboardProfile, BabyId } from "@/types/dashboard";
import type {
  TodayTrackingMetrics,
  TrackingEntry,
  TrackingTimelineItem,
  TrackingType,
} from "@/types/tracking";

const emptyMetrics: TodayTrackingMetrics = {
  milkMl: 0,
  sleepHours: 0,
  meals: 0,
  diapers: 0,
};

function isValidDate(value?: string) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function isSameLocalDate(isoDate?: string, date = new Date()) {
  if (!isValidDate(isoDate)) return false;
  const itemDate = new Date(isoDate!);
  return itemDate.toDateString() === date.toDateString();
}

function formatTime(isoDate?: string) {
  if (!isValidDate(isoDate)) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoDate!));
}

export function getTodayEntries(entries: TrackingEntry[], babyId?: BabyId) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  return safeEntries.filter(
    (entry) =>
      isSameLocalDate(entry.createdAt) && (!babyId || entry.babyId === babyId),
  );
}

export function calculateTodayMetrics(
  entries: TrackingEntry[],
  babyId: BabyId,
): TodayTrackingMetrics {
  return getTodayEntries(entries, babyId).reduce<TodayTrackingMetrics>(
    (total, entry) => {
      const value = Number(entry.value ?? 0);
      const safeValue = Number.isFinite(value) ? value : 0;

      if (entry.type === "milk") total.milkMl += safeValue;
      if (entry.type === "sleep") total.sleepHours += safeValue;
      if (entry.type === "meal") total.meals += safeValue;
      if (entry.type === "diaper") total.diapers += safeValue;
      return total;
    },
    { ...emptyMetrics },
  );
}

export function mergeBabyWithTracking(
  baby: BabyDashboardProfile,
  entries: TrackingEntry[],
): BabyDashboardProfile {
  const today = calculateTodayMetrics(entries, baby.id);

  return {
    ...baby,
    today: {
      milkMl: Math.round(today.milkMl),
      sleepHours: Number(today.sleepHours.toFixed(1)),
      meals: today.meals,
      diapers: today.diapers,
    },
  };
}

export function getTrackingMeta(type: TrackingType, value: number) {
  if (type === "milk") {
    return {
      title: "Bú sữa",
      description: `Uống ${value}ml`,
      unit: "ml" as const,
    };
  }

  if (type === "sleep") {
    return {
      title: "Giấc ngủ",
      description: `Ngủ ${value}h`,
      unit: "h" as const,
    };
  }

  if (type === "meal") {
    return {
      title: "Ăn dặm",
      description: `${value} bữa ăn mới`,
      unit: "bữa" as const,
    };
  }

  if (type === "diaper") {
    return {
      title: "Thay tã",
      description: `${value} lần thay tã`,
      unit: "lần" as const,
    };
  }

  return {
    title: "Tâm trạng",
    description: "Cập nhật tâm trạng của bé",
    unit: "điểm" as const,
  };
}

export function buildTrackingTimeline(
  entries: TrackingEntry[],
  babyId: BabyId,
): TrackingTimelineItem[] {
  return getTodayEntries(entries, babyId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((entry) => {
      const value = Number(entry.value ?? 0);
      const meta = getTrackingMeta(entry.type, value);

      return {
        id: entry.id,
        babyId: entry.babyId as BabyId,
        time: formatTime(entry.createdAt),
        title: meta.title,
        description: entry.note
          ? `${meta.description} · ${entry.note}`
          : meta.description,
        type: (["milk", "sleep", "meal", "diaper", "mood"].includes(entry.type)
          ? entry.type
          : "mood") as TimelineItem["type"],
        createdAt: entry.createdAt,
      };
    });
}
