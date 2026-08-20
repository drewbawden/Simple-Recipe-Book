-- AlterTable
ALTER TABLE "ItemCategory" ADD COLUMN     "userCreated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CategoryKeyword" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "itemCategoryId" INTEGER,

    CONSTRAINT "CategoryKeyword_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoryKeyword" ADD CONSTRAINT "CategoryKeyword_itemCategoryId_fkey" FOREIGN KEY ("itemCategoryId") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
