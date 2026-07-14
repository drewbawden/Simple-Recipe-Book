-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NormalisedUnit" ADD VALUE 'DECILITRE';
ALTER TYPE "NormalisedUnit" ADD VALUE 'CENTILITRE';
ALTER TYPE "NormalisedUnit" ADD VALUE 'FLUID_OUNCE';
ALTER TYPE "NormalisedUnit" ADD VALUE 'PINT';
ALTER TYPE "NormalisedUnit" ADD VALUE 'QUART';
ALTER TYPE "NormalisedUnit" ADD VALUE 'GALLON';
ALTER TYPE "NormalisedUnit" ADD VALUE 'OUNCE';
ALTER TYPE "NormalisedUnit" ADD VALUE 'POUND';
