/*
  Warnings:

  - Changed the type of `name` on the `ItemCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FROZEN_FOODS', 'DAIRY_EGGS_CHEESE', 'FRUIT_VEG', 'HOUSEHOLD_ITEMS', 'MEAT', 'COFFEE_TEA', 'BEVERAGES', 'BREADS_CEREALS', 'PASTA_RICE_BEANS', 'CANNED_FOODS_SOUPS', 'PERSONAL_CARE_HEALTH', 'PET_CARE', 'BAKING_ITEMS', 'SPICES_SEASONINGS', 'OILS_DRESSINGS', 'WINE_BEER_SPIRITS', 'SAUCES_CONDIMENTS', 'SNACKS_SWEETS', 'DELI', 'SEAFOOD', 'STATIONERY');

-- AlterTable
ALTER TABLE "ItemCategory" DROP COLUMN "name",
ADD COLUMN     "name" "Category" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");
