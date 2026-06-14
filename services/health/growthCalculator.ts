import { whoGirlsHeightForAge, whoGirlsWeightForAge } from "@/data/whoGirls";
import type {
  GrowthAssessment,
  GrowthMetric,
  GrowthRecord,
  TwinGrowthComparison,
  WHOReferencePoint,
} from "@/types/health";
import type { BabyProfile } from "@/types/baby";

export function calculateAgeMonths(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth();

  if (today.getDate() < birth.getDate()) months -= 1;

  return Math.max(0, months);
}

function findReference(
  ageMonths: number,
  metric: GrowthMetric,
): WHOReferencePoint {
  const data =
    metric === "weight" ? whoGirlsWeightForAge : whoGirlsHeightForAge;

  return data.reduce((closest, current) => {
    const currentDiff = Math.abs(current.ageMonths - ageMonths);
    const closestDiff = Math.abs(closest.ageMonths - ageMonths);
    return currentDiff < closestDiff ? current : closest;
  }, data[0]);
}

function getPercentileLabel(value: number, ref: WHOReferencePoint) {
  if (value < ref.p3) return "< P3";
  if (value < ref.p15) return "P3 - P15";
  if (value < ref.p50) return "P15 - P50";
  if (value < ref.p85) return "P50 - P85";
  if (value < ref.p97) return "P85 - P97";
  return "> P97";
}

function getStatus(
  value: number,
  ref: WHOReferencePoint,
): GrowthAssessment["status"] {
  if (value < ref.p3) return "low";
  if (value > ref.p97) return "high";
  if (value < ref.p15 || value > ref.p85) return "watch";
  return "normal";
}

function getMessage(metric: GrowthMetric, status: GrowthAssessment["status"]) {
  const metricName = metric === "weight" ? "cân nặng" : "chiều cao";

  if (status === "low") {
    return `${metricName} đang thấp hơn vùng tham chiếu. Mẹ nên theo dõi thêm và hỏi ý kiến bác sĩ nếu kéo dài.`;
  }

  if (status === "high") {
    return `${metricName} đang cao hơn vùng tham chiếu. Cần xem cùng dinh dưỡng, chiều cao và tổng thể phát triển.`;
  }

  if (status === "watch") {
    return `${metricName} nằm ở vùng cần theo dõi thêm. Chưa cần lo lắng nếu bé vẫn ăn ngủ và vận động tốt.`;
  }

  return `${metricName} đang nằm trong vùng phát triển ổn định theo tham chiếu bé gái.`;
}

export function assessGrowth(
  ageMonths: number,
  metric: GrowthMetric,
  value: number,
): GrowthAssessment {
  const ref = findReference(ageMonths, metric);
  const status = getStatus(value, ref);

  return {
    metric,
    value,
    ageMonths: ref.ageMonths,
    percentileLabel: getPercentileLabel(value, ref),
    status,
    message: getMessage(metric, status),
  };
}

export function buildGrowthRecords(babies: BabyProfile[]): GrowthRecord[] {
  return babies.map((baby) => {
    const ageMonths = calculateAgeMonths(baby.birthDate);

    return {
      id: `growth-${baby.id}`,
      babyId: baby.id,
      date: new Date().toISOString(),
      ageMonths,
      weightKg: baby.currentWeightKg,
      heightCm: baby.currentHeightCm,
    };
  });
}

export function compareTwinGrowth(
  firstBaby: BabyProfile,
  secondBaby: BabyProfile,
): TwinGrowthComparison {
  const weightDiffKg = Number(
    Math.abs(firstBaby.currentWeightKg - secondBaby.currentWeightKg).toFixed(1),
  );
  const heightDiffCm = Number(
    Math.abs(firstBaby.currentHeightCm - secondBaby.currentHeightCm).toFixed(1),
  );

  const watch = weightDiffKg >= 0.8 || heightDiffCm >= 4;

  return {
    weightDiffKg,
    heightDiffCm,
    status: watch ? "watch" : "balanced",
    message: watch
      ? "Hai bé đang có chênh lệch tăng trưởng đáng theo dõi. Mẹ nên ghi nhận đều cân nặng, chiều cao mỗi tuần."
      : "Hai bé đang tăng trưởng khá cân bằng. Tiếp tục theo dõi định kỳ để thấy xu hướng rõ hơn.",
  };
}

export function getReferenceForChart(metric: GrowthMetric) {
  return metric === "weight" ? whoGirlsWeightForAge : whoGirlsHeightForAge;
}
