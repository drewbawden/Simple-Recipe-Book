-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "tagId" INTEGER;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ShoppingListTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
