-- CreateEnum
CREATE TYPE "ListItemSortOption" AS ENUM (
  'ALPHABETICAL',
  'REVERSE_ALPHABETICAL',
  'CREATION_DATE',
  'REVERSE_CREATION_DATE',
  'PRIORITY'
);

-- Create the new ShoppingListSortOption enum
CREATE TYPE "ShoppingListSortOption_new" AS ENUM (
  'ALPHABETICAL',
  'REVERSE_ALPHABETICAL',
  'MANUAL',
  'AUTOMATIC'
);

-- Add the new columns
ALTER TABLE "ShoppingList"
ADD COLUMN "categorySortOrder" "ShoppingListSortOption_new" NOT NULL DEFAULT 'ALPHABETICAL',
ADD COLUMN "itemSortOrder" "ListItemSortOption" NOT NULL DEFAULT 'CREATION_DATE';

-- Remove the old column
ALTER TABLE "ShoppingList"
DROP COLUMN "sortOrder";

-- Replace the old enum
ALTER TYPE "ShoppingListSortOption" RENAME TO "ShoppingListSortOption_old";

ALTER TYPE "ShoppingListSortOption_new" RENAME TO "ShoppingListSortOption";

DROP TYPE "ShoppingListSortOption_old";
