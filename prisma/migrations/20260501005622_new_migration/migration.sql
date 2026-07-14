-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "typeId" INTEGER;

-- CreateTable
CREATE TABLE "Types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
