/*
  Warnings:

  - You are about to drop the `ItemUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemUsage" DROP CONSTRAINT "ItemUsage_itemId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ItemUsage";

-- DropEnum
DROP TYPE "ItemUsageType";
