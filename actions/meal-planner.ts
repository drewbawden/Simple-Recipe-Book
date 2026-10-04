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
  startDate: string;
  endDate: string;
  customText?: string;
  recipeId?: number;
  mealType?: RecipeType;
}

const parseCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid calendar date");

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid calendar date");
  }

  return date;
};

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
      startDate: parseCalendarDate(startDate),
      endDate: parseCalendarDate(endDate),
      mealType,
      ...(customText?.trim() && { customText: customText.trim() }),
      ...(recipeId && { recipeId }),
    },
  });

  broadcastUpdate();
};

export const moveMeal = async ({
  mealId,
  startDate,
  endDate,
}: {
  mealId: number;
  startDate: string;
  endDate: string;
}) => {
  if (!Number.isInteger(mealId)) throw new Error("Invalid meal ID");

  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);
  if (start > end) throw new Error("End date must not be before start date");

  await prisma.mealPlanItem.update({
    where: { id: mealId },
    data: { startDate: start, endDate: end },
  });

  broadcastUpdate();
};

export const getMeals = async () => {
  return await prisma.mealPlanItem.findMany({
    include: {
      recipe: {
        select: {
          name: true,
        },
      },
    },
  });
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
