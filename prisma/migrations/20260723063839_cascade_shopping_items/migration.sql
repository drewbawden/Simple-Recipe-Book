-- DropForeignKey
ALTER TABLE "ShoppingListItemSource" DROP CONSTRAINT "ShoppingListItemSource_shoppingListItemId_fkey";

-- AddForeignKey
ALTER TABLE "ShoppingListItemSource" ADD CONSTRAINT "ShoppingListItemSource_shoppingListItemId_fkey" FOREIGN KEY ("shoppingListItemId") REFERENCES "ShoppingListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
