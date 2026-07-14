/*
  Warnings:

  - The values [KILOGRAM,LITRE,TEASPOON,TABLESPOON,CUP,DECILITRE,CENTILITRE,FLUID_OUNCE,PINT,QUART,GALLON,OUNCE,POUND] on the enum `NormalisedUnit` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `normalisedQuantity` on the `RecipeIngredient` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `normalisedQuantity` on the `ShoppingListItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- CreateEnum
CREATE TYPE "StandardUnit" AS ENUM ('DECILITRE', 'MILLILITRE', 'CENTILITRE', 'LITRE', 'TEASPOON', 'TABLESPOON', 'CUP', 'FLUID_OUNCE', 'PINT', 'QUART', 'GALLON', 'GRAM', 'KILOGRAM', 'OUNCE', 'POUND', 'INDIVIDUAL');

-- AlterEnum
BEGIN;
CREATE TYPE "NormalisedUnit_new" AS ENUM ('MILLILITRE', 'GRAM', 'INDIVIDUAL');
ALTER TABLE "public"."Inventory" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "Inventory" ALTER COLUMN "unit" TYPE "NormalisedUnit_new" USING ("unit"::text::"NormalisedUnit_new");
ALTER TABLE "RecipeIngredient" ALTER COLUMN "normalisedUnit" TYPE "NormalisedUnit_new" USING ("normalisedUnit"::text::"NormalisedUnit_new");
ALTER TABLE "ShoppingListItem" ALTER COLUMN "normalisedUnit" TYPE "NormalisedUnit_new" USING ("normalisedUnit"::text::"NormalisedUnit_new");
ALTER TYPE "NormalisedUnit" RENAME TO "NormalisedUnit_old";
ALTER TYPE "NormalisedUnit_new" RENAME TO "NormalisedUnit";
DROP TYPE "public"."NormalisedUnit_old";
ALTER TABLE "Inventory" ALTER COLUMN "unit" SET DEFAULT 'INDIVIDUAL';
COMMIT;

-- AlterTable
ALTER TABLE "RecipeIngredient" ALTER COLUMN "normalisedQuantity" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ShoppingListItem" ALTER COLUMN "normalisedQuantity" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "StoreProduct" ADD COLUMN     "packageSize" DECIMAL(65,30),
ADD COLUMN     "packageUnit" "StandardUnit";
