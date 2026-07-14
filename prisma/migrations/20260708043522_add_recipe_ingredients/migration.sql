/*
  Warnings:

  - You are about to drop the `Ingredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Units" ADD VALUE 'TEASPOON';
ALTER TYPE "Units" ADD VALUE 'TABLESPOON';
ALTER TYPE "Units" ADD VALUE 'CUP';

-- DropForeignKey
ALTER TABLE "Ingredients" DROP CONSTRAINT "Ingredients_recipesId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_typeId_fkey";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "Ingredients";

-- CreateTable
CREATE TABLE "Foods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnits" "Units",

    CONSTRAINT "Foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredients" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Units" NOT NULL,

    CONSTRAINT "RecipeIngredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredients_recipeId_foodId_key" ON "RecipeIngredients"("recipeId", "foodId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredients" ADD CONSTRAINT "RecipeIngredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredients" ADD CONSTRAINT "RecipeIngredients_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
