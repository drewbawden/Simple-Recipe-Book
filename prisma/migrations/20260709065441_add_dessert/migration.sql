/*
  Warnings:

  - You are about to drop the column `defaultUnits` on the `Foods` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "RecipeTypes" ADD VALUE 'DESSERT';

-- AlterTable
ALTER TABLE "Foods" DROP COLUMN "defaultUnits";
