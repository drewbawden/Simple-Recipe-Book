"use server";

import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Product } from "@/types/inventory";
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
  recipeId: number;
}
export const addMeal = async ({
  startDate,
  endDate,
  customText,
  recipeId,
}: addMealProps) => {
  if (!customText && recipeId === null) return;

  prisma.mealPlanItem.create({
    data: {
      startDate,
      endDate,
      ...(customText && { customText }),
      ...(recipeId && { recipeId }),
    },
  });
};
