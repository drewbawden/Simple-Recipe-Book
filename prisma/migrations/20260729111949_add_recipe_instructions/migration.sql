-- CreateTable
CREATE TABLE "RecipeInstructionStep" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "method" TEXT NOT NULL,

    CONSTRAINT "RecipeInstructionStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecipeInstructionStep" ADD CONSTRAINT "RecipeInstructionStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
