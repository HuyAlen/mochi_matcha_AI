import { vaccineSchedule } from "@/data/vaccineSchedule";
import type {
  BabyVaccineRecord,
  TwinVaccineSummary,
  VaccineDoseStatus,
  VaccineStatusItem,
} from "@/types/vaccine";
import type { BabyProfile } from "@/types/baby";

export function getBabyAgeMonths(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth();

  if (today.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

function getDueDate(birthDate: string, ageMonths: number) {
  const date = new Date(birthDate);
  date.setMonth(date.getMonth() + ageMonths);
  return date;
}

export function getVaccineStatusForBaby(
  baby: BabyProfile,
  records: BabyVaccineRecord[],
): VaccineStatusItem[] {
  const today = new Date();

  return vaccineSchedule.map((item) => {
    const record = records.find(
      (entry) => entry.babyId === baby.id && entry.vaccineId === item.id,
    );

    const dueDate = getDueDate(baby.birthDate, item.recommendedAgeMonths);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let status: VaccineDoseStatus = "upcoming";

    if (record) {
      status = "completed";
    } else if (daysUntilDue < 0) {
      status = "overdue";
    } else if (daysUntilDue <= 14) {
      status = "due";
    }

    return {
      ...item,
      status,
      daysUntilDue,
      completedAt: record?.completedAt,
      note: record?.note,
    };
  });
}

export function getNextVaccines(
  baby: BabyProfile,
  records: BabyVaccineRecord[],
  limit = 3,
) {
  return getVaccineStatusForBaby(baby, records)
    .filter((item) => item.status !== "completed")
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, limit);
}

export function compareTwinVaccineStatus(
  firstBaby: BabyProfile,
  secondBaby: BabyProfile,
  records: BabyVaccineRecord[],
): TwinVaccineSummary {
  const firstItems = getVaccineStatusForBaby(firstBaby, records);
  const secondItems = getVaccineStatusForBaby(secondBaby, records);

  const completedA = firstItems.filter(
    (item) => item.status === "completed",
  ).length;
  const completedB = secondItems.filter(
    (item) => item.status === "completed",
  ).length;
  const total = firstItems.length;
  const diff = Math.abs(completedA - completedB);

  return {
    completedA,
    completedB,
    total,
    status: diff >= 2 ? "watch" : "balanced",
    message:
      diff >= 2
        ? "Hai bé đang có chênh lệch lịch tiêm. Mẹ nên kiểm tra lại sổ tiêm chủng để đồng bộ."
        : "Lịch tiêm của hai bé khá cân bằng. Mẹ tiếp tục cập nhật sau mỗi lần tiêm.",
  };
}

export function getStatusLabel(status: VaccineDoseStatus) {
  const labels = {
    upcoming: "Sắp tới",
    due: "Đến hạn",
    overdue: "Quá hạn",
    completed: "Đã tiêm",
  };

  return labels[status];
}
