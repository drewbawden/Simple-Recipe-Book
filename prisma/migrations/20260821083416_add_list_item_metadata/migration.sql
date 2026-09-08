-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "url" TEXT;
