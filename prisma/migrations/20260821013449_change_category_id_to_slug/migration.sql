/*
  Warnings:

  - You are about to drop the column `categoryId` on the `CategoryKeyword` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Item` table. All the data in the column will be lost.
  - The primary key for the `ItemCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ItemCategory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ItemCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyword,categorySlug]` on the table `CategoryKeyword` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ItemCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categorySlug` to the `CategoryKeyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ItemCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoryKeyword" DROP CONSTRAINT "CategoryKeyword_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- DropIndex
DROP INDEX "CategoryKeyword_categoryId_idx";

-- DropIndex
DROP INDEX "CategoryKeyword_keyword_categoryId_key";

-- DropIndex
DROP INDEX "ItemCategory_name_key";

-- AlterTable
ALTER TABLE "CategoryKeyword" DROP COLUMN "categoryId",
ADD COLUMN     "categorySlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "categoryId",
ADD COLUMN     "categorySlug" TEXT;

-- AlterTable
ALTER TABLE "ItemCategory" DROP CONSTRAINT "ItemCategory_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "slug" TEXT NOT NULL,
ADD CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("slug");

-- CreateIndex
CREATE INDEX "CategoryKeyword_categorySlug_idx" ON "CategoryKeyword"("categorySlug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryKeyword_keyword_categorySlug_key" ON "CategoryKeyword"("keyword", "categorySlug");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_slug_key" ON "ItemCategory"("slug");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "ItemCategory"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryKeyword" ADD CONSTRAINT "CategoryKeyword_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "ItemCategory"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
