"use server";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export const getCategories = async () => {
  try {
    const categories = await prisma.itemCategory.findMany({
      orderBy: {
        orderIndex: "asc",
      },
    });
    if (!categories) return null;
    return categories;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch item categories");
  }
};

export const deleteCategory = async (slug: string) => {
  try {
    await prisma.itemCategory.delete({
      where: {
        slug: slug,
        userCreated: true,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to delete item category");
  }
};

interface OrderCategory {
  id: string;
  label: string;
}
export const updateCategoryIndices = async (categories: OrderCategory[]) => {
  for (const [index, category] of categories.entries()) {
    await prisma.itemCategory.update({
      where: {
        slug: category.id,
      },
      data: {
        orderIndex: index,
      },
    });
  }
};

export const getItemTags = async () => {
  try {
    const tags = await prisma.shoppingListTag.findMany();
    if (!tags) return null;
    return tags;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch item tags");
  }
};
