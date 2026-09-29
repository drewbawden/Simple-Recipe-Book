"use server";

import { broadcast } from "@/lib/event";
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

  await prisma.mealPlanItem.create({
    data: {
      startDate,
      endDate,
      mealType,
      ...(customText?.trim() && { customText: customText.trim() }),
      ...(recipeId && { recipeId }),
    },
  });

  broadcastUpdate();
};

export const getMeals = async () => {
  return await prisma.mealPlanItem.findMany();
};

export const deleteMeal = async (mealId: number) => {
  try {
    await prisma.mealPlanItem.delete({
      where: {
        id: mealId,
      },
    });
    broadcastUpdate();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to clear shopping list");
  }
};

const broadcastUpdate = () => {
  broadcast("meals-updated", {});
};
