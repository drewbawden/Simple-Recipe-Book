/*
  Warnings:

  - You are about to drop the column `tagId` on the `Item` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_tagId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "tagId";

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "tagId" INTEGER;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ShoppingListTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
