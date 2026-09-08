/*
  Warnings:

  - You are about to drop the column `targetId` on the `ItemUsage` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ItemUsage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ItemUsage_itemId_type_createdAt_idx";

-- AlterTable
ALTER TABLE "ItemUsage" DROP COLUMN "targetId",
DROP COLUMN "type";
