import type { BabyId } from "@/types/baby";
import type { HealthEvent, HealthSummary } from "@/types/health";

export function buildHealthSummary(
  babyId: BabyId,
  events: HealthEvent[],
): HealthSummary {
  const babyEvents = events.filter((event) => event.babyId === babyId);

  return {
    feverCount: babyEvents.filter((event) => event.type === "fever").length,
    medicineCount: babyEvents.filter((event) => event.type === "medicine")
      .length,
    doctorVisitCount: babyEvents.filter(
      (event) => event.type === "doctor_visit",
    ).length,
    latestNote:
      babyEvents[0]?.note ??
      "Chưa có ghi chú sức khỏe mới. Mẹ có thể thêm khi bé sốt, uống thuốc hoặc đi khám.",
  };
}
