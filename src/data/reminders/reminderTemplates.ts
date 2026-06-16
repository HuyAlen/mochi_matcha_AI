import type { Reminder } from "@/types/reminder";

export const reminderTemplates: Reminder[] = [
  {
    id: "milk",
    category: "milk",
    title: "Nhắc cho bé uống sữa",
    scheduleText: "3 giờ/lần",
    time: "07:00",
    enabled: true,
  },
  {
    id: "sleep",
    category: "sleep",
    title: "Nhắc giờ ngủ",
    scheduleText: "Buổi tối 19:00",
    time: "19:00",
    enabled: true,
  },
  {
    id: "diaper",
    category: "diaper",
    title: "Nhắc thay tã",
    scheduleText: "2 giờ/lần",
    time: "09:00",
    enabled: true,
  },
  {
    id: "meal",
    category: "meal",
    title: "Nhắc ăn dặm",
    scheduleText: "11:00, 17:00",
    time: "11:00",
    enabled: true,
  },
  {
    id: "medicine",
    category: "medicine",
    title: "Nhắc uống vitamin",
    scheduleText: "Mỗi sáng 08:00",
    time: "08:00",
    enabled: false,
  },
];
