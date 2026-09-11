import { ImageModal } from "@/components/templates/modal";
import { toPascalCase } from "@/lib/text";
import { Recipe } from "@/types/recipe";
import { InstructionIngredients } from "./instruction-ingredients";
import { getGroupedInstructions, instructionsHasCategories } from "./metadata";
import { ignoredIngredientWords } from "@/lib/ingredients";
import { useState } from "react";
import { MultiplierPicker } from "../ingredient-multiplier";

interface RecipeOverviewProps {
  recipe: Recipe;
}

export const RecipeOverview = ({ recipe }: RecipeOverviewProps) => {
  const [multiplier, setMultiplier] = useState(1);

  const hasIngredientWord = (method: string, word: string) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedWord}\\b`, "i").test(method);
  };
  const hasCategories = instructionsHasCategories({
    instructions: recipe.instructions,
  });
  const groupedInstructions = getGroupedInstructions({
    instructions: recipe.instructions,
  });
  const findIngredientRelations = () => {
    return recipe.instructions.map((instruction) => ({
      stepId: instruction.id,
      matches: recipe.ingredients.filter((ingredient) => {
        const method = instruction.method;
        const ingredientWords = ingredient.item.name
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => !ignoredIngredientWords.has(word));

        return (
          ingredientWords.length > 0 &&
          ingredientWords.every((word) => hasIngredientWord(method, word))
        );
      }),
    }));
  };

  const ingredientRelations = findIngredientRelations();
  const getIngredientMatches = (stepId: number) =>
    ingredientRelations.find((relation) => relation.stepId === stepId)
      ?.matches ?? [];

  return (
    <div className="text-gray-900 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-x-2 gap-y-5">
      <div className="flex flex-col gap-x-2 gap-y-5">
        <h1 className="text-2xl font-bold bg-gray-100 p-2 rounded text-center">
          {recipe.name}
        </h1>

        <div className="flex flex-row bg-gray-100 p-2 justify-between gap-5 items-center rounded">
          <div className="flex-3 flex flex-wrap gap-2 p-2 text-md text-gray-500 rounded">
            {recipe.types.map((type) => {
              return (
                <span
                  key={type}
                  className="bg-white p-1 rounded border border-gray-100 shadow-sm"
                >
                  {toPascalCase(type)}
                </span>
              );
            })}
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 text-sm text-gray-500 bg-white p-2 rounded border border-gray-100 shadow-sm">
            <p>
              {recipe.servingSize
                ? `${recipe.servingSize} serving${recipe.servingSize > 1 && "s"}`
                : "--- servings"}
            </p>
            <p>
              {recipe.totalTimeMins
                ? `${recipe.totalTimeMins} minute${recipe.totalTimeMins > 1 && "s"}`
                : "--- minutes"}
            </p>
          </div>
        </div>

        {recipe.imagePath && (
          <div className="flex flex-row justify-center w-full aspect-video bg-gray-100 rounded overflow-hidden shadow-md border border-gray-400">
            <ImageModal
              src={recipe.imagePath}
              alt={recipe.name}
              width={800}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {recipe.notes && (
          <div className="bg-gray-100 p-2 rounded space-y-2">
            <h2 className="text-2xl font-bold text-center">Notes</h2>
            <p className="bg-white p-2 rounded shadow-sm border border-gray-100">
              {recipe.notes}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-2 gap-y-5">
        {recipe.ingredients.length > 0 && (
          <div className="bg-gray-100 p-2 rounded space-y-2 border border-gray-100">
            <div className="flex items-center justify-center relative">
              <div className="flex flex-row items-center absolute left-0">
                <MultiplierPicker
                  multiplier={multiplier}
                  setMultiplier={setMultiplier}
                />
              </div>
              <h2 className="text-2xl font-bold text-center">Ingredients</h2>
            </div>
            <ul className="divide-y divide-gray-200 overflow-hidden border border-gray-200 rounded shadow-sm bg-white">
              {recipe.ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex justify-between items-center p-2 transition"
                >
                  <span className="font-medium text-gray-900">
                    {toPascalCase(ingredient.item.name)}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded border border-gray-200">
                    {!!ingredient.standardQuantity
                      ? parseFloat(
                          (ingredient.standardQuantity * multiplier).toFixed(4),
                        )
                      : ingredient.quantity}{" "}
                    {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recipe.instructions.length > 0 && (
          <div className="bg-gray-100 p-2 rounded space-y-2 border border-gray-100">
            <h2 className="text-2xl font-bold text-center">Instructions</h2>

            {hasCategories ? (
              <div className="space-y-6">
                {Object.entries(groupedInstructions).map(
                  ([category, steps]) => (
                    <div
                      key={category}
                      className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h2 className="font-bold text-gray-900">{category}</h2>
                      </div>

                      <ol className="divide-y divide-gray-200">
                        {steps.map((instruction, index) => (
                          <li
                            key={instruction.id}
                            className="flex space-x-3.5 items-start p-3.5 transition"
                          >
                            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded border border-gray-200">
                              {index + 1}
                            </span>

                            <div className="space-y-2">
                              <p className="font-medium text-gray-900">
                                {instruction.method}
                              </p>
                              {getIngredientMatches(instruction.id).length >
                                0 && (
                                <InstructionIngredients
                                  ingredients={getIngredientMatches(
                                    instruction.id,
                                  )}
                                />
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <ol className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden bg-white shadow-sm">
                {recipe.instructions.map((instruction) => (
                  <li
                    key={instruction.id}
                    className="flex space-x-3.5 items-start p-3.5 transition"
                  >
                    <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded border border-gray-200">
                      {instruction.stepNumber}
                    </span>

                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {instruction.method}
                      </p>
                      {getIngredientMatches(instruction.id).length > 0 && (
                        <InstructionIngredients
                          ingredients={getIngredientMatches(instruction.id)}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
