"use client";

import { useMemo, useState } from "react";
import {
  Baby,
  Brain,
  Check,
  ChevronRight,
  Dumbbell,
  Heart,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";

type BabyFilter = "all" | string;
type AppBaby = {
  id: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  birthDate?: string;
};
type MilestoneStatus = "todo" | "practicing" | "done";
type MilestoneCategory = "motor" | "language" | "cognitive" | "social";

type Milestone = {
  id: string;
  category: MilestoneCategory;
  title: string;
  description: string;
  ageRange: string;
  practice: string;
};

type MilestoneProgress = Record<string, Record<string, MilestoneStatus>>;

const STORAGE_KEY = "be-mind-ai-milestone-progress-v1";

const categoryMeta: Record<
  MilestoneCategory,
  {
    label: string;
    icon: typeof Dumbbell;
    color: string;
    bg: string;
  }
> = {
  motor: {
    label: "Vận động",
    icon: Dumbbell,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  language: {
    label: "Giao tiếp",
    icon: MessageCircle,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  cognitive: {
    label: "Nhận thức",
    icon: Brain,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  social: {
    label: "Xã hội",
    icon: Heart,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};

const milestones: Milestone[] = [
  {
    id: "motor-sit-support",
    category: "motor",
    title: "Ngồi có hỗ trợ",
    description: "Bé giữ đầu và thân tốt hơn khi được đỡ nhẹ.",
    ageRange: "6-8 tháng",
    practice: "Cho bé ngồi trên thảm mềm 3-5 phút, mẹ đỡ hai bên hông.",
  },
  {
    id: "motor-roll",
    category: "motor",
    title: "Lật người linh hoạt",
    description: "Bé xoay người từ ngửa sang sấp hoặc ngược lại.",
    ageRange: "5-8 tháng",
    practice:
      "Đặt đồ chơi lệch bên để bé chủ động xoay người với mẹ quan sát sát.",
  },
  {
    id: "motor-crawl-ready",
    category: "motor",
    title: "Chuẩn bị bò",
    description: "Bé chống tay, nâng ngực và có xu hướng trườn tới đồ chơi.",
    ageRange: "7-10 tháng",
    practice:
      "Tummy time ngắn nhiều lần trong ngày, đặt đồ chơi cách bé một cánh tay.",
  },
  {
    id: "language-babble",
    category: "language",
    title: "Bập bẹ âm đầu",
    description: "Bé phát ra âm ba, ma, a hoặc ê để phản hồi người lớn.",
    ageRange: "6-9 tháng",
    practice: "Nhìn vào mắt bé, lặp lại âm bé phát ra và chờ bé phản hồi.",
  },
  {
    id: "language-name",
    category: "language",
    title: "Phản ứng khi gọi tên",
    description: "Bé quay đầu hoặc nhìn về phía mẹ khi nghe tên mình.",
    ageRange: "6-9 tháng",
    practice: "Gọi tên bé bằng giọng vui, sau đó khen và cười khi bé nhìn lại.",
  },
  {
    id: "cognitive-object",
    category: "cognitive",
    title: "Tìm đồ chơi trước mặt",
    description: "Bé chú ý đồ chơi và đưa tay với lấy vật quen thuộc.",
    ageRange: "6-9 tháng",
    practice:
      "Đưa một món đồ chơi màu nổi trước mặt bé, di chuyển chậm trái phải.",
  },
  {
    id: "cognitive-cause-effect",
    category: "cognitive",
    title: "Hiểu nguyên nhân - kết quả",
    description: "Bé nhận ra lắc đồ chơi sẽ phát ra âm thanh hoặc đèn sáng.",
    ageRange: "7-10 tháng",
    practice: "Cho bé cầm xúc xắc mềm, hướng dẫn lắc và quan sát phản ứng.",
  },
  {
    id: "social-smile",
    category: "social",
    title: "Cười đáp lại",
    description: "Bé cười hoặc phát âm khi mẹ trò chuyện, hát hoặc chơi ú òa.",
    ageRange: "4-8 tháng",
    practice: "Chơi ú òa 2-3 lượt, dừng lại để bé có thời gian phản hồi.",
  },
  {
    id: "social-stranger",
    category: "social",
    title: "Nhận biết người quen",
    description: "Bé có phản ứng khác nhau với người quen và người lạ.",
    ageRange: "7-10 tháng",
    practice:
      "Cho bé tiếp xúc người thân từ từ, luôn để mẹ ở gần để bé yên tâm.",
  },
];

const statusMeta: Record<
  MilestoneStatus,
  { label: string; className: string; dot: string }
> = {
  todo: {
    label: "Chưa tập",
    className: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
  },
  practicing: {
    label: "Đang tập",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  done: {
    label: "Đã đạt",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

function readProgress(): MilestoneProgress {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MilestoneProgress) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: MilestoneProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProgressForBaby(
  progress: MilestoneProgress,
  babyId: string,
  milestoneId: string,
): MilestoneStatus {
  return progress[babyId]?.[milestoneId] ?? "todo";
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getBabyName(baby: { name?: string; nickname?: string }) {
  return baby.name || baby.nickname || "Bé";
}

export default function MilestonesPage() {
  const { babies, activeBabyId, setActiveBabyId } = useBabyStore();
  const [selectedBabyId, setSelectedBabyId] =
    useState<BabyFilter>(activeBabyId);
  const [category, setCategory] = useState<MilestoneCategory | "all">("all");
  const [progress, setProgress] = useState<MilestoneProgress>(() =>
    readProgress(),
  );

  const selectedBabies = useMemo<AppBaby[]>(() => {
    const appBabies = babies as AppBaby[];
    if (selectedBabyId === "all") return appBabies;
    return appBabies.filter((baby: AppBaby) => baby.id === selectedBabyId);
  }, [babies, selectedBabyId]);

  const primaryBaby = selectedBabies[0] ?? (babies[0] as AppBaby | undefined);

  const filteredMilestones = useMemo(() => {
    if (category === "all") return milestones;
    return milestones.filter((item) => item.category === category);
  }, [category]);

  const summary = useMemo(() => {
    const babyIds = selectedBabies.map((baby: AppBaby) => baby.id);
    const total = milestones.length * Math.max(babyIds.length, 1);
    const done = babyIds.reduce((count: number, babyId: string) => {
      return (
        count +
        milestones.filter(
          (item) => getProgressForBaby(progress, babyId, item.id) === "done",
        ).length
      );
    }, 0);
    const practicing = babyIds.reduce((count: number, babyId: string) => {
      return (
        count +
        milestones.filter(
          (item) =>
            getProgressForBaby(progress, babyId, item.id) === "practicing",
        ).length
      );
    }, 0);

    return {
      total,
      done,
      practicing,
      todo: Math.max(total - done - practicing, 0),
      percent: percent(done, total),
    };
  }, [progress, selectedBabies]);

  const categorySummary = useMemo(() => {
    return (Object.keys(categoryMeta) as MilestoneCategory[]).map((key) => {
      const items = milestones.filter((item) => item.category === key);
      const babyIds = selectedBabies.map((baby: AppBaby) => baby.id);
      const total = items.length * Math.max(babyIds.length, 1);
      const done = babyIds.reduce((count: number, babyId: string) => {
        return (
          count +
          items.filter(
            (item) => getProgressForBaby(progress, babyId, item.id) === "done",
          ).length
        );
      }, 0);

      return {
        key,
        total,
        done,
        percent: percent(done, total),
      };
    });
  }, [progress, selectedBabies]);

  const aiSuggestion = useMemo(() => {
    const candidate = filteredMilestones.find((item) =>
      selectedBabies.some(
        (baby: AppBaby) =>
          getProgressForBaby(progress, baby.id, item.id) !== "done",
      ),
    );

    if (!candidate) {
      return {
        title: "Các cột mốc chính đang rất ổn",
        description:
          "Tiếp tục duy trì chơi tương tác, đọc sách và vận động nhẹ mỗi ngày.",
        action: "Ôn lại các kỹ năng đã đạt để bé tự tin hơn.",
      };
    }

    return {
      title: `Gợi ý hôm nay: ${candidate.title}`,
      description: candidate.description,
      action: candidate.practice,
    };
  }, [filteredMilestones, progress, selectedBabies]);

  function updateStatus(
    babyId: string,
    milestoneId: string,
    status: MilestoneStatus,
  ) {
    const next = {
      ...progress,
      [babyId]: {
        ...(progress[babyId] ?? {}),
        [milestoneId]: status,
      },
    };
    setProgress(next);
    saveProgress(next);
  }

  function resetCurrentProgress() {
    const babyIds = selectedBabies.map((baby: AppBaby) => baby.id);
    const next = { ...progress };

    babyIds.forEach((babyId) => {
      delete next[babyId];
    });

    setProgress(next);
    saveProgress(next);
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] text-slate-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#fffafc] pb-28 shadow-[0_0_40px_rgba(244,114,182,0.12)]">
        <section className="rounded-b-[2rem] bg-gradient-to-br from-rose-50 via-white to-violet-50 px-5 pb-7 pt-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-pink-500">
                Cột mốc phát triển
              </p>
              <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">
                Kỹ năng của bé
              </h1>
              <p className="mt-3 max-w-[280px] text-base leading-7 text-slate-600">
                Theo dõi vận động, giao tiếp, nhận thức và gợi ý bài tập phù
                hợp.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 shadow-md shadow-pink-100">
              <Star className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-7 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedBabyId("all")}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${
                selectedBabyId === "all"
                  ? "bg-slate-950 text-white shadow-slate-200"
                  : "bg-white text-slate-600 ring-1 ring-slate-100"
              }`}
            >
              Cả hai bé
            </button>
            {(babies as AppBaby[]).map((baby: AppBaby) => (
              <button
                key={baby.id}
                type="button"
                onClick={() => {
                  setSelectedBabyId(baby.id);
                  setActiveBabyId(baby.id);
                }}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-bold shadow-sm transition ${
                  selectedBabyId === baby.id
                    ? "bg-violet-600 text-white shadow-violet-200"
                    : "bg-white text-slate-600 ring-1 ring-slate-100"
                }`}
              >
                <span className="mr-2">{baby.avatar ?? "👶"}</span>
                {getBabyName(baby)}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pt-5">
          <div className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-sm shadow-pink-100/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-pink-500">
                  Tổng quan cột mốc
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-950">
                  {summary.percent >= 70
                    ? "Bé đang phát triển rất tốt"
                    : summary.percent >= 35
                      ? "Bé đang tiến bộ đều"
                      : "Cần thêm thời gian luyện tập"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {primaryBaby
                    ? `${getBabyName(primaryBaby)}${primaryBaby.birthDate ? ` · ${calculateBabyAge(primaryBaby.birthDate)}` : ""}`
                    : "Theo dõi cột mốc của bé"}
                </p>
              </div>
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-rose-50">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#fb7185 ${summary.percent * 3.6}deg, #eef2f7 0deg)`,
                  }}
                />
                <div className="relative flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-2xl font-bold text-slate-950">
                    {summary.percent}
                  </span>
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <SummaryPill label="Đã đạt" value={summary.done} tone="done" />
              <SummaryPill
                label="Đang tập"
                value={summary.practicing}
                tone="practice"
              />
              <SummaryPill label="Còn lại" value={summary.todo} tone="todo" />
            </div>
          </div>
        </section>

        <section className="px-4 pt-5">
          <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/70">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-500">
                  AI gợi ý hôm nay
                </p>
                <h2 className="mt-1 text-2xl font-bold leading-snug text-slate-950">
                  {aiSuggestion.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {aiSuggestion.description}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-violet-50 p-4 text-sm leading-6 text-slate-700">
              <span className="font-bold text-violet-700">Bài tập: </span>
              {aiSuggestion.action}
            </div>
          </div>
        </section>

        <section className="px-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-pink-500">Nhóm kỹ năng</p>
              <h2 className="text-2xl font-bold text-slate-950">
                Tiến độ từng nhóm
              </h2>
            </div>
            <button
              type="button"
              onClick={resetCurrentProgress}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-100"
              aria-label="Làm mới tiến độ"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {categorySummary.map((item) => {
              const meta = categoryMeta[item.key];
              const Icon = meta.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`rounded-3xl border bg-white p-4 text-left shadow-sm transition ${
                    category === item.key
                      ? "border-violet-200 ring-2 ring-violet-100"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">{meta.label}</p>
                      <p className="text-xs font-semibold text-slate-400">
                        {item.done}/{item.total} đã đạt
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-violet-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-4 pt-5">
          <div className="sticky top-0 z-20 -mx-4 bg-[#fffafc]/95 px-4 py-3 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterButton
                active={category === "all"}
                label="Tất cả"
                onClick={() => setCategory("all")}
              />
              {(Object.keys(categoryMeta) as MilestoneCategory[]).map((key) => (
                <FilterButton
                  key={key}
                  active={category === key}
                  label={categoryMeta[key].label}
                  onClick={() => setCategory(key)}
                />
              ))}
            </div>
          </div>

          <div className="mt-2 space-y-3">
            {filteredMilestones.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                  <Baby className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">
                  Chưa có cột mốc phù hợp
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Chọn nhóm kỹ năng khác để tiếp tục theo dõi.
                </p>
              </div>
            ) : (
              filteredMilestones.map((item) => (
                <MilestoneCard
                  key={item.id}
                  milestone={item}
                  babies={selectedBabies}
                  progress={progress}
                  onChange={updateStatus}
                />
              ))
            )}
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "done" | "practice" | "todo";
}) {
  const className =
    tone === "done"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "practice"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-50 text-slate-500";

  return (
    <div className={`rounded-3xl p-4 text-center ${className}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-bold">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-pink-500 text-white shadow-lg shadow-pink-100"
          : "bg-white text-slate-500 ring-1 ring-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function MilestoneCard({
  milestone,
  babies,
  progress,
  onChange,
}: {
  milestone: Milestone;
  babies: AppBaby[];
  progress: MilestoneProgress;
  onChange: (
    babyId: string,
    milestoneId: string,
    status: MilestoneStatus,
  ) => void;
}) {
  const meta = categoryMeta[milestone.category];
  const Icon = meta.icon;
  const doneCount = babies.filter(
    (baby: AppBaby) =>
      getProgressForBaby(progress, baby.id, milestone.id) === "done",
  ).length;
  const total = Math.max(babies.length, 1);
  const completion = percent(doneCount, total);

  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm shadow-pink-100/50">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {meta.label} · {milestone.ageRange}
              </p>
              <h3 className="mt-1 text-xl font-bold leading-snug text-slate-950">
                {milestone.title}
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {completion}%
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {milestone.description}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-violet-500"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <span className="font-bold text-slate-800">Bài tập gợi ý: </span>
        {milestone.practice}
      </div>

      <div className="mt-4 space-y-3">
        {babies.map((baby: AppBaby) => {
          const status = getProgressForBaby(progress, baby.id, milestone.id);

          return (
            <div
              key={baby.id}
              className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-xl">
                    {baby.avatar ?? "👶"}
                  </span>
                  <div>
                    <p className="font-bold text-slate-950">
                      {getBabyName(baby)}
                    </p>
                    <div
                      className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status].className}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${statusMeta[status].dot}`}
                      />
                      {statusMeta[status].label}
                    </div>
                  </div>
                </div>
                {status === "done" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-5 w-5" />
                  </div>
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["todo", "practicing", "done"] as MilestoneStatus[]).map(
                  (nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() =>
                        onChange(baby.id, milestone.id, nextStatus)
                      }
                      className={`rounded-2xl px-2 py-2 text-xs font-bold transition ${
                        status === nextStatus
                          ? "bg-violet-600 text-white"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {statusMeta[nextStatus].label}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
