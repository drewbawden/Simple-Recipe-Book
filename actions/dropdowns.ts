"use server"

import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


export async function getCategories() {
  try {
    return await prisma.category.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}
