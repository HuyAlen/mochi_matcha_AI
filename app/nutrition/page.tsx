"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Apple,
  Baby as BabyIcon,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Egg,
  Fish,
  HeartPulse,
  Milk,
  Salad,
  ShieldAlert,
  Sparkles,
  Utensils,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";
import { useTrackingStore } from "@/store/trackingStore";
import type { Baby } from "@/types/baby";

type BabyFilter = "all" | string;

type FoodStatus = "new" | "tried" | "watch" | "allergy";

type FoodItem = {
  id: string;
  name: string;
  group: string;
  month: number;
  benefit: string;
};

type MealPlanDay = {
  day: number;
  title: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  note: string;
};

const FOOD_STATUS_KEY = "be-mind-ai-nutrition-food-status";

const ageTabs = [6, 7, 8, 9, 10, 12];

const foodItems: FoodItem[] = [
  {
    id: "pumpkin",
    name: "Bí đỏ",
    group: "Rau củ",
    month: 6,
    benefit: "Giàu beta-carotene, dễ tiêu hóa.",
  },
  {
    id: "carrot",
    name: "Cà rốt",
    group: "Rau củ",
    month: 6,
    benefit: "Bổ sung vitamin A, vị ngọt tự nhiên.",
  },
  {
    id: "avocado",
    name: "Bơ",
    group: "Trái cây",
    month: 6,
    benefit: "Chất béo tốt cho phát triển não bộ.",
  },
  {
    id: "oat",
    name: "Yến mạch",
    group: "Tinh bột",
    month: 7,
    benefit: "Giàu chất xơ, hỗ trợ tiêu hóa.",
  },
  {
    id: "salmon",
    name: "Cá hồi",
    group: "Đạm",
    month: 7,
    benefit: "Omega 3 hỗ trợ não bộ và thị giác.",
  },
  {
    id: "beef",
    name: "Thịt bò",
    group: "Đạm",
    month: 8,
    benefit: "Bổ sung sắt và kẽm.",
  },
  {
    id: "egg-yolk",
    name: "Lòng đỏ trứng",
    group: "Đạm",
    month: 8,
    benefit: "Giàu choline, cần theo dõi dị ứng.",
  },
  {
    id: "broccoli",
    name: "Bông cải xanh",
    group: "Rau củ",
    month: 9,
    benefit: "Giàu vitamin C và chất xơ.",
  },
  {
    id: "shrimp",
    name: "Tôm",
    group: "Hải sản",
    month: 10,
    benefit: "Giàu đạm, nên thử lượng nhỏ trước.",
  },
  {
    id: "peanut",
    name: "Đậu phộng",
    group: "Dị ứng cao",
    month: 12,
    benefit: "Cần hỏi bác sĩ nếu bé có cơ địa dị ứng.",
  },
];

const mealPlans: Record<number, MealPlanDay[]> = {
  6: [
    {
      day: 1,
      title: "Làm quen vị ngọt tự nhiên",
      breakfast: "Bí đỏ nghiền",
      lunch: "Sữa theo cữ",
      dinner: "Cà rốt nghiền loãng",
      note: "Ưu tiên 1-2 thìa nhỏ mỗi bữa.",
    },
    {
      day: 2,
      title: "Tăng dần độ đặc",
      breakfast: "Bơ nghiền",
      lunch: "Cháo trắng rây",
      dinner: "Bí đỏ nghiền",
      note: "Theo dõi phân và phản ứng da.",
    },
    {
      day: 3,
      title: "Ổn định nhịp ăn",
      breakfast: "Cháo cà rốt",
      lunch: "Sữa theo cữ",
      dinner: "Khoai lang nghiền",
      note: "Không ép ăn nếu bé quay mặt đi.",
    },
  ],
  7: [
    {
      day: 1,
      title: "Bổ sung tinh bột tốt",
      breakfast: "Yến mạch chuối",
      lunch: "Cháo bí đỏ",
      dinner: "Bơ nghiền",
      note: "Có thể tăng lên 2 bữa nếu bé hợp tác.",
    },
    {
      day: 2,
      title: "Thử cá hồi lượng nhỏ",
      breakfast: "Cháo yến mạch",
      lunch: "Cháo cá hồi bí đỏ",
      dinner: "Cà rốt nghiền",
      note: "Cá hồi thử ít trước, quan sát 24 giờ.",
    },
    {
      day: 3,
      title: "Đa dạng rau củ",
      breakfast: "Cháo khoai lang",
      lunch: "Cháo bông cải nghiền",
      dinner: "Sữa theo cữ",
      note: "Giữ món mới cách nhau 2-3 ngày.",
    },
  ],
  8: [
    {
      day: 1,
      title: "Tăng sắt",
      breakfast: "Cháo thịt bò bí đỏ",
      lunch: "Bơ nghiền",
      dinner: "Cháo yến mạch",
      note: "Thịt bò nấu mềm, xay hoặc băm rất nhuyễn.",
    },
    {
      day: 2,
      title: "Thử lòng đỏ trứng",
      breakfast: "Cháo lòng đỏ trứng",
      lunch: "Cháo rau củ",
      dinner: "Sữa theo cữ",
      note: "Bắt đầu với lượng rất nhỏ.",
    },
    {
      day: 3,
      title: "Cân bằng đạm và rau",
      breakfast: "Cháo cá hồi",
      lunch: "Cháo bông cải",
      dinner: "Khoai lang nghiền",
      note: "Theo dõi táo bón khi tăng đạm.",
    },
  ],
  9: [
    {
      day: 1,
      title: "Tập nhai mềm",
      breakfast: "Cháo hạt vỡ thịt bò",
      lunch: "Bông cải hấp mềm",
      dinner: "Cháo cá hồi",
      note: "Tăng texture nếu bé đã nuốt tốt.",
    },
    {
      day: 2,
      title: "Thêm rau xanh",
      breakfast: "Yến mạch bơ",
      lunch: "Cháo rau bina",
      dinner: "Cháo gà bí đỏ",
      note: "Cắt nhỏ thức ăn mềm, luôn quan sát khi ăn.",
    },
    {
      day: 3,
      title: "Tập cầm nắm",
      breakfast: "Khoai lang thanh mềm",
      lunch: "Cháo thịt bò",
      dinner: "Chuối miếng mềm",
      note: "Không để bé ăn một mình.",
    },
  ],
  10: [
    {
      day: 1,
      title: "Đa dạng hải sản",
      breakfast: "Cháo tôm rau củ",
      lunch: "Bơ + sữa chua không đường",
      dinner: "Cháo gà",
      note: "Tôm là nhóm dễ dị ứng, thử ít trước.",
    },
    {
      day: 2,
      title: "Tăng kỹ năng nhai",
      breakfast: "Mì mềm rau củ",
      lunch: "Cá hồi khoai tây",
      dinner: "Cháo thịt bò",
      note: "Độ mềm phải phù hợp khả năng nhai.",
    },
    {
      day: 3,
      title: "Bữa phụ nhẹ",
      breakfast: "Yến mạch trái cây",
      lunch: "Cháo tôm",
      dinner: "Súp khoai tây",
      note: "Không thêm muối, đường.",
    },
  ],
  12: [
    {
      day: 1,
      title: "Ăn gần bữa gia đình",
      breakfast: "Cháo thịt bò rau củ",
      lunch: "Cơm nát cá hồi",
      dinner: "Súp gà",
      note: "Vẫn hạn chế muối và đồ chế biến sẵn.",
    },
    {
      day: 2,
      title: "Theo dõi thực phẩm dị ứng",
      breakfast: "Trứng hấp mềm",
      lunch: "Cơm nát tôm",
      dinner: "Rau củ hấp",
      note: "Nếu có tiền sử dị ứng, hỏi bác sĩ trước.",
    },
    {
      day: 3,
      title: "Cân bằng nhóm chất",
      breakfast: "Yến mạch bơ",
      lunch: "Cơm nát thịt gà",
      dinner: "Cá + rau xanh",
      note: "Ưu tiên đa dạng, không ép lượng.",
    },
  ],
};

const statusMeta: Record<
  FoodStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ size?: number }>;
  }
> = {
  new: {
    label: "Chưa thử",
    className: "bg-slate-50 text-slate-500 border-slate-200",
    icon: Apple,
  },
  tried: {
    label: "Đã thử",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  watch: {
    label: "Theo dõi",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
  },
  allergy: {
    label: "Dị ứng",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ShieldAlert,
  },
};

function readFoodStatus(): Record<string, FoodStatus> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(FOOD_STATUS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FoodStatus>) : {};
  } catch {
    return {};
  }
}

function saveFoodStatus(nextStatus: Record<string, FoodStatus>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOOD_STATUS_KEY, JSON.stringify(nextStatus));
}

function getBabyDisplayName(baby: Pick<Baby, "name" | "nickname">) {
  return baby.nickname || baby.name || "Bé yêu";
}

function getFoodIcon(group: string) {
  if (group === "Đạm") return Fish;
  if (group === "Dị ứng cao") return ShieldAlert;
  if (group === "Tinh bột") return Egg;
  return Apple;
}

function formatMl(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}ml`;
}

export default function NutritionPage() {
  const { babies, activeBabyId } = useBabyStore();
  const { getTrackingSummary, addTrackingLog } = useTrackingStore();

  const [selectedBabyId, setSelectedBabyId] = useState<BabyFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [foodStatus, setFoodStatus] = useState<Record<string, FoodStatus>>(() =>
    readFoodStatus(),
  );

  const selectedBabies = useMemo(() => {
    if (selectedBabyId === "all") return babies;
    return babies.filter((baby) => baby.id === selectedBabyId);
  }, [babies, selectedBabyId]);

  const nutritionSummary = useMemo(() => {
    return selectedBabies.reduce(
      (summary, baby) => {
        const babySummary = getTrackingSummary(baby.id);
        return {
          milk: summary.milk + babySummary.milkTodayMl,
          meals: summary.meals + babySummary.mealTodayCount,
          totalLogs: summary.totalLogs + babySummary.totalLogs,
        };
      },
      { milk: 0, meals: 0, totalLogs: 0 },
    );
  }, [getTrackingSummary, selectedBabies]);

  const currentPlans = mealPlans[selectedMonth] ?? mealPlans[8];
  const availableFoods = foodItems.filter(
    (food) => food.month <= selectedMonth,
  );
  const triedCount = availableFoods.filter(
    (food) => foodStatus[food.id] === "tried",
  ).length;
  const watchCount = availableFoods.filter(
    (food) => foodStatus[food.id] === "watch",
  ).length;
  const allergyCount = availableFoods.filter(
    (food) => foodStatus[food.id] === "allergy",
  ).length;

  const activeBaby =
    babies.find((baby) => baby.id === activeBabyId) ?? babies[0];

  const aiTips = useMemo(() => {
    const tips: string[] = [];

    if (nutritionSummary.meals < selectedBabies.length * 2) {
      tips.push(
        "Hôm nay có thể bổ sung thêm một bữa ăn dặm nhỏ nếu bé hợp tác.",
      );
    }

    if (triedCount < 4) {
      tips.push(
        "Nên thử thực phẩm mới cách nhau 2-3 ngày để dễ theo dõi phản ứng.",
      );
    }

    if (watchCount > 0 || allergyCount > 0) {
      tips.push(
        "Có thực phẩm cần theo dõi, nên ghi chú triệu chứng và thời điểm ăn.",
      );
    }

    if (selectedMonth >= 8) {
      tips.push(
        "Giai đoạn này nên ưu tiên thêm thực phẩm giàu sắt như thịt bò, cá hồi.",
      );
    }

    return tips.slice(0, 3);
  }, [
    allergyCount,
    nutritionSummary.meals,
    selectedBabies.length,
    selectedMonth,
    triedCount,
    watchCount,
  ]);

  function updateFoodStatus(foodId: string, status: FoodStatus) {
    setFoodStatus((currentStatus) => {
      const nextStatus = { ...currentStatus, [foodId]: status };
      saveFoodStatus(nextStatus);
      return nextStatus;
    });
  }

  function logMeal(plan: MealPlanDay) {
    const babyId = selectedBabyId === "all" ? activeBaby?.id : selectedBabyId;

    if (!babyId) return;

    addTrackingLog("meal", {
      babyId,
      value: plan.lunch,
      note: `Từ Nutrition Center: ${plan.title}. ${plan.note}`,
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-indigo-50 pb-28 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-white/70 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <section className="rounded-b-[2rem] bg-gradient-to-br from-rose-100 via-white to-violet-100 px-5 pb-6 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                Nutrition Center
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950">
                Thực đơn ăn dặm
              </h1>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-slate-600">
                Lên thực đơn, theo dõi thực phẩm đã thử và gợi ý dinh dưỡng cho
                bé.
              </p>
            </div>

            <div className="flex h-13 w-13 items-center justify-center rounded-3xl bg-white/85 text-rose-500 shadow-sm">
              <Utensils size={24} />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedBabyId("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedBabyId === "all"
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                  : "bg-white/80 text-slate-500"
              }`}
            >
              Cả hai bé
            </button>
            {babies.map((baby) => (
              <button
                key={baby.id}
                onClick={() => setSelectedBabyId(baby.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedBabyId === baby.id
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                    : "bg-white/80 text-slate-500"
                }`}
              >
                {getBabyDisplayName(baby)}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5 px-4 py-5">
          <div className="rounded-[2rem] border border-white bg-white p-4 shadow-sm shadow-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-500">
                  Hôm nay
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Tổng quan dinh dưỡng
                </h2>
              </div>
              <div className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                {selectedBabies.length} bé
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <SummaryPill
                icon={Milk}
                label="Sữa"
                value={formatMl(nutritionSummary.milk)}
                helper="hôm nay"
              />
              <SummaryPill
                icon={Salad}
                label="Ăn dặm"
                value={`${nutritionSummary.meals}`}
                helper="bữa"
              />
              <SummaryPill
                icon={Droplets}
                label="Nước"
                value="120ml"
                helper="gợi ý"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 shadow-sm shadow-indigo-100/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-500 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
                  AI Nutrition Coach
                </p>
                <h2 className="text-lg font-bold text-slate-950">
                  Gợi ý hôm nay
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {aiTips.map((tip) => (
                <div
                  key={tip}
                  className="rounded-2xl bg-white/85 px-3 py-3 text-sm font-semibold leading-5 text-slate-700 shadow-sm"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white p-4 shadow-sm shadow-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Theo tháng tuổi
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Thực đơn gợi ý
                </h2>
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                {activeBaby?.birthDate
                  ? calculateBabyAge(activeBaby.birthDate)
                  : "Mẫu"}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {ageTabs.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    selectedMonth === month
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {month} tháng{month === 12 ? "+" : ""}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {currentPlans.map((plan) => (
                <div
                  key={plan.day}
                  className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-500">
                        Ngày {plan.day}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-slate-950">
                        {plan.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => logMeal(plan)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-rose-600 shadow-sm"
                    >
                      Ghi ăn
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
                    <MealLine label="Sáng" value={plan.breakfast} />
                    <MealLine label="Trưa" value={plan.lunch} />
                    <MealLine label="Tối" value={plan.dinner} />
                  </div>

                  <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
                    {plan.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white p-4 shadow-sm shadow-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Food Tracker
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Thực phẩm đã thử
                </h2>
              </div>
              <div className="text-right text-xs font-bold text-slate-500">
                <p>
                  {triedCount}/{availableFoods.length} đã thử
                </p>
                <p className="mt-1 text-rose-500">
                  {watchCount + allergyCount} cần theo dõi
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {availableFoods.map((food) => {
                const currentStatus = foodStatus[food.id] ?? "new";
                const meta = statusMeta[currentStatus];
                const StatusIcon = meta.icon;
                const FoodIcon = getFoodIcon(food.group);

                return (
                  <div
                    key={food.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50/80 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
                        <FoodIcon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {food.name}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {food.group} • từ {food.month} tháng
                            </p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                          >
                            <StatusIcon size={12} />
                            {meta.label}
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                          {food.benefit}
                        </p>

                        <div className="mt-3 grid grid-cols-4 gap-1.5">
                          {(
                            ["new", "tried", "watch", "allergy"] as FoodStatus[]
                          ).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateFoodStatus(food.id, status)}
                              className={`rounded-2xl px-2 py-2 text-[10px] font-bold transition ${
                                currentStatus === status
                                  ? "bg-slate-950 text-white"
                                  : "bg-white text-slate-500"
                              }`}
                            >
                              {statusMeta[status].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-4 shadow-sm shadow-amber-100/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                <HeartPulse size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Theo dõi dị ứng
                </h2>
                <p className="mt-1 text-sm font-medium leading-5 text-slate-600">
                  Khi thử món mới, nên ghi nhận trong 24-48 giờ đầu để AI có dữ
                  liệu phân tích.
                </p>
              </div>
            </div>

            <Link
              href="/tracking"
              className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-amber-700 shadow-sm"
            >
              Mở nhật ký ăn dặm
              <ChevronRight size={17} />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-slate-950 p-4 text-white shadow-sm shadow-slate-200/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-200">
                  Trung tâm chăm bé
                </p>
                <h2 className="mt-1 text-lg font-bold">Liên kết nhanh</h2>
              </div>
              <BabyIcon className="text-rose-200" size={24} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuickLink href="/vaccines" label="Tiêm chủng" />
              <QuickLink href="/babies" label="Hồ sơ bé" />
              <QuickLink href="/milestones" label="Cột mốc" />
              <QuickLink href="/ai-coach" label="AI Coach" />
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function MealLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="text-right text-sm font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-3 text-xs font-bold text-white"
    >
      {label}
      <ChevronRight size={15} />
    </Link>
  );
}
