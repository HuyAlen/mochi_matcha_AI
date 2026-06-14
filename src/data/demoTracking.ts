import type { TrackingLog } from "@/types/tracking";

const today = new Date().toISOString().slice(0, 10);

export const demoTrackingLogs: TrackingLog[] = [
  {
    id: "log-1",
    babyId: "baby-a",
    type: "milk",
    title: "Bú sữa",
    value: "120ml",
    note: "Bé bú tốt",
    createdAt: `${today}T08:00:00`,
    loggedAt: `${today}T08:00:00`,
  },
  {
    id: "log-2",
    babyId: "baby-a",
    type: "sleep",
    title: "Ngủ sáng",
    value: "1.5h",
    note: "Ngủ sâu",
    createdAt: `${today}T09:30:00`,
    loggedAt: `${today}T09:30:00`,
  },
  {
    id: "log-3",
    babyId: "baby-a",
    type: "meal",
    title: "Ăn dặm",
    value: "Cháo yến mạch",
    note: "Ăn gần hết khẩu phần",
    createdAt: `${today}T11:15:00`,
    loggedAt: `${today}T11:15:00`,
  },
  {
    id: "log-4",
    babyId: "baby-b",
    type: "milk",
    title: "Bú sữa",
    value: "100ml",
    note: "Bú chậm hơn Bé A",
    createdAt: `${today}T08:10:00`,
    loggedAt: `${today}T08:10:00`,
  },
];