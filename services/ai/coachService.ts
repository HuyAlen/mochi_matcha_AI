import type {
  AICoachInput,
  AICoachInsight,
  AICoachMetric,
  AICoachPlanItem,
  AICoachReport,
  TwinComparison,
} from "@/types/ai";
import type { TrackingLog } from "@/store/trackingStore";

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function extractNumber(value: string) {
  const match = value.match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function getTodayLogs(logs: TrackingLog[], babyId: string) {
  return logs.filter((log) => log.babyId === babyId && isToday(log.loggedAt));
}

function sumByType(logs: TrackingLog[], type: TrackingLog["type"]) {
  return logs
    .filter((log) => log.type === type)
    .reduce((sum, log) => sum + extractNumber(log.value), 0);
}

function countByType(logs: TrackingLog[], type: TrackingLog["type"]) {
  return logs.filter((log) => log.type === type).length;
}

function buildMetrics(todayLogs: TrackingLog[]): AICoachMetric[] {
  const milk = sumByType(todayLogs, "milk");
  const sleep = sumByType(todayLogs, "sleep");
  const meals = countByType(todayLogs, "meal");
  const diapers = countByType(todayLogs, "diaper");

  return [
    {
      label: "Sữa hôm nay",
      value: `${milk}ml`,
      status: milk >= 600 ? "good" : milk >= 400 ? "warning" : "danger",
      description:
        milk >= 600
          ? "Lượng sữa đang ổn định."
          : "Nên theo dõi thêm lượng sữa trong các cữ tiếp theo.",
    },
    {
      label: "Giấc ngủ",
      value: `${sleep}h`,
      status: sleep >= 10 ? "good" : sleep >= 8 ? "warning" : "danger",
      description:
        sleep >= 10
          ? "Thời lượng ngủ hôm nay khá tốt."
          : "Bé có thể cần thêm giấc ngủ ngắn hoặc đi ngủ sớm hơn.",
    },
    {
      label: "Ăn dặm",
      value: `${meals} bữa`,
      status: meals >= 2 ? "good" : meals === 1 ? "warning" : "neutral",
      description:
        meals >= 2
          ? "Ăn dặm được duy trì tốt."
          : "Có thể bổ sung thêm một bữa nhẹ phù hợp độ tuổi.",
    },
    {
      label: "Tã",
      value: `${diapers} lần`,
      status: diapers >= 3 ? "good" : diapers >= 1 ? "warning" : "neutral",
      description:
        diapers >= 3
          ? "Tần suất thay tã hôm nay ổn."
          : "Nên ghi nhận thêm để theo dõi bài tiết của bé.",
    },
  ];
}

function buildInsights(metrics: AICoachMetric[]): AICoachInsight[] {
  const insights: AICoachInsight[] = [];

  const milk = metrics.find((item) => item.label === "Sữa hôm nay");
  const sleep = metrics.find((item) => item.label === "Giấc ngủ");
  const meal = metrics.find((item) => item.label === "Ăn dặm");

  if (milk?.status === "danger") {
    insights.push({
      title: "Cần theo dõi lượng sữa",
      description:
        "Lượng sữa hôm nay đang thấp. Mẹ nên ghi nhận thêm các cữ bú và quan sát biểu hiện đói/no của bé.",
      priority: "high",
    });
  } else if (milk?.status === "warning") {
    insights.push({
      title: "Lượng sữa hơi thấp",
      description:
        "Có thể tăng nhẹ lượng sữa ở các cữ tiếp theo nếu bé hợp tác.",
      priority: "medium",
    });
  }

  if (sleep?.status === "danger" || sleep?.status === "warning") {
    insights.push({
      title: "Giấc ngủ cần ổn định hơn",
      description:
        "Nên giữ lịch ngủ đều, giảm kích thích trước giờ ngủ và tạo môi trường yên tĩnh.",
      priority: sleep.status === "danger" ? "high" : "medium",
    });
  }

  if (meal?.status !== "good") {
    insights.push({
      title: "Ăn dặm cần đa dạng hơn",
      description:
        "Mẹ có thể thêm rau củ mềm, cháo loãng hoặc món bé đã quen để tăng hứng thú ăn.",
      priority: "low",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Lịch chăm sóc hôm nay khá cân bằng",
      description:
        "Các chỉ số chính đang ổn. Tiếp tục duy trì lịch sinh hoạt hiện tại cho bé.",
      priority: "low",
    });
  }

  return insights;
}

function buildPlan(): AICoachPlanItem[] {
  return [
    {
      title: "Vận động nhẹ",
      description:
        "Cho bé nằm sấp, với đồ chơi hoặc tập bò nhẹ trong không gian an toàn.",
      duration: "10-15 phút",
    },
    {
      title: "Đọc sách tương tác",
      description:
        "Đọc sách tranh, gọi tên đồ vật và khuyến khích bé phản ứng bằng âm thanh.",
      duration: "10 phút",
    },
    {
      title: "Chuẩn bị giấc ngủ",
      description:
        "Giảm ánh sáng, hạn chế âm thanh lớn và giữ nhịp ru ngủ quen thuộc.",
      duration: "20 phút",
    },
  ];
}

function buildTwinComparison(input: AICoachInput): TwinComparison | undefined {
  const otherBaby = input.allBabies.find(
    (baby) => baby.id !== input.activeBaby.id,
  );
  if (!otherBaby) return undefined;

  const activeLogs = getTodayLogs(input.logs, input.activeBaby.id);
  const otherLogs = getTodayLogs(input.logs, otherBaby.id);

  const activeMilk = sumByType(activeLogs, "milk");
  const otherMilk = sumByType(otherLogs, "milk");

  if (activeMilk === 0 && otherMilk === 0) {
    return {
      title: "Chưa đủ dữ liệu so sánh",
      description:
        "Hãy ghi nhận thêm sữa, ngủ và ăn dặm cho cả hai bé để AI so sánh chính xác hơn.",
      status: "balanced",
    };
  }

  const diff = Math.abs(activeMilk - otherMilk);
  const biggerBaby =
    activeMilk >= otherMilk ? input.activeBaby.name : otherBaby.name;

  if (diff >= 120) {
    return {
      title: "Có lệch nhịp giữa hai bé",
      description: `${biggerBaby} đang có lượng sữa cao hơn khoảng ${diff}ml hôm nay. Mẹ nên theo dõi thêm các cữ sau.`,
      status: "watch",
    };
  }

  return {
    title: "Hai bé khá cân bằng",
    description:
      "Dữ liệu hôm nay cho thấy hai bé chưa có chênh lệch lớn về lượng sữa.",
    status: "balanced",
  };
}

function calculateScore(metrics: AICoachMetric[]) {
  const scoreMap = {
    good: 25,
    warning: 17,
    danger: 8,
    neutral: 14,
  };

  return metrics.reduce((sum, item) => sum + scoreMap[item.status], 0);
}

export function generateAICoachReport(input: AICoachInput): AICoachReport {
  const todayLogs = getTodayLogs(input.logs, input.activeBaby.id);
  const metrics = buildMetrics(todayLogs);
  const score = Math.min(100, calculateScore(metrics));
  const insights = buildInsights(metrics);
  const plan = buildPlan();
  const twinComparison = buildTwinComparison(input);

  const summary =
    score >= 80
      ? `${input.activeBaby.name} đang có một ngày khá ổn định. Mẹ tiếp tục duy trì nhịp chăm sóc hiện tại.`
      : score >= 60
        ? `${input.activeBaby.name} có một vài chỉ số cần theo dõi thêm trong hôm nay.`
        : `${input.activeBaby.name} cần được theo dõi sát hơn về sữa, ngủ và ăn dặm.`;

  return {
    baby: input.activeBaby,
    generatedAt: new Date().toISOString(),
    score,
    summary,
    metrics,
    insights,
    plan,
    twinComparison,
  };
}
