import type { BabyId } from "@/types/baby";
import type {
  BabyVaccineRecord,
  VaccineDose,
  VaccineStatus,
} from "@/types/vaccine";

export type BabyVaccineProfile = {
  id: BabyId;
  birthDate?: string;
  birthday?: string;
  dateOfBirth?: string;
};

type GenerateScheduleParams = {
  baby: BabyVaccineProfile;
  doses: VaccineDose[];
  existingRecords?: BabyVaccineRecord[];
  today?: Date;
};

const fallbackBirthDates: Partial<Record<BabyId, string>> = {
  mochi: "2025-10-16",
  matcha: "2025-10-16",
};

const legacyDoseIdMap: Record<string, string> = {
  "dtap-ipv-hib-3": "5in1-3",
  "measles-1": "measles",
  "mmr-1": "mmr",
};

function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addMonths(date: string, months: number) {
  const base = parseDateOnly(date);
  const result = new Date(base);
  result.setMonth(result.getMonth() + months);
  return toDateOnly(result);
}

function resolveBirthDate(baby: BabyVaccineProfile) {
  return (
    baby.birthDate ||
    baby.birthday ||
    baby.dateOfBirth ||
    fallbackBirthDates[baby.id] ||
    "2025-10-16"
  );
}

export function buildVaccineRecordId(babyId: BabyId, vaccineId: string) {
  return `r-${babyId}-${legacyDoseIdMap[vaccineId] ?? vaccineId}`;
}

export function resolveVaccineStatus(
  scheduledDate: string,
  completedDate?: string,
  today = new Date(),
): VaccineStatus {
  if (completedDate) return "completed";

  const target = parseDateOnly(scheduledDate).getTime();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  return target < todayStart ? "overdue" : "upcoming";
}

export function generateVaccineScheduleForBaby({
  baby,
  doses,
  existingRecords = [],
  today = new Date(),
}: GenerateScheduleParams): BabyVaccineRecord[] {
  const birthDate = resolveBirthDate(baby);

  return doses
    .map((dose) => {
      const id = buildVaccineRecordId(baby.id, dose.id);
      const existing = existingRecords.find(
        (record) => record.id === id || record.vaccineId === dose.id,
      );
      const scheduledDate =
        existing?.scheduledDate ??
        addMonths(birthDate, dose.recommendedAgeMonths);
      const completedDate = existing?.completedDate;

      return {
        id,
        babyId: baby.id,
        vaccineId: dose.id,
        scheduledDate,
        completedDate,
        status: resolveVaccineStatus(scheduledDate, completedDate, today),
        location: existing?.location,
        note: existing?.note,
      } satisfies BabyVaccineRecord;
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
}

export function generateVaccineScheduleForBabies(
  babies: BabyVaccineProfile[],
  doses: VaccineDose[],
  existingRecords: BabyVaccineRecord[] = [],
  today = new Date(),
) {
  return babies.flatMap((baby) =>
    generateVaccineScheduleForBaby({
      baby,
      doses,
      existingRecords: existingRecords.filter(
        (record) => record.babyId === baby.id,
      ),
      today,
    }),
  );
}
