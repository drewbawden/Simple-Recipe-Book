/*
  Warnings:

  - The `unit` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `normalisedQuantity` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `normalisedUnit` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `normalisedQuantity` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `normalisedUnit` on the `ShoppingListItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NormalUnit" AS ENUM ('MILLILITRE', 'GRAM', 'INDIVIDUAL');

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "unit",
ADD COLUMN     "unit" "NormalUnit" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "normalisedQuantity",
DROP COLUMN "normalisedUnit",
ADD COLUMN     "normalQuantity" DECIMAL(65,30),
ADD COLUMN     "normalUnit" "NormalUnit";

-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "normalisedQuantity",
DROP COLUMN "normalisedUnit",
ADD COLUMN     "normalQuantity" DECIMAL(65,30),
ADD COLUMN     "normalUnit" "NormalUnit";

-- DropEnum
DROP TYPE "NormalisedUnit";
