"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  HeartPulse,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Syringe,
  TrendingUp,
} from "lucide-react";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";
import { useTrackingStore } from "@/store/trackingStore";
import { BottomNav } from "@/components/layout/BottomNav";

type BabyFilter = "all" | string;
type MetricMode = "weight" | "height";

type AppBaby = {
  id: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  birthDate?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  weightKg?: number;
  heightCm?: number;
  weight?: number;
  height?: number;
  gender?: string;
  bloodType?: string;
  allergies?: string[] | string;
};

type GrowthPoint = {
  label: string;
  weight: number;
  height: number;
};

type TrackingLogLike = {
  id: string;
  babyId: string;
  type: string;
  value: string;
  note?: string;
  loggedAt: string;
  createdAt: string;
};

const DEFAULT_WEIGHT = 7.8;
const DEFAULT_HEIGHT = 72;
const FALLBACK_GROWTH: GrowthPoint[] = [
  { label: "01/06", weight: 7.42, height: 70.9 },
  { label: "06/06", weight: 7.5, height: 71.2 },
  { label: "11/06", weight: 7.58, height: 71.5 },
  { label: "16/06", weight: 7.66, height: 71.7 },
  { label: "21/06", weight: 7.72, height: 71.9 },
  { label: "26/06", weight: 7.8, height: 72 },
];

function getBabyName(baby?: AppBaby) {
  return baby?.name ?? baby?.nickname ?? "Bé";
}

function getBabyAvatar(baby?: AppBaby, index = 0) {
  return baby?.avatar ?? (index % 2 === 0 ? "👶🏻" : "👶");
}

function extractNumber(value: string) {
  const match = value.replace(",", ".").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function getCurrentWeight(baby: AppBaby, logs: TrackingLogLike[]) {
  const latestWeight = logs
    .filter((log) => log.babyId === baby.id && log.type === "weight")
    .sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    )[0];
  const parsed = latestWeight ? extractNumber(latestWeight.value) : 0;
  return Number(
    (parsed || baby.weightKg || baby.weight || DEFAULT_WEIGHT).toFixed(1),
  );
}

function getCurrentHeight(baby: AppBaby) {
  return Number((baby.heightCm || baby.height || DEFAULT_HEIGHT).toFixed(1));
}

function makeGrowthData(baby: AppBaby, logs: TrackingLogLike[]): GrowthPoint[] {
  const weightLogs = logs
    .filter((log) => log.babyId === baby.id && log.type === "weight")
    .slice()
    .sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
    )
    .map((log) => ({
      label: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(log.loggedAt)),
      weight: extractNumber(log.value),
      height: getCurrentHeight(baby),
    }))
    .filter((point) => point.weight > 0);

  if (weightLogs.length >= 2) return weightLogs.slice(-6);

  const currentWeight = getCurrentWeight(baby, logs);
  const currentHeight = getCurrentHeight(baby);
  return FALLBACK_GROWTH.map((point, index, arr) => {
    const ratio = index / Math.max(arr.length - 1, 1);
    return {
      label: point.label,
      weight: Number((currentWeight - 0.38 + ratio * 0.38).toFixed(2)),
      height: Number((currentHeight - 1.1 + ratio * 1.1).toFixed(1)),
    };
  });
}

function getPercentileText(value: number, type: MetricMode) {
  if (type === "weight") {
    if (value >= 8) return "P85";
    if (value >= 7.5) return "P70";
    return "P55";
  }

  if (value >= 72) return "P80";
  if (value >= 70) return "P65";
  return "P50";
}

function getGrowthScore(weight: number, height: number) {
  const weightScore = Math.min(Math.max((weight / 8.4) * 50, 28), 50);
  const heightScore = Math.min(Math.max((height / 74) * 50, 28), 50);
  return Math.round(weightScore + heightScore);
}

function getGrowthStatus(score: number) {
  if (score >= 90) return "Phát triển rất tốt";
  if (score >= 75) return "Phát triển ổn định";
  if (score >= 60) return "Cần theo dõi nhẹ";
  return "Cần bổ sung dữ liệu";
}

function getProgressWidth(value: number, max: number) {
  return `${Math.min(Math.max((value / max) * 100, 8), 100)}%`;
}

function getBabyAgeSafe(baby?: AppBaby) {
  return baby?.birthDate
    ? calculateBabyAge(baby.birthDate)
    : "Chưa có ngày sinh";
}

function getAllergyText(baby?: AppBaby) {
  if (!baby?.allergies) return "Chưa ghi nhận";
  if (Array.isArray(baby.allergies))
    return baby.allergies.join(", ") || "Chưa ghi nhận";
  return baby.allergies || "Chưa ghi nhận";
}

export default function BabiesProfilePage() {
  const { babies: storeBabies, activeBabyId, setActiveBabyId } = useBabyStore();
  const { logs } = useTrackingStore();
  const babies = storeBabies as AppBaby[];
  const trackingLogs = logs as TrackingLogLike[];
  const [selectedBabyId, setSelectedBabyId] = useState<BabyFilter>(
    activeBabyId ?? babies[0]?.id ?? "all",
  );
  const [metricMode, setMetricMode] = useState<MetricMode>("weight");

  const selectedBabies = useMemo<AppBaby[]>(() => {
    if (selectedBabyId === "all") return babies;
    return babies.filter((baby) => baby.id === selectedBabyId);
  }, [babies, selectedBabyId]);

  const primaryBaby = selectedBabies[0] ?? babies[0];
  const growthData = useMemo(
    () => (primaryBaby ? makeGrowthData(primaryBaby, trackingLogs) : []),
    [primaryBaby, trackingLogs],
  );

  const firstPoint = growthData[0];
  const latestPoint = growthData[growthData.length - 1];
  const weightDiff =
    firstPoint && latestPoint
      ? Number((latestPoint.weight - firstPoint.weight).toFixed(2))
      : 0;
  const heightDiff =
    firstPoint && latestPoint
      ? Number((latestPoint.height - firstPoint.height).toFixed(1))
      : 0;

  const latestWeight = primaryBaby
    ? getCurrentWeight(primaryBaby, trackingLogs)
    : DEFAULT_WEIGHT;
  const latestHeight = primaryBaby
    ? getCurrentHeight(primaryBaby)
    : DEFAULT_HEIGHT;
  const growthScore = getGrowthScore(latestWeight, latestHeight);
  const sibling =
    babies.find((baby) => baby.id !== primaryBaby?.id) ?? babies[1];
  const siblingWeight = sibling ? getCurrentWeight(sibling, trackingLogs) : 0;
  const siblingHeight = sibling ? getCurrentHeight(sibling) : 0;

  function selectBaby(id: BabyFilter) {
    setSelectedBabyId(id);
    if (id !== "all") setActiveBabyId(id);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-[#fff7fb] pb-28 text-slate-950">
      <section className="rounded-b-4xl bg-gradient-to-br from-rose-50 via-white to-violet-50 px-5 pb-6 pt-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-pink-500">Hồ sơ bé</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950">
              Tăng trưởng & hồ sơ
            </h1>
            <p className="mt-2 max-w-72 text-sm leading-6 text-slate-600">
              Theo dõi cân nặng, chiều cao, sức khỏe và lịch tiêm của bé.
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-pink-500 shadow-md">
            <HeartPulse className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => selectBaby("all")}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${
              selectedBabyId === "all"
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            Cả hai bé
          </button>
          {babies.map((baby, index) => (
            <button
              key={baby.id}
              type="button"
              onClick={() => selectBaby(baby.id)}
              className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${
                selectedBabyId === baby.id
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              <span className="mr-2">{getBabyAvatar(baby, index)}</span>
              {getBabyName(baby)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5 px-4 pt-5">
        <div className="rounded-4xl border border-rose-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-rose-50 text-3xl">
              {selectedBabyId === "all" ? "👶🏻" : getBabyAvatar(primaryBaby)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-pink-500">
                    Tổng quan tăng trưởng
                  </p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight">
                    {selectedBabyId === "all"
                      ? `${babies.length} hồ sơ đang theo dõi`
                      : `${getBabyName(primaryBaby)} đang ổn định`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedBabyId === "all"
                      ? "So sánh nhanh hai bé"
                      : getBabyAgeSafe(primaryBaby)}
                  </p>
                </div>
                <GrowthRing score={growthScore} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <SummaryPill
              icon={<Scale className="h-5 w-5" />}
              label="Cân nặng"
              value={`${latestWeight}kg`}
              tone="blue"
            />
            <SummaryPill
              icon={<Ruler className="h-5 w-5" />}
              label="Chiều cao"
              value={`${latestHeight}cm`}
              tone="violet"
            />
            <SummaryPill
              icon={<Activity className="h-5 w-5" />}
              label="WHO"
              value={getPercentileText(latestWeight, "weight")}
              tone="pink"
            />
          </div>
        </div>

        <div className="rounded-4xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                AI Growth Insight
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight">
                {getGrowthStatus(growthScore)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Cân nặng và chiều cao đang đi theo xu hướng tích cực. Mẹ nên cập
                nhật số đo đều để AI đánh giá chính xác hơn.
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <GrowthDelta
              label="30 ngày"
              title="Cân nặng"
              value={`+${Math.max(weightDiff, 0).toFixed(2)}kg`}
            />
            <GrowthDelta
              label="30 ngày"
              title="Chiều cao"
              value={`+${Math.max(heightDiff, 0).toFixed(1)}cm`}
              tone="blue"
            />
          </div>
        </div>

        <div className="rounded-4xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-500">
                Biểu đồ tăng trưởng
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight">
                {metricMode === "weight"
                  ? "Cân nặng 30 ngày"
                  : "Chiều cao 30 ngày"}
              </h2>
            </div>
            <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setMetricMode("weight")}
                className={`rounded-full px-4 py-2 ${
                  metricMode === "weight"
                    ? "bg-white text-pink-500 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Kg
              </button>
              <button
                type="button"
                onClick={() => setMetricMode("height")}
                className={`rounded-full px-4 py-2 ${
                  metricMode === "height"
                    ? "bg-white text-pink-500 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Cm
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-rose-50/70 p-4">
            <div className="flex h-40 items-end gap-3 rounded-2xl bg-white/50 px-2 pb-4 pt-5">
              {growthData.map((point) => {
                const value =
                  metricMode === "weight" ? point.weight : point.height;
                const max = metricMode === "weight" ? 8.5 : 74;
                const minHeight = metricMode === "weight" ? 24 : 28;
                const height = Math.max((value / max) * 128, minHeight);
                return (
                  <div
                    key={`${point.label}-${value}`}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full max-w-8 rounded-full bg-gradient-to-t from-pink-400 to-violet-400 shadow-sm"
                      style={{ height }}
                    />
                    <span className="text-[11px] font-semibold text-slate-400">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniValue
                label="Đầu kỳ"
                value={
                  metricMode === "weight"
                    ? `${firstPoint?.weight ?? "--"}kg`
                    : `${firstPoint?.height ?? "--"}cm`
                }
              />
              <MiniValue
                label="Hiện tại"
                value={
                  metricMode === "weight"
                    ? `${latestPoint?.weight ?? "--"}kg`
                    : `${latestPoint?.height ?? "--"}cm`
                }
              />
            </div>
          </div>
        </div>

        {selectedBabyId !== "all" && primaryBaby && (
          <div className="rounded-4xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-500">
                  Hồ sơ y tế
                </p>
                <h2 className="mt-1 text-2xl font-bold">Thông tin cơ bản</h2>
              </div>
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MedicalItem
                label="Ngày sinh"
                value={primaryBaby.birthDate ?? "Chưa cập nhật"}
              />
              <MedicalItem
                label="Giới tính"
                value={primaryBaby.gender ?? "Chưa cập nhật"}
              />
              <MedicalItem
                label="Nhóm máu"
                value={primaryBaby.bloodType ?? "Chưa cập nhật"}
              />
              <MedicalItem label="Dị ứng" value={getAllergyText(primaryBaby)} />
            </div>
          </div>
        )}

        {selectedBabyId === "all" &&
          babies.length >= 2 &&
          primaryBaby &&
          sibling && (
            <div className="rounded-4xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-500">
                    Song sinh
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    So sánh tăng trưởng
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                  A/B
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <TwinGrowthCard
                  baby={primaryBaby}
                  logs={trackingLogs}
                  index={0}
                />
                <TwinGrowthCard baby={sibling} logs={trackingLogs} index={1} />
              </div>
              <div className="mt-4 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                Chênh lệch hiện tại khoảng{" "}
                {Math.abs(latestWeight - siblingWeight).toFixed(1)}kg và{" "}
                {Math.abs(latestHeight - siblingHeight).toFixed(1)}cm. Nên theo
                dõi thêm theo tuần.
              </div>
            </div>
          )}

        <div className="rounded-4xl border border-rose-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-pink-500">
              <Syringe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-500">Tiêm chủng</p>
              <h2 className="text-xl font-bold">Mũi sắp tới</h2>
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-rose-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-pink-600">
                  Sởi - Quai bị - Rubella
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Khi bé đủ 9 tháng. Chuẩn bị sổ tiêm và theo dõi sức khỏe trước
                  ngày tiêm.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-pink-600">
                Còn 18 ngày
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-500">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-500">
                Gợi ý cho mẹ
              </p>
              <h2 className="text-xl font-bold">Việc nên làm tuần này</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <InsightRow text="Ghi cân nặng mỗi tuần một lần để AI đọc xu hướng tốt hơn." />
            <InsightRow text="Đo chiều cao mỗi tháng và so sánh cùng mốc tuổi của hai bé." />
            <InsightRow text="Cập nhật lịch tiêm và thông tin dị ứng để hồ sơ sức khỏe đầy đủ hơn." />
          </div>
        </div>
      </section>
      <BottomNav />
    </main>
  );
}

function GrowthRing({ score }: { score: number }) {
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-rose-50">
      <div
        className="grid h-16 w-16 place-items-center rounded-full bg-white"
        style={{
          background: `conic-gradient(#fb5c94 ${score * 3.6}deg, #edf2f7 0deg)`,
        }}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-center shadow-sm">
          <span className="text-lg font-bold leading-none">{score}</span>
          <span className="text-[10px] font-semibold text-slate-400">/100</span>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "blue" | "violet" | "pink";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    pink: "bg-pink-50 text-pink-600",
  }[tone];

  return (
    <div className="rounded-3xl bg-slate-50 p-3 text-center">
      <div
        className={`mx-auto grid h-10 w-10 place-items-center rounded-2xl ${toneClass}`}
      >
        {icon}
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function GrowthDelta({
  label,
  title,
  value,
  tone = "emerald",
}: {
  label: string;
  title: string;
  value: string;
  tone?: "emerald" | "blue";
}) {
  const colorClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-blue-50 text-blue-700";
  return (
    <div className={`rounded-3xl p-4 ${colorClass}`}>
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function MiniValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MedicalItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function TwinGrowthCard({
  baby,
  logs,
  index,
}: {
  baby: AppBaby;
  logs: TrackingLogLike[];
  index: number;
}) {
  const weight = getCurrentWeight(baby, logs);
  const height = getCurrentHeight(baby);
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="text-3xl">{getBabyAvatar(baby, index)}</div>
      <h3 className="mt-3 text-lg font-bold">{getBabyName(baby)}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {weight}kg · {height}cm
      </p>
      <div className="mt-3 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-violet-500"
          style={{ width: getProgressWidth(weight, 9) }}
        />
      </div>
    </div>
  );
}

function InsightRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl bg-violet-50/70 p-4 text-sm leading-6 text-slate-700">
      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
      <span>{text}</span>
    </div>
  );
}
