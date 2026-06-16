import { vaccineDoses } from "@/src/data/health/vaccineSchedule";
import type { BabyId } from "@/types/baby";
import type {
  BabyVaccineRecord,
  VaccineDose,
  VaccineReaction,
  VaccineSummary,
} from "@/types/vaccine";

export function getVaccineDose(vaccineId: string): VaccineDose | undefined {
  return vaccineDoses.find((dose) => dose.id === vaccineId);
}

export function buildVaccineSummary(
  babyId: BabyId,
  records: BabyVaccineRecord[],
): VaccineSummary {
  const babyRecords = records.filter((record) => record.babyId === babyId);
  const upcoming = babyRecords
    .filter(
      (record) => record.status === "upcoming" || record.status === "overdue",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );

  const next = upcoming[0];
  const nextDose = next ? getVaccineDose(next.vaccineId) : undefined;

  return {
    completedCount: babyRecords.filter(
      (record) => record.status === "completed",
    ).length,
    upcomingCount: babyRecords.filter((record) => record.status === "upcoming")
      .length,
    overdueCount: babyRecords.filter((record) => record.status === "overdue")
      .length,
    nextVaccineTitle: nextDose
      ? `${nextDose.name} · ${nextDose.doseLabel}`
      : "Chưa có lịch sắp tới",
    nextVaccineDate: next?.scheduledDate,
  };
}

export function getUpcomingVaccines(records: BabyVaccineRecord[]) {
  return records
    .filter(
      (record) => record.status === "upcoming" || record.status === "overdue",
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
}

export function buildVaccineInsight(
  babyId: BabyId,
  records: BabyVaccineRecord[],
  reactions: VaccineReaction[],
) {
  const summary = buildVaccineSummary(babyId, records);
  const babyReactions = reactions.filter(
    (reaction) => reaction.babyId === babyId,
  );

  if (!summary.nextVaccineDate) {
    return {
      title: "Lịch tiêm hiện tại đã ổn",
      description:
        "Chưa có mũi tiêm sắp tới trong dữ liệu hiện tại. Mẹ có thể cập nhật thêm lịch mới khi có.",
    };
  }

  const daysLeft = Math.ceil(
    (new Date(summary.nextVaccineDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return {
    title:
      daysLeft >= 0
        ? `Còn ${daysLeft} ngày tới mũi ${summary.nextVaccineTitle}`
        : `${summary.nextVaccineTitle} đã quá lịch ${Math.abs(daysLeft)} ngày`,
    description:
      babyReactions.length > 0
        ? "Bé từng có phản ứng nhẹ sau tiêm. Mẹ nên chuẩn bị nhiệt kế và theo dõi 24-48 giờ sau tiêm."
        : "Sau tiêm, mẹ nên theo dõi sốt, quấy khóc, sưng đỏ vị trí tiêm trong 24-48 giờ.",
  };
}
