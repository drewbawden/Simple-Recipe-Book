"use server";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Category, ItemType } from "../app/generated/prisma/enums";
import { normaliseItemName } from "@/lib/items";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export const getShoppingListGroupedByCategory = async () => {
  try {
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { id: 1 },
      include: {
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
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

    if (!shoppingList) return [];

    return Object.values(Category)
      .map((categoryName) => {
        const items = shoppingList.items.filter(
          (listItem) => listItem.item.category?.name === categoryName,
        );

        if (items.length === 0) return null;

        const categoryId = items[0]?.item.category?.id ?? null;

        return {
          id: categoryId,
          name: categoryName,
          items: items.map((item) => ({
            ...item,
            shoppingListItemSources: item.shoppingListItemSources.map(
              (source) => ({
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
              }),
            ),
          })),
        };
      })
      .filter(
        (
          group,
        ): group is {
          id: number | null;
          name: Category;
          items: typeof shoppingList.items;
        } => group !== null,
      );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch grouped shopping list");
  }
};

export const getShoppingList = async () => {
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
    throw new Error("Failed to fetch shopping list");
  }
};

export const getCategories = async () => {
  try {
    const categories = await prisma.itemCategory.findMany();

    if (!categories) return null;

    console.log(categories);
    return categories;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch item categories");
  }
};

export const addItemToList = async (
  itemName: string,
  categoryName: Category,
  manuallyAdded?: boolean,
  shoppingListId = 1,
  itemType = ItemType.FOOD,
) => {
  itemName = normaliseItemName(itemName);

  const category = await prisma.itemCategory.upsert({
    where: {
      name: categoryName,
    },
    update: {},
    create: {
      name: categoryName,
    },
  });

  const item = await prisma.item.upsert({
    where: {
      name: itemName,
    },
    update: {
      categoryId: category.id,
      ...(manuallyAdded !== undefined
        ? { manuallyCategorised: manuallyAdded }
        : {}),
    },
    create: {
      name: itemName,
      type: itemType,
      categoryId: category.id,
      ...(manuallyAdded !== undefined
        ? { manuallyCategorised: manuallyAdded }
        : {}),
    },
  });

  const shoppingListItem = await prisma.shoppingListItem.create({
    data: {
      shoppingListId,
      itemId: item.id,
      completed: false,
    },
    include: {
      item: {
        include: {
          category: true,
        },
      },
    },
  });
};

export const setItemCompleted = async (
  listItemId: number,
  completed: boolean,
) => {
  await prisma.shoppingListItem.updateMany({
    where: {
      id: listItemId,
    },
    data: {
      completed,
    },
  });
};

export const deleteItem = async (listItemId: number) => {
  await prisma.$transaction(async (tx) => {
    await tx.shoppingListItemSource.deleteMany({
      where: {
        shoppingListItemId: listItemId,
      },
    });

    await tx.shoppingListItem.delete({
      where: {
        id: listItemId,
      },
    });
  });
};

export const addRecipeToShoppingList = async (formData: FormData) => {
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
};

export const getManualCategory = async (itemName: string) => {
  const manualCategory = await prisma.item.findUnique({
    where: {
      name: itemName,
      manuallyCategorised: true,
    },
    include: {
      category: true,
    },
  });

  return manualCategory;
};
