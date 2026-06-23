export type IngredientUnit = "g" | "ml" | "piece";

export type IngredientGroup =
  | "grain"
  | "protein"
  | "vegetable"
  | "fruit"
  | "fat"
  | "dairy";

export type FoodCategory = IngredientGroup;

export type AllergyRisk = "low" | "medium" | "high";

export interface NutritionFacts {
  calories: number;
  proteinGram: number;
  fatGram: number;
  carbGram: number;
  fiberGram?: number;
  keyNutrients?: string[];
}

export interface IngredientNutrition {
  kcalPer100: number;
  proteinPer100: number;
  carbPer100: number;
  fatPer100: number;
}

export interface IngredientItem {
  id: string;
  name: string;
  emoji: string;
  group: IngredientGroup;
  defaultUnit: IngredientUnit;
  ageMinMonths: number;
  allergen?: string;
  notes: string;
  nutrition: IngredientNutrition;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  ageFromMonths: number;
  benefits: string[];

  emoji?: string;
  allergyRisk?: AllergyRisk;
  allergen?: string;
  notes?: string;

  nutrition?: NutritionFacts;

  kcalPer100g?: number;
  proteinPer100g?: number;
  carbPer100g?: number;
  fatPer100g?: number;
}

export interface CustomMealIngredient {
  ingredientId: string;
  amount: number;
  unit: IngredientUnit;
}

export interface CustomMealNutrition {
  calories: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
}

export interface CustomMealRecipe {
  id: string;
  babyId: string;
  name: string;
  ingredients: CustomMealIngredient[];
  nutrition: CustomMealNutrition;
  createdAt: string;
}

export interface ShoppingListItem {
  ingredientId: string;
  name: string;
  emoji: string;
  group: IngredientGroup;
  amount: number;
  unit: IngredientUnit;
}
