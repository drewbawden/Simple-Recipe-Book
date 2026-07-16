"use server"

import { PrismaClient, RecipeTypes, ItemType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { parseQuantity } from "@/lib/quantity";

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
  const recipeType = formData.get("recipeType") as RecipeTypes;
  const notes = formData.get("notes") as string;
  const url = formData.get("url") as string;
  const ingredients = JSON.parse(
    formData.get("ingredients") as string
  )

  if (!Object.values(RecipeTypes).includes(recipeType)) {
    throw new Error("Invalid recipe type");
  }

  await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipes.create({
      data: {
        name,
        type: recipeType as RecipeTypes,
        url,
        notes,

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
