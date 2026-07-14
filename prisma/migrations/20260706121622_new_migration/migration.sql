/*
  Warnings:

  - You are about to drop the `Types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_typeId_fkey";

-- DropTable
DROP TABLE "Types";

-- CreateTable
CREATE TABLE "Ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "recipesId" INTEGER,

    CONSTRAINT "Ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "Recipes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredients" ADD CONSTRAINT "Ingredients_recipesId_fkey" FOREIGN KEY ("recipesId") REFERENCES "Recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
