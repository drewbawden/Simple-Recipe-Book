/*
  Warnings:

  - You are about to alter the column `quantity` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,4)`.
  - You are about to alter the column `normalQuantity` on the `RecipeIngredient` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,4)`.
  - You are about to alter the column `normalQuantity` on the `ShoppingListItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,4)`.
  - You are about to alter the column `packageSize` on the `StoreProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,4)`.

*/
-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "RecipeIngredient" ALTER COLUMN "normalQuantity" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "ShoppingListItem" ALTER COLUMN "normalQuantity" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "StoreProduct" ALTER COLUMN "packageSize" SET DATA TYPE DECIMAL(12,4);
