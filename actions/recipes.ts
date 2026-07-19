"use server"

import { PrismaClient, RecipeType, ItemType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { parseQuantity } from "@/lib/quantity";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


export async function getRecipes() {
  try {
    const recipes = await prisma.recipes.findMany({
      include: {
        ingredients: {
          include: {
            item: true,
          },
        },
      },
    });;

    return recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.map(ingredient => ({
        ...ingredient,
        normalQuantity: ingredient.normalQuantity
          ? Number(ingredient.normalQuantity)
          : null
      }))
    }));

  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch recipes" };
  }
}

export async function insertNewRecipe(formData: FormData) {
  const name = formData.get("name") as string;
  const recipeTypes = formData.getAll("recipeType") as RecipeType[];
  const notes = formData.get("notes") as string;
  const url = formData.get("url") as string;
  const servingSizeValue = formData.get("servingSize");
  const totalTimeMinsValue = formData.get("totalTime");
  const ingredients = JSON.parse(formData.get("ingredients") as string)
  const image = formData.get("recipeImage") as File;

  const servingSize =
    servingSizeValue === null ? null : Number(servingSizeValue);
  const totalTimeMins =
    totalTimeMinsValue === null ? null : Number(totalTimeMinsValue);

  let imagePath = null;
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = image.name.split(".").pop();
    const filename = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "recipe-pictures");

    await writeFile(
      path.join(uploadDir, filename),
      buffer
    );
    imagePath = `/recipe-pictures/${filename}`;
  }

  await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipes.create({
      data: {
        name,
        types: recipeTypes as RecipeType[],
        url,
        notes,
        servingSize,
        totalTimeMins,
        imagePath,

        ingredients: {
          create: await Promise.all(
            ingredients.map(async (ingredient) => {
              const parsed = parseQuantity(ingredient.quantity);

              let item;

              // Case 1: existing food from autocomplete
              if (ingredient.itemId) {
                item = await tx.item.findUnique({
                  where: {
                    id: ingredient.itemId
                  }
                });

                if (!item) {
                  throw new Error(
                    `Item with id ${ingredient.itemId} does not exist`
                  );
                }
              }

              // Case 2: No itemId, search by name/create if missing
              else {
                item = await tx.item.upsert({
                  where: {
                    name: ingredient.name
                  },
                  update: {},
                  create: {
                    name: ingredient.name,
                    type: ItemType.FOOD,
                  }
                });
              }

              return {
                itemId: item.id,
                quantity: parsed.quantity,
                unit: parsed.unit,
                normalQuantity: parsed.normalisedQuantity,
                normalUnit: parsed.normalisedUnit,
              };
            })
          )
        }
      }
    });
  });
}
