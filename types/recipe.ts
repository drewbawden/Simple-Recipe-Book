import { RecipeType } from "@/app/generated/prisma/enums";

export interface ItemDetails {
  id: number;
  name: string;
  type: string;
}

export interface Ingredient {
  id: number;
  recipeId: number;
  itemId: number;
  quantity: string;
  unit: string | null;
  standardQuantity: number | null;
  standardUnit: string | null;
  normalQuantity: number | null;
  normalUnit: string | null;
  item: ItemDetails;
}
export interface RecipeIngredientInput {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: number;
  name: string;
  types: string[];
  notes: string | null;
  url: string | null;
  totalTimeMins: number | null;
  servingSize: number | null;
  imagePath: string | null;
  ingredients: Ingredient[];
  instructions: RecipeInstructionStep[];
}

export interface RecipeFormData {
  name: string;
  recipeTypes: RecipeType[];
  url: string | null;
  notes: string | null;
  servingSize: number | null;
  totalTimeMins: number | null;
  imagePath: string | null;
  ingredients: RecipeIngredientInput[];
  instructions: RecipeInstructionInput[];
}

export interface RecipeInstructionStep {
  id: number;
  recipeId: number;
  stepNumber: number;
  method: string;
  category: string | null;
}
export interface RecipeInstructionInput {
  stepNumber: number;
  method: string;
  category: string | null;
}
