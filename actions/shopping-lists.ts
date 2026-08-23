"use server";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { ItemType } from "../app/generated/prisma/enums";
import { normaliseItemName } from "@/lib/items";
import { computeCategory } from "@/lib/category";
import { dynamicListSort } from "@/lib/shopping-list";
import { listItem } from "@/types/list-item";

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

      const slug = category?.slug ?? "other";
      const displayName = category?.displayName ?? category?.slug ?? "Other";

      const existing = categories.get(slug);

      if (existing) {
        existing.items.push(item);
      } else {
        categories.set(slug, {
          slug,
          displayName,
          items: [item],
        });
      }
    }

    const categoriesArray = Array.from(categories.values()).map((category) => ({
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

    categoriesArray.sort(dynamicListSort("slug"));

    return categoriesArray;
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

export const addItemToList = async (
  itemName: string,
  categorySlug: string | null,
  manuallyAdded?: boolean,
  shoppingListId = 1,
  itemType = ItemType.FOOD,
) => {
  itemName = normaliseItemName(itemName);

  let category = null;
  if (categorySlug) {
    category = await prisma.itemCategory.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        slug: categorySlug,
        displayName: categorySlug,
      },
    });
  }

  const item = await prisma.item.upsert({
    where: {
      name: itemName,
    },
    update: {
      categorySlug: category ? category.slug : null,
      ...(manuallyAdded !== undefined
        ? { manuallyCategorised: manuallyAdded }
        : {}),
    },
    create: {
      name: itemName,
      type: itemType,
      categorySlug: category ? category.slug : null,
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
  await prisma.shoppingListItem.update({
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

    await tx.shoppingListItem.deleteMany({
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
      include: {
        item: true,
      },
    });

    for (const ingredient of ingredients) {
      await categoriseItem(ingredient.item.id, ingredient.item.name, tx);

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
      SELECT 
      *, similarity(lower(keyword), lower(${keyword})) as confidence 
      FROM "CategoryKeyword" 
      WHERE lower(keyword) % lower(${keyword})
      ORDER BY confidence DESC 
      LIMIT 20
    `;
    return matches;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fuzzy find keywords");
  }
};

export const clearShoppingList = async (listId = 1) => {
  try {
    await prisma.shoppingListItem.deleteMany({
      where: {
        shoppingListId: listId,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to clear shopping list");
  }
};

const categoriseItem = async (
  itemId: number,
  itemName: string,
  tx = prisma,
) => {
  const categorySlug = await computeCategory(itemName);

  if (!categorySlug) {
    return tx.item.update({
      where: { id: itemId },
      data: { categorySlug: null },
    });
  }

  const category = await tx.itemCategory.upsert({
    where: { slug: categorySlug },
    update: {},
    create: {
      slug: categorySlug,
      displayName: categorySlug,
    },
  });

  return tx.item.update({
    where: { id: itemId },
    data: {
      categorySlug: category.slug,
    },
  });
};

export const editListItem = async (data: listItem) => {
  const itemName = normaliseItemName(data.name);

  try {
    await prisma.$transaction(async (tx) => {
      let category = null;
      if (data.categorySlug && data.categorySlug !== "other") {
        category = await tx.itemCategory.upsert({
          where: { slug: data.categorySlug },
          update: {},
          create: {
            slug: data.categorySlug,
            displayName: data.categorySlug,
            userCreated: true,
          },
        });
      }

      await tx.shoppingListItem.update({
        where: {
          id: data.id,
        },
        data: {
          notes: data.notes,
          url: data.url,
          urgent: data.urgent,

          item: {
            update: {
              name: itemName,
              categorySlug: category ? category.slug : null,
              ...(category ? { manuallyCategorised: true } : {}),
            },
          },
        },
      });
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to update list item");
  }
};
