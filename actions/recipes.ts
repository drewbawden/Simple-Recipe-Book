"use server";

import {
  PrismaClient,
  RecipeType,
  ItemType,
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { parseQuantity } from "@/lib/quantity";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { Recipe, RecipeFormData } from "@/types/recipe";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function getRecipes() {
  const recipes = await prisma.recipes.findMany({
    include: {
      ingredients: {
        include: {
          item: true,
        },
      },
    },
  });

  return recipes.map((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      normalQuantity: ingredient.normalQuantity
        ? Number(ingredient.normalQuantity)
        : null,
      standardQuantity: ingredient.standardQuantity
        ? Number(ingredient.standardQuantity)
        : null,
    })),
  }));
}

async function parseFormData(formData: FormData) {
  const name = formData.get("name") as string;
  const recipeTypes = formData.getAll("recipeType") as RecipeType[];
  const notes = formData.get("notes") as string;
  const url = formData.get("url") as string;
  const servingSizeValue = formData.get("servingSize");
  const totalTimeMinsValue = formData.get("totalTime");
  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const image = formData.get("recipeImage") as File;
  const existingImagePath = formData.get("existingImagePath") as string;

  const servingSize =
    servingSizeValue === null ? null : Number(servingSizeValue);
  const totalTimeMins =
    totalTimeMinsValue === null ? null : Number(totalTimeMinsValue);

  let imagePath = existingImagePath || null;
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = image.name.split(".").pop();
    const filename = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "recipe-pictures");

    await writeFile(path.join(uploadDir, filename), buffer);
    imagePath = `/recipe-pictures/${filename}`;
  }

  return {
    name,
    recipeTypes,
    notes,
    url,
    servingSize,
    totalTimeMins,
    ingredients,
    imagePath,
  };
}

export async function updateRecipe(recipeId: number, formData: FormData) {
  const data: RecipeFormData = await parseFormData(formData);
  await prisma.$transaction(async (tx) => {
    await tx.recipes.update({
      where: {
        id: recipeId,
      },
      data: {
        name: data.name,
        types: data.recipeTypes as RecipeType[],
        url: data.url,
        notes: data.notes,
        servingSize: data.servingSize,
        totalTimeMins: data.totalTimeMins,
        imagePath: data.imagePath,

        ingredients: {
          deleteMany: {},
          create: await Promise.all(
            data.ingredients.map(async (ingredient) => {
              const parsed = parseQuantity(ingredient.quantity);

              if (parsed.quantity === null) {
                throw new Error(
                  `Invalid quantity for ingredient: ${ingredient.name}`,
                );
              }

              let item;
              item = await tx.item.upsert({
                where: {
                  name: ingredient.name,
                },
                update: {},
                create: {
                  name: ingredient.name,
                  type: ItemType.FOOD,
                },
              });

              return {
                itemId: item.id,
                quantity: parsed.quantity,
                unit: parsed.unit,
                standardQuantity: parsed.standardisedQuantity,
                standardUnit: parsed.standardisedUnit,
                normalQuantity: parsed.normalisedQuantity,
                normalUnit: parsed.normalisedUnit,
              };
            }),
          ),
        },
      },
    });
  });
  await cleanUpShoppingList();
}

export async function deleteRecipe(recipeId: number) {
  await prisma.recipes.delete({
    where: {
      id: recipeId,
    },
  });
  await cleanUpShoppingList();
}

async function cleanUpShoppingList() {
  await prisma.shoppingListItem.deleteMany({
    where: {
      customName: null,
      shoppingListItemSources: {
        none: {},
      },
    },
  });
}

export async function insertNewRecipe(formData: FormData) {
  const data: RecipeFormData = await parseFormData(formData);

  await prisma.$transaction(async (tx) => {
    const recipe = await tx.recipes.create({
      data: {
        name: data.name,
        types: data.recipeTypes as RecipeType[],
        url: data.url,
        notes: data.notes,
        servingSize: data.servingSize,
        totalTimeMins: data.totalTimeMins,
        imagePath: data.imagePath,

        ingredients: {
          create: await Promise.all(
            data.ingredients.map(async (ingredient) => {
              const parsed = parseQuantity(ingredient.quantity);

              if (parsed.quantity === null) {
                throw new Error(
                  `Invalid quantity for ingredient: ${ingredient.name}`,
                );
              }

              let item;
              item = await tx.item.upsert({
                where: {
                  name: ingredient.name,
                },
                update: {},
                create: {
                  name: ingredient.name,
                  type: ItemType.FOOD,
                },
              });

              return {
                itemId: item.id,
                quantity: parsed.quantity,
                unit: parsed.unit,
                standardQuantity: parsed.standardisedQuantity,
                standardUnit: parsed.standardisedUnit,
                normalQuantity: parsed.normalisedQuantity,
                normalUnit: parsed.normalisedUnit,
              };
            }),
          ),
        },
      },
    });
  });
}
