"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import AppShell from "@/components/layout/AppShell";
import { useBabyStore } from "@/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";
import type {
  CustomMealIngredient,
  CustomMealNutrition,
  CustomMealRecipe,
  IngredientGroup,
  IngredientItem,
  IngredientUnit,
  ShoppingListItem,
} from "@/types/nutrition";

const STORAGE_KEY = "mind-ai:nutrition-custom-meals:v1";

type NutritionTab = "saved" | "builder" | "shopping" | "ingredients";

type IngredientFilter = "all" | IngredientGroup;

const ingredientGroups: Record<
  IngredientGroup,
  { label: string; icon: string }
> = {
  grain: { label: "Tinh bột", icon: "🍚" },
  protein: { label: "Đạm", icon: "🥩" },
  vegetable: { label: "Rau củ", icon: "🥦" },
  fruit: { label: "Trái cây", icon: "🍌" },
  dairy: { label: "Sữa", icon: "🥛" },
  fat: { label: "Chất béo", icon: "🫒" },
};

const ingredientLibrary: IngredientItem[] = [
  {
    id: "rice",
    name: "Gạo",
    emoji: "🍚",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Tinh bột chính, nấu cháo mềm.",
    nutrition: {
      kcalPer100: 365,
      proteinPer100: 7.1,
      carbPer100: 80,
      fatPer100: 0.7,
    },
  },
  {
    id: "broken-rice",
    name: "Gạo tấm",
    emoji: "🍚",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Dễ nấu nhuyễn, hợp cháo ăn dặm.",
    nutrition: {
      kcalPer100: 360,
      proteinPer100: 7,
      carbPer100: 79,
      fatPer100: 0.8,
    },
  },
  {
    id: "brown-rice",
    name: "Gạo lứt",
    emoji: "🍚",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 10,
    notes: "Giàu xơ, cần nấu thật mềm.",
    nutrition: {
      kcalPer100: 370,
      proteinPer100: 7.9,
      carbPer100: 77.2,
      fatPer100: 2.9,
    },
  },
  {
    id: "oat",
    name: "Yến mạch",
    emoji: "🥣",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Bữa sáng nhanh, nhiều chất xơ.",
    nutrition: {
      kcalPer100: 389,
      proteinPer100: 16.9,
      carbPer100: 66.3,
      fatPer100: 6.9,
    },
  },
  {
    id: "potato",
    name: "Khoai tây",
    emoji: "🥔",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Mềm, dễ phối cá hoặc thịt.",
    nutrition: {
      kcalPer100: 77,
      proteinPer100: 2,
      carbPer100: 17,
      fatPer100: 0.1,
    },
  },
  {
    id: "sweet-potato",
    name: "Khoai lang",
    emoji: "🍠",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Hỗ trợ tiêu hóa, vị ngọt tự nhiên.",
    nutrition: {
      kcalPer100: 86,
      proteinPer100: 1.6,
      carbPer100: 20.1,
      fatPer100: 0.1,
    },
  },
  {
    id: "corn",
    name: "Bắp ngọt",
    emoji: "🌽",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 10,
    notes: "Xay nhuyễn vỏ hạt để dễ tiêu.",
    nutrition: {
      kcalPer100: 86,
      proteinPer100: 3.2,
      carbPer100: 19,
      fatPer100: 1.2,
    },
  },
  {
    id: "noodle",
    name: "Nui/mì mềm",
    emoji: "🍜",
    group: "grain",
    defaultUnit: "g",
    ageMinMonths: 9,
    notes: "Nấu mềm, cắt nhỏ theo khả năng nhai.",
    nutrition: {
      kcalPer100: 371,
      proteinPer100: 13,
      carbPer100: 75,
      fatPer100: 1.5,
    },
  },
  {
    id: "beef",
    name: "Thịt bò nạc",
    emoji: "🥩",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 8,
    notes: "Giàu sắt, băm nhỏ và nấu chín kỹ.",
    nutrition: {
      kcalPer100: 217,
      proteinPer100: 26.1,
      carbPer100: 0,
      fatPer100: 11.8,
    },
  },
  {
    id: "pork",
    name: "Thịt heo nạc",
    emoji: "🥓",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 7,
    notes: "Đạm phổ biến, chọn phần nạc mềm.",
    nutrition: {
      kcalPer100: 143,
      proteinPer100: 21,
      carbPer100: 0,
      fatPer100: 6,
    },
  },
  {
    id: "chicken",
    name: "Thịt gà",
    emoji: "🍗",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 7,
    notes: "Bỏ da, băm hoặc xay nhỏ.",
    nutrition: {
      kcalPer100: 165,
      proteinPer100: 31,
      carbPer100: 0,
      fatPer100: 3.6,
    },
  },
  {
    id: "salmon",
    name: "Cá hồi",
    emoji: "🐟",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 8,
    allergen: "Cá",
    notes: "Giàu DHA, cần gỡ xương kỹ.",
    nutrition: {
      kcalPer100: 208,
      proteinPer100: 20.4,
      carbPer100: 0,
      fatPer100: 13.4,
    },
  },
  {
    id: "white-fish",
    name: "Cá trắng",
    emoji: "🐠",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 8,
    allergen: "Cá",
    notes: "Ít béo, hợp cháo rau củ.",
    nutrition: {
      kcalPer100: 105,
      proteinPer100: 22.8,
      carbPer100: 0,
      fatPer100: 1.2,
    },
  },
  {
    id: "shrimp",
    name: "Tôm",
    emoji: "🦐",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 10,
    allergen: "Hải sản",
    notes: "Thử lượng nhỏ, băm thật mịn.",
    nutrition: {
      kcalPer100: 99,
      proteinPer100: 24,
      carbPer100: 0.2,
      fatPer100: 0.3,
    },
  },
  {
    id: "egg",
    name: "Trứng gà",
    emoji: "🥚",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 7,
    allergen: "Trứng",
    notes: "Thử từng lượng nhỏ nếu bé mới ăn.",
    nutrition: {
      kcalPer100: 155,
      proteinPer100: 12.6,
      carbPer100: 1.1,
      fatPer100: 10.6,
    },
  },
  {
    id: "tofu",
    name: "Đậu hũ non",
    emoji: "⬜",
    group: "protein",
    defaultUnit: "g",
    ageMinMonths: 8,
    allergen: "Đậu nành",
    notes: "Mềm, dễ ăn, hợp cháo rau củ.",
    nutrition: {
      kcalPer100: 76,
      proteinPer100: 8,
      carbPer100: 1.9,
      fatPer100: 4.8,
    },
  },
  {
    id: "pumpkin",
    name: "Bí đỏ",
    emoji: "🎃",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Giàu beta-carotene, vị ngọt dễ ăn.",
    nutrition: {
      kcalPer100: 26,
      proteinPer100: 1,
      carbPer100: 6.5,
      fatPer100: 0.1,
    },
  },
  {
    id: "carrot",
    name: "Cà rốt",
    emoji: "🥕",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Hấp mềm, nghiền hoặc cắt nhỏ.",
    nutrition: {
      kcalPer100: 41,
      proteinPer100: 0.9,
      carbPer100: 9.6,
      fatPer100: 0.2,
    },
  },
  {
    id: "spinach",
    name: "Cải bó xôi",
    emoji: "🥬",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 8,
    notes: "Bổ sung sắt thực vật, dùng lượng vừa.",
    nutrition: {
      kcalPer100: 23,
      proteinPer100: 2.9,
      carbPer100: 3.6,
      fatPer100: 0.4,
    },
  },
  {
    id: "broccoli",
    name: "Bông cải xanh",
    emoji: "🥦",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 8,
    notes: "Giàu vitamin C, hấp mềm.",
    nutrition: {
      kcalPer100: 34,
      proteinPer100: 2.8,
      carbPer100: 6.6,
      fatPer100: 0.4,
    },
  },
  {
    id: "tomato",
    name: "Cà chua",
    emoji: "🍅",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 8,
    notes: "Bỏ hạt/vỏ nếu bé khó tiêu.",
    nutrition: {
      kcalPer100: 18,
      proteinPer100: 0.9,
      carbPer100: 3.9,
      fatPer100: 0.2,
    },
  },
  {
    id: "zucchini",
    name: "Bí ngòi",
    emoji: "🥒",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Mềm, nhẹ bụng, dễ phối cháo.",
    nutrition: {
      kcalPer100: 17,
      proteinPer100: 1.2,
      carbPer100: 3.1,
      fatPer100: 0.3,
    },
  },
  {
    id: "pea",
    name: "Đậu Hà Lan",
    emoji: "🟢",
    group: "vegetable",
    defaultUnit: "g",
    ageMinMonths: 9,
    notes: "Nghiền kỹ vỏ, nhiều chất xơ.",
    nutrition: {
      kcalPer100: 81,
      proteinPer100: 5.4,
      carbPer100: 14.5,
      fatPer100: 0.4,
    },
  },
  {
    id: "banana",
    name: "Chuối",
    emoji: "🍌",
    group: "fruit",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Dễ nghiền, hợp bữa xế.",
    nutrition: {
      kcalPer100: 89,
      proteinPer100: 1.1,
      carbPer100: 22.8,
      fatPer100: 0.3,
    },
  },
  {
    id: "apple",
    name: "Táo",
    emoji: "🍎",
    group: "fruit",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Hấp mềm khi bé còn nhỏ.",
    nutrition: {
      kcalPer100: 52,
      proteinPer100: 0.3,
      carbPer100: 13.8,
      fatPer100: 0.2,
    },
  },
  {
    id: "pear",
    name: "Lê",
    emoji: "🍐",
    group: "fruit",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Mát, hỗ trợ tiêu hóa nhẹ.",
    nutrition: {
      kcalPer100: 57,
      proteinPer100: 0.4,
      carbPer100: 15.2,
      fatPer100: 0.1,
    },
  },
  {
    id: "avocado",
    name: "Bơ",
    emoji: "🥑",
    group: "fruit",
    defaultUnit: "g",
    ageMinMonths: 6,
    notes: "Nhiều chất béo tốt, tăng năng lượng.",
    nutrition: {
      kcalPer100: 160,
      proteinPer100: 2,
      carbPer100: 8.5,
      fatPer100: 14.7,
    },
  },
  {
    id: "mango",
    name: "Xoài",
    emoji: "🥭",
    group: "fruit",
    defaultUnit: "g",
    ageMinMonths: 8,
    notes: "Chín mềm, dùng lượng vừa.",
    nutrition: {
      kcalPer100: 60,
      proteinPer100: 0.8,
      carbPer100: 15,
      fatPer100: 0.4,
    },
  },
  {
    id: "yogurt",
    name: "Sữa chua không đường",
    emoji: "🥛",
    group: "dairy",
    defaultUnit: "g",
    ageMinMonths: 8,
    allergen: "Sữa",
    notes: "Chọn loại phù hợp độ tuổi.",
    nutrition: {
      kcalPer100: 61,
      proteinPer100: 3.5,
      carbPer100: 4.7,
      fatPer100: 3.3,
    },
  },
  {
    id: "cheese",
    name: "Phô mai tách muối",
    emoji: "🧀",
    group: "dairy",
    defaultUnit: "g",
    ageMinMonths: 10,
    allergen: "Sữa",
    notes: "Dùng lượng nhỏ, tránh loại mặn.",
    nutrition: {
      kcalPer100: 280,
      proteinPer100: 18,
      carbPer100: 3,
      fatPer100: 22,
    },
  },
  {
    id: "breastmilk",
    name: "Sữa mẹ/sữa công thức",
    emoji: "🍼",
    group: "dairy",
    defaultUnit: "ml",
    ageMinMonths: 6,
    allergen: "Sữa",
    notes: "Dùng để điều chỉnh độ sệt.",
    nutrition: {
      kcalPer100: 67,
      proteinPer100: 1.3,
      carbPer100: 7,
      fatPer100: 4,
    },
  },
  {
    id: "olive-oil",
    name: "Dầu olive",
    emoji: "🫒",
    group: "fat",
    defaultUnit: "ml",
    ageMinMonths: 6,
    notes: "Thêm sau khi tắt bếp, lượng nhỏ.",
    nutrition: {
      kcalPer100: 884,
      proteinPer100: 0,
      carbPer100: 0,
      fatPer100: 100,
    },
  },
  {
    id: "baby-oil",
    name: "Dầu ăn dặm",
    emoji: "🧴",
    group: "fat",
    defaultUnit: "ml",
    ageMinMonths: 6,
    notes: "Bổ sung chất béo theo khẩu phần.",
    nutrition: {
      kcalPer100: 884,
      proteinPer100: 0,
      carbPer100: 0,
      fatPer100: 100,
    },
  },
  {
    id: "butter",
    name: "Bơ lạt",
    emoji: "🧈",
    group: "fat",
    defaultUnit: "g",
    ageMinMonths: 10,
    allergen: "Sữa",
    notes: "Dùng ít, chọn loại không muối.",
    nutrition: {
      kcalPer100: 717,
      proteinPer100: 0.9,
      carbPer100: 0.1,
      fatPer100: 81,
    },
  },
];

function readSavedMeals(): CustomMealRecipe[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomMealRecipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedMeals(meals: CustomMealRecipe[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

function getDisplayName(baby: Baby | undefined) {
  if (!baby) return "bé";
  return baby.nickname?.trim() || baby.name?.trim() || "bé";
}

function getAgeText(baby: Baby | undefined) {
  const months = getAgeMonths(baby);
  if (months <= 0) return "Chưa có ngày sinh";
  return `${months} tháng tuổi`;
}

function getAgeMonths(baby: Baby | undefined) {
  if (!baby?.birthDate) return 0;
  const birth = new Date(baby.birthDate);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();
  return Math.max(0, months);
}

function getAvatarValue(baby: Baby | undefined) {
  return baby?.avatarUrl?.trim() || baby?.avatarEmoji?.trim() || "👶";
}

function calcIngredientNutrition(
  ingredient: IngredientItem,
  amount: number,
): CustomMealNutrition {
  const ratio = Math.max(0, amount) / 100;
  return {
    calories: ingredient.nutrition.kcalPer100 * ratio,
    proteinGram: ingredient.nutrition.proteinPer100 * ratio,
    carbGram: ingredient.nutrition.carbPer100 * ratio,
    fatGram: ingredient.nutrition.fatPer100 * ratio,
  };
}

function calculateMealNutrition(items: CustomMealIngredient[]) {
  return items.reduce<CustomMealNutrition>(
    (total, item) => {
      const ingredient = ingredientLibrary.find(
        (entry) => entry.id === item.ingredientId,
      );
      if (!ingredient) return total;
      const nutrition = calcIngredientNutrition(ingredient, item.amount);
      return {
        calories: total.calories + nutrition.calories,
        proteinGram: total.proteinGram + nutrition.proteinGram,
        carbGram: total.carbGram + nutrition.carbGram,
        fatGram: total.fatGram + nutrition.fatGram,
      };
    },
    { calories: 0, proteinGram: 0, carbGram: 0, fatGram: 0 },
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function formatAmount(value: number, unit: IngredientUnit) {
  return `${Math.round(value)}${unit}`;
}

function buildShoppingList(meals: CustomMealRecipe[]) {
  const map = new Map<string, ShoppingListItem>();

  meals.forEach((meal) => {
    meal.ingredients.forEach((item) => {
      const ingredient = ingredientLibrary.find(
        (entry) => entry.id === item.ingredientId,
      );
      if (!ingredient) return;
      const key = `${item.ingredientId}-${item.unit}`;
      const current = map.get(key);
      if (current) {
        current.amount += item.amount;
        return;
      }
      map.set(key, {
        ingredientId: item.ingredientId,
        name: ingredient.name,
        emoji: ingredient.emoji,
        group: ingredient.group,
        amount: item.amount,
        unit: item.unit,
      });
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    `${a.group}-${a.name}`.localeCompare(`${b.group}-${b.name}`),
  );
}

function groupShoppingItems(items: ShoppingListItem[]) {
  return items.reduce<Record<IngredientGroup, ShoppingListItem[]>>(
    (groups, item) => {
      groups[item.group].push(item);
      return groups;
    },
    { grain: [], protein: [], vegetable: [], fruit: [], dairy: [], fat: [] },
  );
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-sm">{icon}</span>
      <p className="text-xs font-black uppercase tracking-[0.32em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function BabyAvatar({ baby, active }: { baby: Baby; active: boolean }) {
  const value = getAvatarValue(baby);
  const isImage = value.startsWith("data:image") || value.startsWith("http");

  return (
    <div
      className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl text-xl ring-1 ${
        active ? "bg-white/20 ring-white/35" : "bg-pink-50 ring-pink-100"
      }`}
      style={
        isImage
          ? {
              backgroundImage: `url(${value})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!isImage && value}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-2xl px-4 py-3 text-xs font-black transition ${
        active
          ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
          : "bg-white text-slate-500 ring-1 ring-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-base font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase text-slate-400">
        {label}
      </p>
    </div>
  );
}

function MealCard({
  meal,
  onDelete,
}: {
  meal: CustomMealRecipe;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-slate-950">
            {meal.name}
          </h3>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {Math.round(meal.nutrition.calories)} kcal •{" "}
            {meal.ingredients.length} nguyên liệu
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-500"
        >
          Xóa
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCard value={`${round(meal.nutrition.proteinGram)}g`} label="Đạm" />
        <StatCard
          value={`${round(meal.nutrition.carbGram)}g`}
          label="Tinh bột"
        />
        <StatCard value={`${round(meal.nutrition.fatGram)}g`} label="Béo" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {meal.ingredients.slice(0, 5).map((item) => {
          const ingredient = ingredientLibrary.find(
            (entry) => entry.id === item.ingredientId,
          );
          if (!ingredient) return null;
          return (
            <span
              key={`${meal.id}-${item.ingredientId}-${item.amount}`}
              className="rounded-full bg-pink-50 px-3 py-1 text-[11px] font-black text-pink-500"
            >
              {ingredient.emoji} {ingredient.name}{" "}
              {formatAmount(item.amount, item.unit)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const selectedBabyId = useBabyStore((state) => state.selectedBabyId);
  const setSelectedBabyId = useBabyStore((state) => state.setSelectedBabyId);

  const [activeTab, setActiveTab] = useState<NutritionTab>("saved");
  const [savedMeals, setSavedMeals] = useState<CustomMealRecipe[]>(() =>
    readSavedMeals(),
  );
  const [customMealName, setCustomMealName] = useState("Cháo nhà làm");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientFilter, setIngredientFilter] =
    useState<IngredientFilter>("all");
  const [selectedIngredientId, setSelectedIngredientId] = useState(
    ingredientLibrary[0]?.id ?? "rice",
  );
  const [ingredientAmount, setIngredientAmount] = useState(25);
  const [customIngredients, setCustomIngredients] = useState<
    CustomMealIngredient[]
  >([
    { ingredientId: "rice", amount: 25, unit: "g" },
    { ingredientId: "chicken", amount: 30, unit: "g" },
    { ingredientId: "pumpkin", amount: 40, unit: "g" },
  ]);

  const activeBaby =
    babyProfiles.find((baby) => baby.id === selectedBabyId) ?? babyProfiles[0];
  const activeBabyName = getDisplayName(activeBaby);
  const activeAgeMonths = getAgeMonths(activeBaby);

  const selectedIngredient =
    ingredientLibrary.find((item) => item.id === selectedIngredientId) ??
    ingredientLibrary[0];

  const customNutrition = useMemo(
    () => calculateMealNutrition(customIngredients),
    [customIngredients],
  );

  const selectedIngredientPreview = useMemo(
    () => calcIngredientNutrition(selectedIngredient, ingredientAmount),
    [ingredientAmount, selectedIngredient],
  );

  const mealsForBaby = useMemo(
    () => savedMeals.filter((meal) => meal.babyId === activeBaby?.id),
    [activeBaby?.id, savedMeals],
  );

  const shoppingList = useMemo(
    () => buildShoppingList(mealsForBaby),
    [mealsForBaby],
  );

  const shoppingGroups = useMemo(
    () => groupShoppingItems(shoppingList),
    [shoppingList],
  );

  const visibleIngredients = useMemo(() => {
    const query = ingredientSearch.trim().toLowerCase();
    return ingredientLibrary.filter((ingredient) => {
      const matchesGroup =
        ingredientFilter === "all" || ingredient.group === ingredientFilter;
      const matchesSearch =
        !query ||
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.notes.toLowerCase().includes(query);
      const matchesAge =
        activeAgeMonths === 0 || ingredient.ageMinMonths <= activeAgeMonths;
      return matchesGroup && matchesSearch && matchesAge;
    });
  }, [activeAgeMonths, ingredientFilter, ingredientSearch]);

  function persistMeals(nextMeals: CustomMealRecipe[]) {
    setSavedMeals(nextMeals);
    writeSavedMeals(nextMeals);
  }

  function addIngredient() {
    if (!selectedIngredient || ingredientAmount <= 0) return;
    setCustomIngredients((items) => [
      ...items,
      {
        ingredientId: selectedIngredient.id,
        amount: ingredientAmount,
        unit: selectedIngredient.defaultUnit,
      },
    ]);
  }

  function removeIngredient(index: number) {
    setCustomIngredients((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function saveCustomMeal() {
    const name = customMealName.trim();
    if (!name || customIngredients.length === 0 || !activeBaby) return;

    const nextMeals = [
      {
        id: `custom-${Date.now()}`,
        babyId: activeBaby.id,
        name,
        ingredients: customIngredients,
        nutrition: customNutrition,
        createdAt: new Date().toISOString(),
      },
      ...savedMeals,
    ];
    persistMeals(nextMeals);
    setActiveTab("saved");
  }

  function deleteMeal(id: string) {
    persistMeals(savedMeals.filter((meal) => meal.id !== id));
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[430px] bg-[#fff7fb] px-4 pb-6 pt-5 text-slate-950">
        <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-pink-100/70 ring-1 ring-pink-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-pink-400">
                Nutrition Manager
              </p>
              <h1 className="mt-3 text-2xl font-black leading-tight">
                Dinh dưỡng ăn dặm
              </h1>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
                Tự tạo món, tính kcal theo gram và gom danh sách đi chợ cho{" "}
                {activeBabyName}.
              </p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[28px] bg-pink-50 text-3xl ring-1 ring-pink-100">
              🥣
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <SectionTitle icon="🎀" label="Chọn bé" />
          <div className="grid grid-cols-2 gap-3">
            {babyProfiles.map((baby) => {
              const isActive = baby.id === selectedBabyId;
              return (
                <button
                  key={baby.id}
                  type="button"
                  onClick={() => setSelectedBabyId(baby.id as BabyId)}
                  className={`flex items-center gap-3 rounded-[28px] p-3 text-left transition ${
                    isActive
                      ? "bg-pink-500 text-white shadow-xl shadow-pink-200"
                      : "bg-white text-slate-950 shadow-sm ring-1 ring-slate-100"
                  }`}
                >
                  <BabyAvatar baby={baby} active={isActive} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {getDisplayName(baby)}
                    </p>
                    <p
                      className={`text-xs font-black ${isActive ? "text-pink-100" : "text-slate-400"}`}
                    >
                      {getAgeText(baby)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ["saved", "Món của bé"],
            ["builder", "Tự tạo món"],
            ["shopping", "Đi chợ"],
            ["ingredients", "Nguyên liệu"],
          ].map(([value, label]) => (
            <TabButton
              key={value}
              active={activeTab === value}
              onClick={() => setActiveTab(value as NutritionTab)}
            >
              {label}
            </TabButton>
          ))}
        </section>

        {activeTab === "saved" ? (
          <section className="mt-6 space-y-4">
            <SectionTitle icon="📚" label={`Món của ${activeBabyName}`} />
            {mealsForBaby.length > 0 ? (
              <div className="space-y-3">
                {mealsForBaby.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={() => deleteMeal(meal.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white p-5 text-center shadow-lg shadow-pink-100/60 ring-1 ring-pink-100">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-pink-50 text-3xl ring-1 ring-pink-100">
                  🧑‍🍳
                </div>
                <h2 className="mt-3 text-lg font-black">Chưa có món tự tạo</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                  Tạo món đầu tiên để lưu công thức, kcal và dùng cho danh sách
                  đi chợ.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="mt-4 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-200"
                >
                  Tạo món mới
                </button>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "builder" ? (
          <section className="mt-6 space-y-4">
            <SectionTitle icon="🧮" label="Tự tạo món" />
            <div className="rounded-[28px] bg-white p-5 shadow-lg shadow-emerald-100/60 ring-1 ring-emerald-100">
              <h2 className="text-lg font-black">
                Meal Builder cho {activeBabyName}
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                Nhập gram/ml, app tự tính kcal, đạm, tinh bột và béo realtime.
              </p>

              <input
                value={customMealName}
                onChange={(event) => setCustomMealName(event.target.value)}
                placeholder="Tên món, ví dụ: Cháo cá hồi bí đỏ"
                className="mt-4 w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none ring-1 ring-slate-100"
              />

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_86px] gap-2">
                <select
                  value={selectedIngredientId}
                  onChange={(event) =>
                    setSelectedIngredientId(event.target.value)
                  }
                  className="min-w-0 rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none ring-1 ring-slate-100"
                >
                  {ingredientLibrary.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.emoji} {ingredient.name}
                    </option>
                  ))}
                </select>
                <div className="relative min-w-0">
                  <input
                    type="number"
                    min={1}
                    value={ingredientAmount}
                    onChange={(event) =>
                      setIngredientAmount(Number(event.target.value))
                    }
                    className="w-full rounded-2xl bg-slate-50 py-4 pl-3 pr-8 text-center text-sm font-black outline-none ring-1 ring-slate-100"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    {selectedIngredient.defaultUnit}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-emerald-700">
                      {selectedIngredient.emoji} {selectedIngredient.name}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-emerald-600">
                      {Math.round(selectedIngredientPreview.calories)} kcal cho{" "}
                      {ingredientAmount}
                      {selectedIngredient.defaultUnit} •{" "}
                      {selectedIngredient.nutrition.kcalPer100} kcal/100g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-600 shadow-sm"
                  >
                    + Thêm
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <StatCard
                  value={`${Math.round(customNutrition.calories)}`}
                  label="Kcal"
                />
                <StatCard
                  value={`${round(customNutrition.proteinGram)}g`}
                  label="Đạm"
                />
                <StatCard
                  value={`${round(customNutrition.carbGram)}g`}
                  label="Tinh bột"
                />
                <StatCard
                  value={`${round(customNutrition.fatGram)}g`}
                  label="Béo"
                />
              </div>

              <div className="mt-4 space-y-2">
                {customIngredients.map((item, index) => {
                  const ingredient = ingredientLibrary.find(
                    (entry) => entry.id === item.ingredientId,
                  );
                  if (!ingredient) return null;
                  const nutrition = calcIngredientNutrition(
                    ingredient,
                    item.amount,
                  );
                  return (
                    <div
                      key={`${item.ingredientId}-${index}`}
                      className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">
                          {ingredient.emoji} {ingredient.name}
                        </p>
                        <p className="text-xs font-bold text-slate-400">
                          {formatAmount(item.amount, item.unit)} •{" "}
                          {Math.round(nutrition.calories)} kcal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-400"
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={saveCustomMeal}
                className="mt-4 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
              >
                Lưu vào Món của {activeBabyName}
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "shopping" ? (
          <section className="mt-6 space-y-4">
            <SectionTitle icon="🛒" label={`Đi chợ cho ${activeBabyName}`} />
            <div className="rounded-[28px] bg-white p-5 shadow-lg shadow-pink-100/60 ring-1 ring-pink-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Danh sách đi chợ</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    Gom từ {mealsForBaby.length} món đã lưu.
                  </p>
                </div>
                <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500">
                  {shoppingList.length} món
                </span>
              </div>

              {shoppingList.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {(Object.keys(ingredientGroups) as IngredientGroup[]).map(
                    (group) => {
                      const items = shoppingGroups[group];
                      if (items.length === 0) return null;
                      return (
                        <div key={group}>
                          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                            {ingredientGroups[group].icon}{" "}
                            {ingredientGroups[group].label}
                          </p>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <label
                                key={`${item.ingredientId}-${item.unit}`}
                                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                              >
                                <span className="text-sm font-black text-slate-950">
                                  {item.emoji} {item.name}
                                </span>
                                <span className="text-sm font-black text-slate-500">
                                  {formatAmount(item.amount, item.unit)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-500">
                  Chưa có dữ liệu đi chợ. Hãy lưu vài món tự tạo trước, app sẽ
                  tự gom nguyên liệu cần mua.
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "ingredients" ? (
          <section className="mt-6 space-y-4">
            <SectionTitle icon="🔎" label="Thư viện nguyên liệu" />
            <div className="rounded-[28px] bg-white p-4 shadow-lg shadow-pink-100/60 ring-1 ring-pink-100">
              <input
                value={ingredientSearch}
                onChange={(event) => setIngredientSearch(event.target.value)}
                placeholder="Tìm nguyên liệu, ví dụ: cá hồi, bí đỏ..."
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-100"
              />
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabButton
                  active={ingredientFilter === "all"}
                  onClick={() => setIngredientFilter("all")}
                >
                  Tất cả
                </TabButton>
                {(Object.keys(ingredientGroups) as IngredientGroup[]).map(
                  (group) => (
                    <TabButton
                      key={group}
                      active={ingredientFilter === group}
                      onClick={() => setIngredientFilter(group)}
                    >
                      {ingredientGroups[group].icon}{" "}
                      {ingredientGroups[group].label}
                    </TabButton>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-3">
              {visibleIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-50 text-2xl ring-1 ring-pink-100">
                      {ingredient.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-base font-black text-slate-950">
                          {ingredient.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400">
                          {ingredient.ageMinMonths}m+
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {ingredient.nutrition.kcalPer100} kcal/100g •{" "}
                        {ingredient.notes}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">
                          Đạm {ingredient.nutrition.proteinPer100}g
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-500">
                          Carb {ingredient.nutrition.carbPer100}g
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-600">
                          Béo {ingredient.nutrition.fatPer100}g
                        </span>
                        {ingredient.allergen ? (
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black text-rose-500">
                            Dị ứng: {ingredient.allergen}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
