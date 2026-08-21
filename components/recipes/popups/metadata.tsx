import { NormalUnit } from "@/app/generated/prisma/enums";
import { Ingredient, RecipeInstructionStep } from "@/types/recipe";

interface IngredientPopupProps {
  ingredients: Ingredient[];
}
export const IngredientPopup = ({ ingredients }: IngredientPopupProps) => {
  return (
    <div className="text-gray-900 space-y-2">
      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex justify-between items-center p-3.5 hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-900">
              {ingredient.item.name}
            </span>
            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
              {ingredient.quantity} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

type NotesPopupProps = {
  notes: string;
};
export const NotesPopup = ({ notes }: NotesPopupProps) => {
  return (
    <div className="text-gray-900 space-y-2">
      <p className="p-4 break-all">{notes}</p>
    </div>
  );
};

interface InstructionsPopupProps {
  instructions: RecipeInstructionStep[];
}
export const InstructionPopup = ({ instructions }: InstructionsPopupProps) => {
  const hasCategories = instructions.some((instruction) =>
    instruction.category?.trim(),
  );

  const groupedInstructions = instructions.reduce(
    (groups, instruction) => {
      const key = instruction.category?.trim() || "General";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(instruction);
      return groups;
    },
    {} as Record<string, RecipeInstructionStep[]>,
  );

  return (
    <div className="text-gray-900 space-y-2">
      {hasCategories ? (
        <div className="space-y-6">
          {Object.entries(groupedInstructions).map(([category, steps]) => (
            <div
              key={category}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">{category}</h2>
              </div>
              <ol className="list-decimal list-inside divide-y divide-gray-200">
                {steps.map((instruction) => (
                  <li
                    key={instruction.id}
                    className="px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-900">
                      {instruction.method}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {instructions.map((instruction) => (
            <li
              key={instruction.id}
              className="flex space-x-3.5 items-center p-3.5 hover:bg-gray-50 transition"
            >
              <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
                {instruction.stepNumber}
              </span>
              <span className="font-medium text-gray-900">
                {instruction.method}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
