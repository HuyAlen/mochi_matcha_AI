"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import { useTrackingStore } from "@/src/store/trackingStore";
import {
  ActivitySheetShell,
  BabySelector,
  FieldLabel,
  PrimaryButton,
} from "./ActivitySheetShared";

type Props = {
  babyId: BabyId;
  onBabyChange: (babyId: BabyId) => void;
  onClose: () => void;
  onSave: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
};

type MealTime = "Sáng" | "Trưa" | "Chiều" | "Tối";
type MealAmount = "Ít" | "Vừa" | "Nhiều";

type FoodPreset = {
  label: string;
  emoji: string;
  group:
    | "common"
    | "grain"
    | "fruit"
    | "vegetable"
    | "protein"
    | "dairy"
    | "other";
};

type ReactionOption = {
  label: string;
  shortLabel: string;
  value: string;
  emoji: string;
};

const mealTimes: MealTime[] = ["Sáng", "Trưa", "Chiều", "Tối"];

const foodPresets: FoodPreset[] = [
  { label: "Cháo", emoji: "🥣", group: "common" },
  { label: "Yến mạch", emoji: "🌾", group: "grain" },
  { label: "Cơm nát", emoji: "🍚", group: "grain" },
  { label: "Bún", emoji: "🍜", group: "grain" },
  { label: "Khoai lang", emoji: "🍠", group: "vegetable" },
  { label: "Bí đỏ", emoji: "🎃", group: "vegetable" },
  { label: "Cà rốt", emoji: "🥕", group: "vegetable" },
  { label: "Bông cải", emoji: "🥦", group: "vegetable" },
  { label: "Đậu hũ", emoji: "◻️", group: "protein" },
  { label: "Trứng", emoji: "🥚", group: "protein" },
  { label: "Thịt gà", emoji: "🍗", group: "protein" },
  { label: "Thịt bò", emoji: "🥩", group: "protein" },
  { label: "Cá hồi", emoji: "🐟", group: "protein" },
  { label: "Chuối", emoji: "🍌", group: "fruit" },
  { label: "Bơ", emoji: "🥑", group: "fruit" },
  { label: "Táo", emoji: "🍎", group: "fruit" },
  { label: "Lê", emoji: "🍐", group: "fruit" },
  { label: "Đu đủ", emoji: "🧡", group: "fruit" },
  { label: "Sữa chua", emoji: "🥛", group: "dairy" },
  { label: "Phô mai", emoji: "🧀", group: "dairy" },
  { label: "Khác", emoji: "✨", group: "other" },
];

const amountOptions: MealAmount[] = ["Ít", "Vừa", "Nhiều"];

const reactionOptions: ReactionOption[] = [
  { label: "Thích", shortLabel: "Thích", value: "😍 Thích", emoji: "😍" },
  {
    label: "Bình thường",
    shortLabel: "Ổn",
    value: "🙂 Bình thường",
    emoji: "🙂",
  },
  { label: "Ăn ít", shortLabel: "Ít", value: "😐 Ăn ít", emoji: "😐" },
  { label: "Nôn/trớ", shortLabel: "Nôn", value: "🤮 Nôn/trớ", emoji: "🤮" },
  { label: "Dị ứng", shortLabel: "Dị ứng", value: "🌡 Dị ứng", emoji: "🌡" },
];

function getCurrentMealTime(): MealTime {
  const hour = new Date().getHours();

  if (hour < 10) return "Sáng";
  if (hour < 14) return "Trưa";
  if (hour < 18) return "Chiều";
  return "Tối";
}

function amountToValue(amount: MealAmount) {
  if (amount === "Ít") return 0.5;
  if (amount === "Nhiều") return 1.5;
  return 1;
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

function getMealSummary(entry?: TrackingEntry) {
  if (!entry) {
    return {
      primary: "Chưa có bữa ăn gần đây",
      secondary: "Ghi bữa đầu tiên cho bé nhé",
    };
  }

  const parts = entry.note?.split(" · ").filter(Boolean) ?? [];
  const mealTime = parts[0];
  const food = parts[1];
  const amount = parts[2];
  const reaction = parts[3];

  return {
    primary:
      [mealTime, food].filter(Boolean).join(" • ") || "Đã ghi nhận bữa ăn",
    secondary:
      [amount, reaction].filter(Boolean).join(" • ") || "Có dữ liệu bữa ăn",
  };
}

function getReactionLabel(value: string) {
  return reactionOptions.find((item) => item.value === value)?.label ?? value;
}

export default function MealActivitySheet({
  babyId,
  onBabyChange,
  onClose,
  onSave,
}: Props) {
  const entries = useTrackingStore((state) => state.entries);

  const [mealTime, setMealTime] = useState<MealTime>(() =>
    getCurrentMealTime(),
  );
  const [food, setFood] = useState("Cháo");
  const [customFood, setCustomFood] = useState("");
  const [amount, setAmount] = useState<MealAmount>("Vừa");
  const [reaction, setReaction] = useState("🙂 Bình thường");
  const [isNewFood, setIsNewFood] = useState(false);
  const [showAllFoods, setShowAllFoods] = useState(false);
  const [note, setNote] = useState("");

  const latestMeal = useMemo(() => {
    return entries
      .filter((entry) => entry.babyId === babyId && entry.type === "meal")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
  }, [babyId, entries]);

  const selectedFood = useMemo(() => {
    if (food === "Khác") return customFood.trim();
    return food;
  }, [customFood, food]);

  const visibleFoods = showAllFoods ? foodPresets : foodPresets.slice(0, 8);
  const mealSummary = getMealSummary(latestMeal);
  const selectedReactionIndex = Math.max(
    reactionOptions.findIndex((item) => item.value === reaction),
    0,
  );
  const canSave = selectedFood.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) return;

    const details = [
      mealTime,
      selectedFood,
      amount,
      reaction,
      isNewFood ? "Món mới" : "",
      note.trim(),
    ].filter(Boolean);

    onSave({
      babyId,
      type: "meal",
      value: amountToValue(amount),
      unit: "bữa",
      note: details.join(" · "),
    });
  }

  return (
    <ActivitySheetShell
      eyebrow="Ăn dặm"
      title="Bữa ăn"
      icon="🥣"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <BabySelector value={babyId} onChange={onBabyChange} />

        <div className="rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-500">
                Lần trước
              </p>
              <p className="mt-0.5 truncate text-xs font-black text-slate-700">
                {mealSummary.primary}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400">
                {mealSummary.secondary}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-amber-500 ring-1 ring-amber-100">
              {latestMeal ? formatTime(latestMeal.createdAt) : "--:--"}
            </span>
          </div>
        </div>

        <div>
          <FieldLabel>Bữa</FieldLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {mealTimes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMealTime(item)}
                className={`h-9 rounded-2xl px-2 text-[11px] font-black transition active:scale-[0.98] ${
                  mealTime === item
                    ? "bg-amber-400 text-white shadow-sm"
                    : "bg-amber-50 text-slate-600 ring-1 ring-amber-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Món ăn</FieldLabel>
            <button
              type="button"
              onClick={() => setShowAllFoods((current) => !current)}
              className="mb-1 text-[10px] font-black text-amber-500"
            >
              {showAllFoods ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {visibleFoods.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setFood(item.label)}
                className={`flex h-9 min-w-0 items-center justify-center rounded-2xl px-2 text-[11px] font-black transition active:scale-[0.98] ${
                  food === item.label
                    ? "bg-amber-400 text-white shadow-sm"
                    : "bg-amber-50 text-slate-600 ring-1 ring-amber-100"
                }`}
              >
                <span className="mr-1.5 shrink-0">{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {food === "Khác" ? (
            <input
              value={customFood}
              onChange={(event) => setCustomFood(event.target.value)}
              placeholder="Nhập tên món..."
              className="mt-1.5 h-10 w-full rounded-2xl bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
            />
          ) : null}
        </div>

        <div>
          <FieldLabel>Lượng ăn</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {amountOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAmount(item)}
                className={`h-9 rounded-2xl px-2 text-xs font-black transition active:scale-[0.98] ${
                  amount === item
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-pink-50 text-slate-600 ring-1 ring-pink-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Phản ứng</FieldLabel>
          <div className="grid grid-cols-5 gap-1.5">
            {reactionOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setReaction(item.value)}
                aria-label={item.label}
                title={item.label}
                className={`flex h-11 min-w-0 items-center justify-center rounded-2xl text-center font-black leading-none transition active:scale-[0.98] ${
                  reaction === item.value
                    ? "bg-purple-500 text-white shadow-sm"
                    : "bg-purple-50 text-slate-600 ring-1 ring-purple-100"
                }`}
              >
                <span className="text-xl leading-none">{item.emoji}</span>
              </button>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-5 gap-1.5">
            {reactionOptions.map((item, index) => (
              <div key={item.value} className="min-h-3 text-center">
                {selectedReactionIndex === index ? (
                  <span className="block truncate text-[10px] font-black leading-none text-slate-400">
                    {item.label}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewFood((current) => !current)}
          className={`flex h-10 w-full items-center gap-2 rounded-2xl px-3 text-xs font-black transition active:scale-[0.98] ${
            isNewFood
              ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
              : "bg-slate-50 text-slate-500 ring-1 ring-slate-100"
          }`}
        >
          <span
            className={`flex size-4 shrink-0 items-center justify-center rounded-md text-[10px] ${
              isNewFood
                ? "bg-amber-400 text-white"
                : "bg-white text-transparent ring-1 ring-slate-200"
            }`}
          >
            ✓
          </span>
          Đây là món mới
        </button>

        <label className="block">
          <FieldLabel>Ghi chú</FieldLabel>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: ăn hết nửa chén, hơi ngán..."
            className="min-h-14 w-full resize-none rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-100 placeholder:text-slate-300"
          />
        </label>

        <div className="sticky bottom-0 -mx-3.5 bg-white/95 px-3.5 pb-1.5 pt-2 backdrop-blur sm:-mx-4 sm:px-4">
          <PrimaryButton disabled={!canSave}>Lưu bữa ăn</PrimaryButton>
          {!canSave ? (
            <p className="mt-1 text-center text-[10px] font-bold text-slate-400">
              Nhập tên món trước khi lưu.
            </p>
          ) : null}
        </div>
      </form>
    </ActivitySheetShell>
  );
}
