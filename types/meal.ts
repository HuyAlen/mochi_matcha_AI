import type { BabyId } from "./baby";

export type MealTime = "breakfast" | "lunch" | "snack" | "dinner";

export interface MealRecipe {
  id: string;
  title: string;
  emoji: string;
  mealTime: MealTime;
  ageFromMonths: number;
  description: string;
  ingredients: string[];
  nutritionTags: string[];
  calories: number;
  proteinGram: number;
  prepMinutes: number;
}

export interface MealEntry {
  id: string;
  babyId: BabyId;
  recipeId: string;
  eatenPercent: number;
  reaction?: "normal" | "liked" | "rejected" | "allergy";
  note?: string;
  createdAt: string;
}

export interface WeeklyMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}
