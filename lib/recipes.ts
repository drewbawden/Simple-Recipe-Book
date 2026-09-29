import { Recipe } from "@/types/recipe";

export const normaliseRecipes = (recipesData: any[]): Recipe[] =>
  recipesData.map((recipe) => ({
    ...recipe,
    ingredients: (recipe.ingredients ?? []).map((ingredient: any) => ({
      ...ingredient,
      item: {
        ...ingredient.item,
        type: ingredient.item?.type ?? "ingredient",
      },
    })),
  })) as Recipe[];
