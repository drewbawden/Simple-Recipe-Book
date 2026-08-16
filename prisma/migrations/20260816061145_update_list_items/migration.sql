/*
  Warnings:

  - You are about to drop the column `categoryId` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `customName` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `StoreProduct` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShoppingListCategory` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `itemId` on table `ShoppingListItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "StoreProduct" DROP CONSTRAINT "StoreProduct_categoryId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "categoryId",
DROP COLUMN "customName",
ALTER COLUMN "itemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StoreProduct" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "ShoppingListCategory";

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
