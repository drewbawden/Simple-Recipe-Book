ALTER TABLE "ItemCategory"
ALTER COLUMN "name" TYPE TEXT
USING "name"::TEXT;

DROP TYPE "Category";
