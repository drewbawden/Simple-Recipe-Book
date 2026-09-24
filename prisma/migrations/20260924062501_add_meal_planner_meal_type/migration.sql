/*
  Warnings:

  - Added the required column `mealType` to the `MealPlanItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPlanItem" ADD COLUMN     "mealType" "RecipeType" NOT NULL;
