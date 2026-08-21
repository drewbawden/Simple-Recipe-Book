"use server";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { ItemType } from "../app/generated/prisma/enums";
import { normaliseItemName } from "@/lib/items";
import { categoryEnumToName } from "@/lib/category";

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

    const categories = new Map<
      string,
      {
        slug: string;
        displayName: string | null;
        items: typeof shoppingList.items;
      }
    >();

    for (const item of shoppingList.items) {
      const category = item.item.category;

      if (!category) continue;

      const slug = category.slug;

      const existing = categories.get(slug);

      if (existing) {
        existing.items.push(item);
      } else {
        categories.set(slug, {
          slug,
          displayName: category.displayName ?? slug,
          items: [item],
        });
      }
    }

    return Array.from(categories.values()).map((category) => ({
      ...category,
      items: category.items.map((item) => ({
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
    }));
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
  categorySlug: string,
  manuallyAdded?: boolean,
  shoppingListId = 1,
  itemType = ItemType.FOOD,
) => {
  itemName = normaliseItemName(itemName);

  const category = await prisma.itemCategory.upsert({
    where: { slug: categorySlug },
    update: {},
    create: {
      slug: categorySlug,
      displayName: categoryEnumToName(categorySlug as any) ?? categorySlug,
    },
  });

  const item = await prisma.item.upsert({
    where: {
      name: itemName,
    },
    update: {
      categorySlug: category.slug,
      ...(manuallyAdded !== undefined
        ? { manuallyCategorised: manuallyAdded }
        : {}),
    },
    create: {
      name: itemName,
      type: itemType,
      categorySlug: category.slug,
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

export const fuzzyFindKeywords = async (keyword: string) => {
  try {
    const matches = await prisma.$queryRaw`
      SELECT *, similarity(keyword, ${keyword}) as confidence FROM "CategoryKeyword" WHERE keyword % ${keyword} ORDER BY confidence DESC
    `;
    return matches;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fuzzy find keywords");
  }
};
