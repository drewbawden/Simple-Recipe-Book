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
  unit: string;
  standardQuantity: number;
  standardUnit: string;
  normalQuantity: number;
  normalUnit: string;
  item: ItemDetails;
}

export interface Recipe {
  id: number;
  name: string;
  types: string[];
  notes: string;
  url: string;
  totalTimeMins: number;
  servingSize: number;
  imagePath: string | null;
  ingredients: Ingredient[];
}
