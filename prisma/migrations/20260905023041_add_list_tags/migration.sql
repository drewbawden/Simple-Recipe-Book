-- CreateTable
CREATE TABLE "ShoppingListTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "shoppingListId" INTEGER,

    CONSTRAINT "ShoppingListTag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShoppingListTag" ADD CONSTRAINT "ShoppingListTag_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
