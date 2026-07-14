/*
  Warnings:

  - You are about to alter the column `quantity` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `unit` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `totalFat` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `saturatedFat` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `cholesterol` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `sodium` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `potassium` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalCarbohydrates` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `dietaryFiber` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `sugar` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `protein` on the `Nutrition` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `customUnit` on the `RecipeIngredients` table. All the data in the column will be lost.
  - You are about to drop the column `foodId` on the `RecipeIngredients` table. All the data in the column will be lost.
  - The `unit` column on the `RecipeIngredients` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Foods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemId` to the `RecipeIngredients` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NormalisedUnit" AS ENUM ('GRAM', 'KILOGRAM', 'MILLILITRE', 'LITRE', 'TEASPOON', 'TABLESPOON', 'CUP', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('FOOD', 'HOUSEHOLD');

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Nutrition" DROP CONSTRAINT "Nutrition_productId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_typeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredients" DROP CONSTRAINT "RecipeIngredients_foodId_fkey";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "unit",
ADD COLUMN     "unit" "NormalisedUnit" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "Nutrition" ALTER COLUMN "totalFat" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "saturatedFat" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "cholesterol" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "sodium" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "potassium" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalCarbohydrates" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "dietaryFiber" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "sugar" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "protein" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "RecipeIngredients" DROP COLUMN "customUnit",
DROP COLUMN "foodId",
ADD COLUMN     "itemId" INTEGER NOT NULL,
ADD COLUMN     "normalisedQuantity" DOUBLE PRECISION,
ADD COLUMN     "normalisedUnit" "NormalisedUnit",
ALTER COLUMN "quantity" DROP NOT NULL,
DROP COLUMN "unit",
ADD COLUMN     "unit" TEXT;

-- DropTable
DROP TABLE "Categories";

-- DropTable
DROP TABLE "Foods";

-- DropTable
DROP TABLE "Products";

-- DropEnum
DROP TYPE "Units";

-- CreateTable
CREATE TABLE "StoreProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "brand" TEXT,
    "imageUrl" TEXT,
    "categoryId" INTEGER,
    "itemId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" SERIAL NOT NULL,
    "shoppingListId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "customName" TEXT,
    "quantity" TEXT,
    "unit" TEXT,
    "normalisedQuantity" DOUBLE PRECISION,
    "normalisedUnit" "NormalisedUnit",
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItemSource" (
    "id" SERIAL NOT NULL,
    "shoppingListItemId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingListItemSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecipesToShoppingListItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipesToShoppingListItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_barcode_key" ON "StoreProduct"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_brand_name_key" ON "StoreProduct"("brand", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE INDEX "_RecipesToShoppingListItem_B_index" ON "_RecipesToShoppingListItem"("B");

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StoreProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredients" ADD CONSTRAINT "RecipeIngredients_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItemSource" ADD CONSTRAINT "ShoppingListItemSource_shoppingListItemId_fkey" FOREIGN KEY ("shoppingListItemId") REFERENCES "ShoppingListItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItemSource" ADD CONSTRAINT "ShoppingListItemSource_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipesToShoppingListItem" ADD CONSTRAINT "_RecipesToShoppingListItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipesToShoppingListItem" ADD CONSTRAINT "_RecipesToShoppingListItem_B_fkey" FOREIGN KEY ("B") REFERENCES "ShoppingListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
