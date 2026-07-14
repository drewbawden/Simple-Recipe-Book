/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Recipes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RecipeIngredients_recipeId_foodId_key";

-- AlterTable
ALTER TABLE "RecipeIngredients" ALTER COLUMN "quantity" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Recipes_name_key" ON "Recipes"("name");
