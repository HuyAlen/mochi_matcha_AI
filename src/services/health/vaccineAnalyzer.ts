import { vaccineDoses } from "@/src/data/health/vaccineSchedule";
import type { BabyId } from "@/types/baby";
import type {
  BabyVaccineRecord,
  VaccineReaction,
  VaccineSummary,
} from "@/types/vaccine";

function formatDoseTitle(record: BabyVaccineRecord) {
  const dose = getVaccineDose(record.vaccineId);
  if (!dose) return "Chưa có thông tin vaccine";
  return `${dose.name} · ${dose.doseLabel}`;
}

function sortByScheduleDate(a: BabyVaccineRecord, b: BabyVaccineRecord) {
  return a.scheduledDate.localeCompare(b.scheduledDate);
}

export function getVaccineDose(vaccineId: string) {
  return vaccineDoses.find((dose) => dose.id === vaccineId);
}

export function getUpcomingVaccines(records: BabyVaccineRecord[]) {
  return records
    .filter(
      (record) => record.status === "upcoming" || record.status === "overdue",
    )
    .sort(sortByScheduleDate);
}

export function buildVaccineSummary(
  babyId: BabyId,
  records: BabyVaccineRecord[],
): VaccineSummary {
  const babyRecords = records.filter((record) => record.babyId === babyId);
  const next = getUpcomingVaccines(babyRecords)[0];

  return {
    completedCount: babyRecords.filter(
      (record) => record.status === "completed",
    ).length,
    upcomingCount: babyRecords.filter((record) => record.status === "upcoming")
      .length,
    overdueCount: babyRecords.filter((record) => record.status === "overdue")
      .length,
    nextVaccineTitle: next
      ? formatDoseTitle(next)
      : "Đã hoàn tất các mũi trong lịch hiện tại",
    nextVaccineDate: next?.scheduledDate,
  };
}

function daysUntil(date?: string) {
  if (!date) return undefined;

  const today = new Date();
  const target = new Date(date);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();

  return Math.ceil((targetStart - todayStart) / 86_400_000);
}

export function buildVaccineInsight(
  babyId: BabyId,
  records: BabyVaccineRecord[],
  reactions: VaccineReaction[],
) {
  const babyRecords = records.filter((record) => record.babyId === babyId);
  const overdue = babyRecords.filter((record) => record.status === "overdue");
  const next = getUpcomingVaccines(babyRecords)[0];
  const latestReaction = reactions
    .filter((reaction) => reaction.babyId === babyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (overdue.length > 0) {
    return {
      title: `${overdue.length} mũi đang quá hạn`,
      description:
        "Nên kiểm tra lại lịch với cơ sở tiêm chủng và cập nhật ngày tiêm thực tế sau khi hoàn tất.",
    };
  }

  if (next) {
    const remainingDays = daysUntil(next.scheduledDate);
    const title = formatDoseTitle(next);
    const when =
      typeof remainingDays === "number"
        ? remainingDays > 0
          ? `còn ${remainingDays} ngày`
          : remainingDays === 0
            ? "đến lịch hôm nay"
            : `quá ${Math.abs(remainingDays)} ngày`
        : "đã có lịch";

    return {
      title: `${title} ${when}`,
      description:
        "Chuẩn bị sổ tiêm, theo dõi sức khỏe trước ngày tiêm và ghi nhận phản ứng sau tiêm nếu có.",
    };
  }

  if (latestReaction) {
    return {
      title: "Có dữ liệu phản ứng sau tiêm",
      description: `${latestReaction.symptom} · mức ${latestReaction.severity}. Tiếp tục theo dõi nếu triệu chứng kéo dài hoặc nặng hơn.`,
    };
  }

  return {
    title: "Lịch tiêm đang ổn",
    description:
      "Các mũi trong lịch hiện tại đã được ghi nhận. Tiếp tục cập nhật khi có lịch mới từ bác sĩ hoặc trung tâm tiêm chủng.",
  };
}
