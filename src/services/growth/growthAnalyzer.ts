import type {
  GrowthRecord,
  GrowthSummary,
  TwinGrowthComparison,
} from "@/types/growth";
import type { BabyId } from "@/types/baby";

function estimatePercentile(value: number, low: number, high: number) {
  const raw = ((value - low) / (high - low)) * 100;
  return Math.max(5, Math.min(95, Math.round(raw)));
}

export function buildGrowthSummary(
  babyId: BabyId,
  records: GrowthRecord[],
): GrowthSummary {
  const babyRecords = records
    .filter((record) => record.babyId === babyId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latest = babyRecords[babyRecords.length - 1];
  const previous = babyRecords[babyRecords.length - 2] ?? latest;

  const weightChangeKg = Number(
    (latest.weightKg - previous.weightKg).toFixed(1),
  );
  const heightChangeCm = Number(
    (latest.heightCm - previous.heightCm).toFixed(1),
  );

  return {
    babyId,
    latestWeightKg: latest.weightKg,
    latestHeightCm: latest.heightCm,
    latestHeadCircumferenceCm: latest.headCircumferenceCm,
    weightChangeKg,
    heightChangeCm,
    estimatedWeightPercentile: estimatePercentile(latest.weightKg, 5.8, 8.4),
    estimatedHeightPercentile: estimatePercentile(latest.heightCm, 63, 72),
    trend:
      weightChangeKg < 0.25
        ? "slow"
        : weightChangeKg > 0.65
          ? "fast"
          : "normal",
  };
}

export function compareTwinGrowth(
  mochi: GrowthSummary,
  matcha: GrowthSummary,
): TwinGrowthComparison {
  const weightDiffKg = Number(
    Math.abs(mochi.latestWeightKg - matcha.latestWeightKg).toFixed(1),
  );
  const heightDiffCm = Number(
    Math.abs(mochi.latestHeightCm - matcha.latestHeightCm).toFixed(1),
  );
  const headDiffCm = Number(
    Math.abs(
      mochi.latestHeadCircumferenceCm - matcha.latestHeadCircumferenceCm,
    ).toFixed(1),
  );

  return {
    weightDiffKg,
    heightDiffCm,
    headDiffCm,
    insight:
      weightDiffKg <= 0.5 && heightDiffCm <= 1.5
        ? "Chênh lệch tăng trưởng giữa Mochi và Matcha đang trong vùng ổn định."
        : "Có chênh lệch tăng trưởng nhẹ, mẹ nên tiếp tục theo dõi thêm vài tuần.",
  };
}

export function predictNextWeight(summary: GrowthSummary) {
  const estimatedGain =
    summary.trend === "slow" ? 0.25 : summary.trend === "fast" ? 0.55 : 0.4;

  return Number((summary.latestWeightKg + estimatedGain).toFixed(1));
}
