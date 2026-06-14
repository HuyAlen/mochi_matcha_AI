import { milestoneTemplates } from "@/data/milestoneTemplates";
import type {
  MilestoneAssessment,
  MilestoneRecord,
  MilestoneTimelineItem,
} from "@/types/milestone";

function getBabyAgeMonths(birthDate: string, today = new Date()) {
  const birth = new Date(birthDate);
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  const age = years * 12 + months;

  return Math.max(0, age);
}

function assessMilestone(params: {
  ageMonths: number;
  expectedFromMonth: number;
  expectedToMonth: number;
  achieved: boolean;
}): MilestoneAssessment {
  const { ageMonths, expectedFromMonth, expectedToMonth, achieved } = params;

  if (achieved && ageMonths < expectedFromMonth) return "early";
  if (achieved) return "on_track";
  if (ageMonths <= expectedToMonth) return "on_track";
  if (ageMonths <= expectedToMonth + 2) return "watch";
  return "delayed";
}

export function buildMilestoneTimeline(params: {
  babyId: string;
  birthDate: string;
  records: MilestoneRecord[];
}) {
  const ageMonths = getBabyAgeMonths(params.birthDate);

  return milestoneTemplates.map<MilestoneTimelineItem>((template) => {
    const record = params.records.find(
      (item) =>
        item.babyId === params.babyId && item.milestoneId === template.id,
    );

    const achieved = record?.status === "achieved";

    return {
      ...template,
      babyId: params.babyId,
      status: record?.status ?? "not_started",
      record,
      assessment: assessMilestone({
        ageMonths,
        expectedFromMonth: template.expectedFromMonth,
        expectedToMonth: template.expectedToMonth,
        achieved,
      }),
    };
  });
}

export function getMilestoneSummary(items: MilestoneTimelineItem[]) {
  return {
    total: items.length,
    achieved: items.filter((item) => item.status === "achieved").length,
    observed: items.filter((item) => item.status === "observed").length,
    watch: items.filter((item) => item.assessment === "watch").length,
    delayed: items.filter((item) => item.assessment === "delayed").length,
  };
}

export function generateMilestoneAIInsight(items: MilestoneTimelineItem[]) {
  const summary = getMilestoneSummary(items);
  const delayed = items.filter((item) => item.assessment === "delayed");
  const watch = items.filter((item) => item.assessment === "watch");

  if (delayed.length > 0) {
    return {
      title: "Có mốc phát triển cần theo dõi sát",
      message: `Có ${delayed.length} mốc đang trễ hơn khoảng tham chiếu. Phụ huynh nên ghi nhận thêm biểu hiện thực tế và trao đổi với bác sĩ nhi nếu tình trạng kéo dài.`,
    };
  }

  if (watch.length > 0) {
    return {
      title: "Một số mốc nên được quan sát thêm",
      message: `Có ${watch.length} mốc đang trong vùng cần theo dõi. Hãy tăng tương tác, vận động phù hợp và cập nhật lại khi bé có tiến triển.`,
    };
  }

  if (summary.achieved >= Math.ceil(summary.total * 0.5)) {
    return {
      title: "Bé đang phát triển ổn định",
      message:
        "Nhiều mốc phát triển đã được ghi nhận. Tiếp tục duy trì tương tác, vận động và trò chuyện hằng ngày với bé.",
    };
  }

  return {
    title: "Bắt đầu ghi nhận mốc phát triển",
    message:
      "Hãy cập nhật các mốc bé đã làm được để AI có thể đánh giá chính xác hơn theo từng giai đoạn.",
  };
}
