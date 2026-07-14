/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Foods` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recipes_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Foods_name_key" ON "Foods"("name");
