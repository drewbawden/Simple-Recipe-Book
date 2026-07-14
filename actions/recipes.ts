"use server"

import { PrismaClient, Prisma, RecipeTypes, NormalUnit, ItemType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { tryNormaliseQuantity, tryStandardiseUnit, normaliseUnit } from "./normaliseUnits";

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

function parseQuantity(input: string) {
  const formattedInput = input.replace(/(\d+(?:\.\d+)?)([a-zA-Z\u½-⅞]+)/g, "$1 $2");

  const tokens = formattedInput.trim().replace(/\s+/g, ' ').split(' ');

  let quantityText = null;
  let unitText = null;
  let standardisedQuantity = null;
  let standardisedUnit = null;

  let quantityCutoff = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tokensCutOff = tokens.slice(0, tokens.length - i);
    const standardQuantity = tryNormaliseQuantity(tokensCutOff.join(' '));
    if (standardQuantity) {
      quantityText = tokensCutOff.join(' ');
      standardisedQuantity = standardQuantity;
      quantityCutoff = tokens.length - i;
      break;
    }
  }

  for (let i = 0; i < tokens.length - quantityCutoff; i++) {
    const tokensCutOff = tokens.slice(quantityCutoff + i, tokens.length);
    const standardUnit = tryStandardiseUnit(tokensCutOff.join(' '));

    if (standardUnit) {
      unitText = tokensCutOff.join(' ');
      standardisedUnit = standardUnit;
      break;
    }
  }

  if (standardisedQuantity === null && standardisedUnit !== null) {
    quantityText = '';
    standardisedQuantity = 1;
  }

  let normalisedQuantity = null;
  let normalisedUnit = null;
  if (standardisedUnit && standardisedQuantity) {
    ({ normalisedQuantity, normalisedUnit } = normaliseUnit(standardisedQuantity, standardisedUnit))
  }
  else if (standardisedUnit === null && standardisedQuantity === null) {
    throw new Error('Quantity and units not parseable');
  }

  return {
    quantity: quantityText,
    unit: unitText,
    ...(normalisedQuantity !== null && {
      normalisedQuantity,
    }),
    ...(normalisedUnit !== null && {
      normalisedUnit,
    }),
  }
}
