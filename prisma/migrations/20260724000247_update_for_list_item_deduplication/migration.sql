/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `normalQuantity` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `normalUnit` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `recipeId` on the `ShoppingListItemSource` table. All the data in the column will be lost.
  - Made the column `itemId` on table `ShoppingListItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `recipeIngredientId` to the `ShoppingListItemSource` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingListItemSource" DROP CONSTRAINT "ShoppingListItemSource_recipeId_fkey";

-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "createdAt",
DROP COLUMN "normalQuantity",
DROP COLUMN "normalUnit",
DROP COLUMN "quantity",
DROP COLUMN "unit",
ALTER COLUMN "itemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ShoppingListItemSource" DROP COLUMN "recipeId",
ADD COLUMN     "recipeIngredientId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItemSource" ADD CONSTRAINT "ShoppingListItemSource_recipeIngredientId_fkey" FOREIGN KEY ("recipeIngredientId") REFERENCES "RecipeIngredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
