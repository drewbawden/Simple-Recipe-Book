-- DropForeignKey
ALTER TABLE "ShoppingListItemSource" DROP CONSTRAINT "ShoppingListItemSource_recipeIngredientId_fkey";

-- AddForeignKey
ALTER TABLE "ShoppingListItemSource" ADD CONSTRAINT "ShoppingListItemSource_recipeIngredientId_fkey" FOREIGN KEY ("recipeIngredientId") REFERENCES "RecipeIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
