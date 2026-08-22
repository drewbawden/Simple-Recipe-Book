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
