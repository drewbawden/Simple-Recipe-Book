"use server";

import { PrismaClient, RecipeType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

interface addMealProps {
  startDate: Date;
  endDate: Date;
  customText?: string;
  recipeId?: number | null;
  mealType: RecipeType;
}
export const addMeal = async ({
  startDate,
  endDate,
  customText,
  recipeId,
  mealType = RecipeType.DINNER,
}: addMealProps) => {
  if (!customText?.trim() && recipeId == null) {
    throw new Error("A meal name or recipe is required");
  }

  return await prisma.mealPlanItem.create({
    data: {
      startDate,
      endDate,
      mealType,
      ...(customText?.trim() && { customText: customText.trim() }),
      ...(recipeId && { recipeId }),
    },
  });
};

export const getMeals = async () => {
  return await prisma.mealPlanItem.findMany();
};
