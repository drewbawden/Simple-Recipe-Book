/*
  Warnings:

  - The `type` column on the `Recipes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RecipeTypes" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- AlterTable
ALTER TABLE "Recipes" DROP COLUMN "type",
ADD COLUMN     "type" "RecipeTypes";
