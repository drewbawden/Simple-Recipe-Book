"use server"

import { PrismaClient} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


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