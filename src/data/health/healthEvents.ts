import type { HealthEvent } from "@/types/health";

export const healthEvents: HealthEvent[] = [
  {
    id: "h-1",
    babyId: "mochi",
    type: "doctor_visit",
    title: "Khám định kỳ",
    value: "Ổn định",
    note: "Bác sĩ đánh giá tăng trưởng tốt.",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "h-2",
    babyId: "matcha",
    type: "fever",
    title: "Sốt nhẹ",
    value: "37.8°C",
    note: "Theo dõi sau tiêm, đã ổn sau 1 ngày.",
    createdAt: "2026-06-12T20:00:00.000Z",
  },
  {
    id: "h-3",
    babyId: "matcha",
    type: "medicine",
    title: "Vitamin D",
    value: "1 lần",
    note: "Uống buổi sáng.",
    createdAt: "2026-06-16T08:00:00.000Z",
  },
];
