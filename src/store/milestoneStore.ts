import type { MilestoneRecord, MilestoneStatus } from "@/types/milestone";

const STORAGE_KEY = "be-mind-ai:milestone-records";

export function getMilestoneRecords(): MilestoneRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMilestoneRecords(records: MilestoneRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function updateMilestoneRecord(params: {
  babyId: string;
  milestoneId: string;
  status: MilestoneStatus;
  note?: string;
}) {
  const records = getMilestoneRecords();
  const now = new Date().toISOString();

  const existing = records.find(
    (item) =>
      item.babyId === params.babyId && item.milestoneId === params.milestoneId,
  );

  let next: MilestoneRecord[];

  if (existing) {
    next = records.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            status: params.status,
            note: params.note ?? item.note,
            observedDate:
              params.status === "achieved" || params.status === "observed"
                ? (item.observedDate ?? now)
                : undefined,
            updatedAt: now,
          }
        : item,
    );
  } else {
    next = [
      ...records,
      {
        id: crypto.randomUUID(),
        babyId: params.babyId,
        milestoneId: params.milestoneId,
        status: params.status,
        note: params.note,
        observedDate:
          params.status === "achieved" || params.status === "observed"
            ? now
            : undefined,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  saveMilestoneRecords(next);
  return next;
}

export function resetMilestoneRecord(params: {
  babyId: string;
  milestoneId: string;
}) {
  const records = getMilestoneRecords();

  const next = records.filter(
    (item) =>
      !(
        item.babyId === params.babyId && item.milestoneId === params.milestoneId
      ),
  );

  saveMilestoneRecords(next);
  return next;
}
