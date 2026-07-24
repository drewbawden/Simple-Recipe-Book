"use server";

import { ShoppingList } from "@/components/shopping-list/shopping-list";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function getShoppingList() {
  try {
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: 1,
      },
      include: {
        items: {
          include: {
            item: true,
            shoppingListItemSources: {
              include: {
                recipeIngredient: {
                  include: {
                    recipe: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shoppingList) return null;

    return {
      ...shoppingList,
      items: shoppingList.items.map((item) => ({
        ...item,
        shoppingListItemSources: item.shoppingListItemSources.map((source) => ({
          ...source,
          recipeIngredient: {
            ...source.recipeIngredient,
            normalQuantity:
              source.recipeIngredient.normalQuantity == null
                ? null
                : Number(source.recipeIngredient.normalQuantity),
            standardQuantity:
              source.recipeIngredient.standardQuantity == null
                ? null
                : Number(source.recipeIngredient.standardQuantity),
          },
        })),
      })),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch recipes" };
  }
}

export async function setItemCompleted(listItemId: number, completed: boolean) {
  await prisma.shoppingListItem.updateMany({
    where: {
      id: listItemId,
    },
    data: {
      completed,
    },
  });
}

export async function deleteItem(listItemId: number) {
  await prisma.shoppingListItem.delete({
    where: {
      id: listItemId,
    },
  });
}

export async function addRecipeToShoppingList(formData: FormData) {
  const ingredientIds = formData.getAll("ingredientIds").map(Number);

  return prisma.$transaction(async (tx) => {
    const shoppingList =
      (await tx.shoppingList.findFirst({
        orderBy: {
          updatedAt: "desc",
        },
      })) ??
      (await tx.shoppingList.create({
        data: {
          name: "Shopping List",
        },
      }));

    const ingredients = await tx.recipeIngredient.findMany({
      where: {
        id: {
          in: ingredientIds,
        },
      },
    });

    for (const ingredient of ingredients) {
      const existingItem = await tx.shoppingListItem.findFirst({
        where: {
          shoppingListId: shoppingList.id,
          itemId: ingredient.itemId,
        },
      });

      if (existingItem) {
        await tx.shoppingListItemSource.create({
          data: {
            shoppingListItemId: existingItem.id,
            recipeIngredientId: ingredient.id,
          },
        });
      } else {
        await tx.shoppingListItem.create({
          data: {
            shoppingListId: shoppingList.id,
            itemId: ingredient.itemId,

            shoppingListItemSources: {
              create: {
                recipeIngredientId: ingredient.id,
              },
            },
          },
        });
      }
    }

    return shoppingList;
  });
}
