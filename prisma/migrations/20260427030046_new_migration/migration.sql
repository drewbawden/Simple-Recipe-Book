/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Locations" AS ENUM ('FRIDGE', 'FREEZER', 'PANTRY');

-- CreateEnum
CREATE TYPE "Units" AS ENUM ('GRAM', 'KILOGRAM', 'MILLILITRE', 'LITRE', 'INDIVIDUAL', 'PACK');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "imageUrl" TEXT,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" "Units" NOT NULL DEFAULT 'INDIVIDUAL',
    "location" "Locations",
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutrition" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "servingSize" TEXT,
    "energy" INTEGER,
    "calories" INTEGER,
    "totalFat" DOUBLE PRECISION,
    "saturatedFat" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "totalCarbohydrates" DOUBLE PRECISION,
    "dietaryFiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "vitaminA" INTEGER,
    "vitaminC" INTEGER,
    "calcium" INTEGER,
    "iron" INTEGER,

    CONSTRAINT "Nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_productId_key" ON "Nutrition"("productId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
