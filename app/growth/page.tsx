"use client";

import {
  Baby,
  HeartPulse,
  LineChart,
  Ruler,
  Scale,
  Sparkles,
} from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import {
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BottomNav } from "@/components/layout/BottomNav";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";
import {
  assessGrowth,
  calculateAgeMonths,
  compareTwinGrowth,
  getReferenceForChart,
} from "@/services/health/growthCalculator";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function GrowthPage() {
  const isClient = useIsClient();
  const { babies, activeBaby, activeBabyId, setActiveBabyId } = useBabyStore();

  const secondBaby =
    babies.find((baby) => baby.id !== activeBabyId) ?? babies[1];

  const ageMonths = activeBaby ? calculateAgeMonths(activeBaby.birthDate) : 0;

  const weightAssessment = activeBaby
    ? assessGrowth(ageMonths, "weight", activeBaby.currentWeightKg)
    : null;

  const heightAssessment = activeBaby
    ? assessGrowth(ageMonths, "height", activeBaby.currentHeightCm)
    : null;

  const twinComparison =
    babies[0] && babies[1] ? compareTwinGrowth(babies[0], babies[1]) : null;

  const chartData = useMemo(() => {
    const ref = getReferenceForChart("weight").filter(
      (item) => item.ageMonths <= 24,
    );
    return ref.map((item) => ({
      month: `${item.ageMonths}t`,
      P15: item.p15,
      P50: item.p50,
      P85: item.p85,
      [babies[0]?.name ?? "Bé A"]:
        item.ageMonths === calculateAgeMonths(babies[0]?.birthDate ?? "")
          ? babies[0]?.currentWeightKg
          : null,
      [babies[1]?.name ?? "Bé B"]:
        item.ageMonths === calculateAgeMonths(babies[1]?.birthDate ?? "")
          ? babies[1]?.currentWeightKg
          : null,
    }));
  }, [babies]);

  if (!isClient || !activeBaby || !weightAssessment || !heightAssessment) {
    return (
      <main className="min-h-screen bg-[#fff7fb]">
        <div className="mx-auto min-h-screen w-full max-w-md bg-white" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] text-slate-950">
      <div className="mx-auto min-h-screen w-full max-w-md bg-linear-to-b from-[#fff7fb] via-white to-[#fff0f7] pb-28">
        <header className="relative overflow-hidden rounded-b-4xl bg-linear-to-br from-pink-500 via-rose-500 to-fuchsia-500 px-5 pb-6 pt-5 text-white shadow-xl shadow-pink-200">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/15" />

          <div className="relative">
            <p className="text-sm text-white/85">Biểu đồ phát triển</p>
            <h1 className="mt-1 text-2xl font-extrabold">Tăng trưởng bé gái</h1>
            <p className="mt-1 text-sm text-white/80">
              Theo dõi cân nặng, chiều cao và so sánh song sinh.
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-3">
            {babies.slice(0, 2).map((baby) => {
              const active = baby.id === activeBabyId;

              return (
                <button
                  key={baby.id}
                  onClick={() => setActiveBabyId(baby.id)}
                  className={`rounded-4xl p-3 text-left backdrop-blur transition ${
                    active
                      ? "bg-white text-slate-950 shadow-lg"
                      : "bg-white/20 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                      {baby.avatar}
                    </div>
                    <div>
                      <p className="font-extrabold">{baby.name}</p>
                      <p
                        className={`text-xs ${active ? "text-slate-500" : "text-white/75"}`}
                      >
                        {calculateBabyAge(baby.birthDate)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        <section className="space-y-5 px-5 pt-5">
          <section className="grid grid-cols-2 gap-3">
            <GrowthMetricCard
              icon={<Scale size={22} />}
              label="Cân nặng"
              value={`${activeBaby.currentWeightKg}kg`}
              percentile={weightAssessment.percentileLabel}
              status={weightAssessment.status}
            />
            <GrowthMetricCard
              icon={<Ruler size={22} />}
              label="Chiều cao"
              value={`${activeBaby.currentHeightCm}cm`}
              percentile={heightAssessment.percentileLabel}
              status={heightAssessment.status}
            />
          </section>

          <section className="rounded-4xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-rose-500">
                  Cân nặng theo tuổi
                </p>
                <h2 className="text-lg font-extrabold">Đường tăng trưởng</h2>
              </div>
              <LineChart size={22} className="text-rose-500" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="P15"
                    stroke="#fda4af"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="P50"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="P85"
                    stroke="#fda4af"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  {babies[0] && (
                    <Line
                      type="monotone"
                      dataKey={babies[0].name}
                      stroke="#7c3aed"
                      strokeWidth={0}
                      dot={{ r: 5 }}
                      connectNulls={false}
                    />
                  )}
                  {babies[1] && (
                    <Line
                      type="monotone"
                      dataKey={babies[1].name}
                      stroke="#0f766e"
                      strokeWidth={0}
                      dot={{ r: 5 }}
                      connectNulls={false}
                    />
                  )}
                </ReLineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs leading-5 text-slate-600">
              Đường P50 là vùng trung vị tham chiếu. P15-P85 thường được xem là
              vùng phát triển ổn định. Đây là bản MVP mô phỏng, chưa thay thế tư
              vấn y khoa.
            </div>
          </section>

          <section className="rounded-4xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <HeartPulse size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-500">AI nhận định</p>
                <h2 className="text-lg font-extrabold">Đánh giá tăng trưởng</h2>
              </div>
            </div>

            <div className="space-y-3">
              <InsightCard
                title="Cân nặng"
                message={weightAssessment.message}
              />
              <InsightCard
                title="Chiều cao"
                message={heightAssessment.message}
              />
            </div>
          </section>

          {secondBaby && twinComparison && (
            <section className="rounded-4xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-rose-500">Song sinh</p>
                  <h2 className="text-lg font-extrabold">So sánh hai bé</h2>
                </div>
                <Baby size={22} className="text-rose-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TwinValue
                  label="Chênh cân nặng"
                  value={`${twinComparison.weightDiffKg}kg`}
                />
                <TwinValue
                  label="Chênh chiều cao"
                  value={`${twinComparison.heightDiffCm}cm`}
                />
              </div>

              <div
                className={`mt-4 rounded-2xl p-3 text-sm leading-6 ${
                  twinComparison.status === "watch"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {twinComparison.message}
              </div>
            </section>
          )}

          <section className="rounded-4xl bg-linear-to-br from-pink-500 via-rose-500 to-fuchsia-500 p-4 text-white shadow-xl shadow-pink-200">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5" size={22} />
              <div>
                <p className="font-extrabold">Gợi ý cho mẹ</p>
                <p className="mt-1 text-sm leading-6 text-white/90">
                  Cân và đo hai bé cùng một thời điểm mỗi tuần. Với song sinh,
                  xu hướng tăng trưởng quan trọng hơn một con số riêng lẻ.
                </p>
              </div>
            </div>
          </section>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function GrowthMetricCard({
  icon,
  label,
  value,
  percentile,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentile: string;
  status: string;
}) {
  const statusClass =
    status === "normal"
      ? "bg-emerald-50 text-emerald-600"
      : status === "watch"
        ? "bg-amber-50 text-amber-600"
        : "bg-rose-50 text-rose-600";

  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${statusClass}`}
      >
        {icon}
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-rose-500">{percentile}</p>
    </div>
  );
}

function InsightCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl bg-rose-50/70 p-3">
      <p className="font-extrabold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}

function TwinValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-rose-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-extrabold text-rose-600">{value}</p>
    </div>
  );
}
