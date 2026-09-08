/*
  Warnings:

  - You are about to drop the column `itemCategoryId` on the `CategoryKeyword` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyword,categoryId]` on the table `CategoryKeyword` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CategoryKeyword" DROP CONSTRAINT "CategoryKeyword_itemCategoryId_fkey";

-- AlterTable
ALTER TABLE "CategoryKeyword" DROP COLUMN "itemCategoryId",
ADD COLUMN     "categoryId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CategoryKeyword_keyword_categoryId_key" ON "CategoryKeyword"("keyword", "categoryId");

-- AddForeignKey
ALTER TABLE "CategoryKeyword" ADD CONSTRAINT "CategoryKeyword_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
