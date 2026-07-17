/*
  Warnings:

  - You are about to drop the column `type` on the `Recipes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RecipeType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT');

-- AlterTable
ALTER TABLE "Recipes" DROP COLUMN "type",
ADD COLUMN     "types" "RecipeType"[];

-- DropEnum
DROP TYPE "RecipeTypes";
