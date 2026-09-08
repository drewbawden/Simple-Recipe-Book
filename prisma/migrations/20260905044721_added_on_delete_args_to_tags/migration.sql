-- DropForeignKey
ALTER TABLE "ShoppingListTag" DROP CONSTRAINT "ShoppingListTag_shoppingListId_fkey";

-- AddForeignKey
ALTER TABLE "ShoppingListTag" ADD CONSTRAINT "ShoppingListTag_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
