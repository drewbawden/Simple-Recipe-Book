/*
  Warnings:

  - Made the column `shoppingListId` on table `ShoppingListTag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ShoppingListTag" DROP CONSTRAINT "ShoppingListTag_shoppingListId_fkey";

-- AlterTable
ALTER TABLE "ShoppingListTag" ALTER COLUMN "shoppingListId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingListTag" ADD CONSTRAINT "ShoppingListTag_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
