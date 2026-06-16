export type FoodCategory =
  | "grain"
  | "protein"
  | "vegetable"
  | "fruit"
  | "fat"
  | "dairy";

export interface NutritionFacts {
  calories: number;
  proteinGram: number;
  fatGram: number;
  carbGram: number;
  fiberGram: number;
  keyNutrients: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  ageFromMonths: number;
  allergyRisk: "low" | "medium" | "high";
  benefits: string[];
  nutrition: NutritionFacts;
}
