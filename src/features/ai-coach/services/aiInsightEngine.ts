import { babies } from "@/src/store/babyStore";
import { mealRecipes } from "@/src/data/nutrition/weeklyMenus";
import type { AIInsight } from "@/types/ai";
import type { BabyId } from "@/types/baby";
import type { MealEntry } from "@/types/meal";
import type { TrackingEntry } from "@/types/tracking";

function sumTracking(
  entries: TrackingEntry[],
  babyId: BabyId,
  type: TrackingEntry["type"],
) {
  return entries
    .filter((entry) => entry.babyId === babyId && entry.type === type)
    .reduce((sum, entry) => sum + entry.value, 0);
}

function averageMealPercent(entries: MealEntry[], babyId: BabyId) {
  const babyEntries = entries.filter((entry) => entry.babyId === babyId);

  if (babyEntries.length === 0) return 0;

  return Math.round(
    babyEntries.reduce((sum, entry) => sum + entry.eatenPercent, 0) /
      babyEntries.length,
  );
}

export function generatePersonalInsights(
  trackingEntries: TrackingEntry[],
  mealEntries: MealEntry[],
): AIInsight[] {
  const now = new Date().toISOString();
  const insights: AIInsight[] = [];

  const mochiMilk = sumTracking(trackingEntries, "mochi", "milk");
  const matchaMilk = sumTracking(trackingEntries, "matcha", "milk");
  const mochiSleep = sumTracking(trackingEntries, "mochi", "sleep");
  const matchaSleep = sumTracking(trackingEntries, "matcha", "sleep");
  const mochiMeals = averageMealPercent(mealEntries, "mochi");
  const matchaMeals = averageMealPercent(mealEntries, "matcha");

  if (mochiMilk > 0 && matchaMilk > 0) {
    const diff = Math.abs(mochiMilk - matchaMilk);
    const lowerBaby = mochiMilk < matchaMilk ? "Mochi" : "Matcha";

    if (diff >= 80) {
      insights.push({
        id: "milk-compare",
        category: "twin_compare",
        severity: "warning",
        title: `${lowerBaby} uống sữa ít hơn hôm nay`,
        description: `Chênh lệch lượng sữa giữa hai bé đang khoảng ${diff}ml.`,
        recommendation:
          "Mẹ nên theo dõi thêm cữ tiếp theo. Nếu bé vẫn uống ít nhiều ngày liên tiếp, nên ghi chú triệu chứng đi kèm.",
        createdAt: now,
      });
    } else {
      insights.push({
        id: "milk-balance",
        category: "tracking",
        severity: "positive",
        title: "Lượng sữa của hai bé khá cân bằng",
        description:
          "Mochi và Matcha đang có lượng sữa không chênh lệch nhiều.",
        recommendation:
          "Mẹ tiếp tục duy trì lịch cữ sữa hiện tại và ghi nhận đều để AI theo dõi xu hướng.",
        createdAt: now,
      });
    }
  }

  if (mochiSleep > 0 && matchaSleep > 0) {
    const diff = Math.abs(mochiSleep - matchaSleep);
    const lowerBaby = mochiSleep < matchaSleep ? "Mochi" : "Matcha";

    insights.push({
      id: "sleep-compare",
      category: "sleep",
      severity: diff >= 1.5 ? "warning" : "info",
      title:
        diff >= 1.5
          ? `${lowerBaby} ngủ ít hơn rõ rệt`
          : "Giấc ngủ của hai bé tương đối ổn",
      description: `Chênh lệch giấc ngủ hôm nay khoảng ${diff.toFixed(1)} giờ.`,
      recommendation:
        diff >= 1.5
          ? "Mẹ có thể quan sát nguyên nhân: đói, mọc răng, môi trường ngủ hoặc lịch ngủ ngày."
          : "Mẹ tiếp tục duy trì nhịp ngủ hiện tại.",
      createdAt: now,
    });
  }

  if (mochiMeals > 0 || matchaMeals > 0) {
    const lowerBaby = mochiMeals < matchaMeals ? babies[0] : babies[1];
    const lowerScore = Math.min(mochiMeals || 100, matchaMeals || 100);

    insights.push({
      id: "meal-score",
      category: "nutrition",
      severity: lowerScore < 70 ? "warning" : "positive",
      babyId: lowerBaby.id,
      title:
        lowerScore < 70
          ? `${lowerBaby.name} ăn chưa tốt hôm nay`
          : "Bữa ăn hôm nay khá tích cực",
      description: `Tỷ lệ hoàn thành bữa ăn trung bình đang khoảng ${lowerScore}%.`,
      recommendation:
        lowerScore < 70
          ? "Mẹ nên chia nhỏ khẩu phần, ưu tiên món mềm, ít mùi tanh và thử lại vào bữa sau."
          : "Mẹ có thể tiếp tục thực đơn hiện tại và luân phiên rau củ, đạm, chất béo tốt.",
      createdAt: now,
    });
  }

  insights.push({
    id: "weekly-menu",
    category: "nutrition",
    severity: "info",
    title: "Gợi ý thực đơn tiếp theo",
    description: `Món phù hợp hôm nay: ${mealRecipes[0]?.title}, ${mealRecipes[1]?.title}.`,
    recommendation:
      "Mẹ có thể ưu tiên món có chất xơ buổi sáng và món giàu đạm vào bữa trưa.",
    createdAt: now,
  });

  return insights;
}

export function answerParentQuestion(
  question: string,
  insights: AIInsight[],
): string {
  const normalized = question.toLowerCase();

  if (normalized.includes("ăn") || normalized.includes("thực đơn")) {
    const nutrition = insights.find((item) => item.category === "nutrition");

    return [
      nutrition?.description ??
        "Mind AI chưa có đủ dữ liệu ăn dặm hôm nay để phân tích sâu.",
      nutrition?.recommendation ??
        "Mẹ nên ghi thêm bữa ăn, tỷ lệ ăn và phản ứng của từng bé để AI cá nhân hóa tốt hơn.",
    ].join("\n\n");
  }

  if (normalized.includes("ngủ")) {
    const sleep = insights.find((item) => item.category === "sleep");

    return [
      sleep?.description ?? "Mind AI chưa có đủ dữ liệu giấc ngủ hôm nay.",
      sleep?.recommendation ??
        "Mẹ nên ghi giờ ngủ, giờ thức và số lần thức đêm của từng bé.",
    ].join("\n\n");
  }

  if (
    normalized.includes("so sánh") ||
    normalized.includes("khác") ||
    normalized.includes("mochi") ||
    normalized.includes("matcha")
  ) {
    const compare = insights.find((item) => item.category === "twin_compare");

    return [
      compare?.description ??
        "Hiện tại dữ liệu hai bé chưa cho thấy chênh lệch đáng chú ý.",
      compare?.recommendation ??
        "Mẹ tiếp tục ghi nhận sữa, ngủ, ăn dặm để AI phát hiện xu hướng giữa Mochi và Matcha.",
    ].join("\n\n");
  }

  return [
    "Mind AI đã đọc dữ liệu hiện có của Mochi & Matcha.",
    insights[0]?.description ??
      "Hiện dữ liệu còn ít, mẹ hãy ghi thêm sữa, ngủ, ăn dặm để AI phân tích chính xác hơn.",
    insights[0]?.recommendation ??
      "Mẹ có thể bắt đầu bằng việc ghi nhanh các hoạt động hôm nay.",
  ].join("\n\n");
}
