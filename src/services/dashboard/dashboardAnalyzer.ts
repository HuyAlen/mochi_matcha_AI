import type {
  AiInsight,
  BabyDashboardProfile,
  DailyTargets,
  GrowthPoint,
  WeeklyAiReport,
} from "@/types/dashboard";

export function toPercent(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(Math.round((value / target) * 100), 100);
}

export function getDashboardStatus(
  baby: BabyDashboardProfile,
  targets: DailyTargets,
) {
  const milkPercent = toPercent(baby.today.milkMl, targets.milkMl);
  const sleepPercent = toPercent(baby.today.sleepHours, targets.sleepHours);

  if (milkPercent < 45 || sleepPercent < 55) {
    return {
      label: "Cảnh báo" as const,
      title: `${baby.name} cần được theo dõi sát hơn`,
      className: "bg-rose-50 text-rose-600 border-rose-100",
    };
  }

  if (
    milkPercent < 65 ||
    sleepPercent < 75 ||
    baby.today.meals < targets.meals
  ) {
    return {
      label: "Cần theo dõi" as const,
      title: `${baby.name} đang cần cân bằng thêm`,
      className: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }

  return {
    label: "Tốt" as const,
    title: `${baby.name} đang ổn định hôm nay`,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
}

export function buildAiInsights(
  baby: BabyDashboardProfile,
  sibling: BabyDashboardProfile,
  targets: DailyTargets,
): AiInsight[] {
  const milkPercent = toPercent(baby.today.milkMl, targets.milkMl);
  const sleepPercent = toPercent(baby.today.sleepHours, targets.sleepHours);
  const milkGap = baby.today.milkMl - sibling.today.milkMl;
  const sleepGap = baby.today.sleepHours - sibling.today.sleepHours;

  return [
    {
      id: "milk",
      status: milkPercent >= 65 ? "Tốt" : "Cần theo dõi",
      title: `Sữa đạt ${milkPercent}% mục tiêu`,
      description:
        milkPercent >= 65
          ? `${baby.name} đang duy trì lượng sữa khá ổn trong ngày.`
          : `${baby.name} còn thiếu khoảng ${Math.max(targets.milkMl - baby.today.milkMl, 0)}ml so với mục tiêu hôm nay.`,
    },
    {
      id: "sleep",
      status: sleepPercent >= 75 ? "Tốt" : "Cần theo dõi",
      title: `Ngủ đạt ${sleepPercent}% mục tiêu`,
      description:
        sleepPercent >= 75
          ? `Giấc ngủ của ${baby.name} đang gần mức mục tiêu.`
          : `Nên ưu tiên thêm một giấc ngắn, còn thiếu khoảng ${Math.max(targets.sleepHours - baby.today.sleepHours, 0).toFixed(1)}h.`,
    },
    {
      id: "twins",
      status:
        Math.abs(milkGap) > 100 || Math.abs(sleepGap) > 1.5
          ? "Cần theo dõi"
          : "Tốt",
      title: "So sánh song sinh",
      description:
        milkGap >= 0
          ? `${sibling.name} đang uống ít hơn ${baby.name} ${milkGap}ml. Nên quan sát cữ chiều và tối.`
          : `${baby.name} đang uống ít hơn ${sibling.name} ${Math.abs(milkGap)}ml. Nên kiểm tra lại lịch bú gần nhất.`,
    },
  ];
}

export function buildWeeklyReport(
  baby: BabyDashboardProfile,
  growth: GrowthPoint[],
): WeeklyAiReport {
  const first = growth[0];
  const last = growth[growth.length - 1];
  const weightGain =
    last && first ? Math.max(last.weight - first.weight, 0).toFixed(2) : "0.00";
  const heightGain =
    last && first ? Math.max(last.height - first.height, 0).toFixed(1) : "0.0";

  return {
    summary: `${baby.name} có xu hướng phát triển ổn định, cần tiếp tục theo dõi sữa và giấc ngủ vào cuối ngày.`,
    rows: [
      {
        label: "Sữa",
        value: `Trung bình đạt khoảng ${baby.today.milkMl}ml trong ngày gần nhất.`,
      },
      {
        label: "Giấc ngủ",
        value: `Hôm nay ghi nhận ${baby.today.sleepHours}h, nên hướng đến 12-13h/ngày.`,
      },
      {
        label: "Ăn dặm",
        value: `Đã ghi nhận ${baby.today.meals} bữa, mục tiêu là 3 bữa/ngày.`,
      },
      {
        label: "Tăng trưởng",
        value: `30 ngày gần nhất tăng ${weightGain}kg và ${heightGain}cm.`,
      },
    ],
  };
}
