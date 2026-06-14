import { Milk, Moon, Smile, Utensils, Activity } from "lucide-react";
import type {
  BabyDashboardProfile,
  DailyTargets,
  GrowthPoint,
  QuickAction,
  TimelineItem,
  VaccineReminder,
} from "@/types/dashboard";

export const dailyTargets: DailyTargets = {
  milkMl: 800,
  sleepHours: 13,
  meals: 3,
  diapers: 5,
};

export const babies: BabyDashboardProfile[] = [
  {
    id: "baby-a",
    name: "Bé A",
    nickname: "Thiên An",
    age: "8 tháng 12 ngày",
    avatar: "👶🏻",
    weight: 7.8,
    height: 72,
    developmentScore: 92,
    today: {
      milkMl: 520,
      sleepHours: 11.3,
      meals: 2,
      diapers: 4,
    },
  },
  {
    id: "baby-b",
    name: "Bé B",
    nickname: "Bình An",
    age: "8 tháng 12 ngày",
    avatar: "👶",
    weight: 7.4,
    height: 71,
    developmentScore: 85,
    today: {
      milkMl: 430,
      sleepHours: 10.1,
      meals: 1,
      diapers: 3,
    },
  },
];

export const growthByBaby: Record<string, GrowthPoint[]> = {
  "baby-a": [
    { day: "01/06", weight: 7.42, height: 70.9 },
    { day: "06/06", weight: 7.5, height: 71.2 },
    { day: "11/06", weight: 7.58, height: 71.5 },
    { day: "16/06", weight: 7.65, height: 71.7 },
    { day: "21/06", weight: 7.72, height: 71.9 },
    { day: "26/06", weight: 7.8, height: 72 },
  ],
  "baby-b": [
    { day: "01/06", weight: 7.08, height: 70.3 },
    { day: "06/06", weight: 7.14, height: 70.5 },
    { day: "11/06", weight: 7.22, height: 70.7 },
    { day: "16/06", weight: 7.28, height: 70.8 },
    { day: "21/06", weight: 7.35, height: 70.9 },
    { day: "26/06", weight: 7.4, height: 71 },
  ],
};

export const timelineItems: TimelineItem[] = [
  {
    id: "1",
    babyId: "baby-a",
    time: "08:00",
    title: "Bú sữa",
    description: "Uống 120ml, phản ứng tốt",
    type: "milk",
  },
  {
    id: "2",
    babyId: "baby-a",
    time: "09:30",
    title: "Ngủ sáng",
    description: "Ngủ 1h 20m, không quấy khóc",
    type: "sleep",
  },
  {
    id: "3",
    babyId: "baby-a",
    time: "11:15",
    title: "Ăn dặm",
    description: "Cháo yến mạch bí đỏ",
    type: "meal",
  },
  {
    id: "4",
    babyId: "baby-b",
    time: "08:15",
    title: "Bú sữa",
    description: "Uống 90ml, cần theo dõi thêm",
    type: "milk",
  },
  {
    id: "5",
    babyId: "baby-b",
    time: "10:10",
    title: "Thay tã",
    description: "Tã ướt bình thường",
    type: "diaper",
  },
];

export const vaccineReminders: VaccineReminder[] = [
  {
    id: "mmr-1",
    name: "Sởi - Quai bị - Rubella",
    recommendedAge: "Khi bé đủ 9 tháng",
    dueInDays: 18,
    note: "Chuẩn bị sổ tiêm và theo dõi sức khỏe trước ngày tiêm.",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "milk",
    label: "Bú sữa",
    description: "Ghi lượng sữa mới",
    icon: Milk,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    id: "sleep",
    label: "Giấc ngủ",
    description: "Thêm giờ ngủ",
    icon: Moon,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    id: "meal",
    label: "Ăn dặm",
    description: "Ghi món ăn",
    icon: Utensils,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    id: "diaper",
    label: "Thay tã",
    description: "Ghi số lần tã",
    icon: Activity,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    id: "mood",
    label: "Tâm trạng",
    description: "Cập nhật bé",
    icon: Smile,
    tone: "bg-pink-50 text-pink-600",
  },
];
