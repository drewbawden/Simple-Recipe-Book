"use server"

import { ShoppingList } from "@/components/shoppingList";
import { PrismaClient} from "../app/generated/prisma/client";
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
        const listItems = await prisma.shoppingList.findUnique({
            where: {
                id: 1
            },
            include: {
                items: {
                    include: {
                        item: true,
                        shoppingListItemSources: true
                    }
                }
            }
        })

        if (!listItems) {
            return null;
        }

        return {
            ...listItems,
            items: listItems.items.map(item => ({
                ...item,
                normalQuantity: item.normalQuantity
                    ? Number(item.normalQuantity)
                    : null,
            }))
        }
    }
    catch (error) {
        console.error('Database Error:', error);
        return {success: false, error: "Failed to fetch recipes"}
    }
}

export async function setItemCompleted(listItemId: number, completed: boolean) {
    await prisma.shoppingListItem.update({
        where: {
            id: listItemId
        },
        data: {
            completed
        }
    })
}

export async function deleteItem(listItemId: number) {
    await prisma.shoppingListItem.delete({
        where: {
            id: listItemId
        }
    })
}

export async function addRecipeToShoppingList(formData: FormData) {
    const ingredientIdValues = formData.getAll('ingredientIds');
    const ingredientIds = ingredientIdValues.map(Number);
    console.log(ingredientIds);

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
        await tx.shoppingListItem.create({
            data: {
            shoppingListId: shoppingList.id,

            itemId: ingredient.itemId,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            normalQuantity: ingredient.normalQuantity,
            normalUnit: ingredient.normalUnit,

            shoppingListItemSources: {
                create: {
                recipeId: ingredient.recipeId,
                },
            },
            },
        });
        }
  });
}