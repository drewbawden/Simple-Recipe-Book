/*
  Warnings:

  - The `packageUnit` column on the `StoreProduct` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_RecipesToShoppingListItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecipesToShoppingListItem" DROP CONSTRAINT "_RecipesToShoppingListItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipesToShoppingListItem" DROP CONSTRAINT "_RecipesToShoppingListItem_B_fkey";

-- AlterTable
ALTER TABLE "StoreProduct" DROP COLUMN "packageUnit",
ADD COLUMN     "packageUnit" "NormalUnit";

-- DropTable
DROP TABLE "_RecipesToShoppingListItem";
