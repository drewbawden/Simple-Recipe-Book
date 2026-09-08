/*
  Warnings:

  - A unique constraint covering the columns `[shoppingListId,itemId]` on the table `ShoppingListItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShoppingListItem_shoppingListId_itemId_key" ON "ShoppingListItem"("shoppingListId", "itemId");
