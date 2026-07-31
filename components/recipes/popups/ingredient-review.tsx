import { ParsedExternalIngredient } from "@/types/recipe";

interface IngredientsReviewPopupProps {
  parsedIngredients: ParsedExternalIngredient[];
  setParsedIngredients: React.Dispatch<
    React.SetStateAction<ParsedExternalIngredient[]>
  >;
  onCancel: () => void;
  onConfirm: () => void;
}

export const IngredientsReviewPopup = ({
  parsedIngredients,
  setParsedIngredients,
  onCancel,
  onConfirm,
}: IngredientsReviewPopupProps) => {
  return (
    <div className="space-y-4 text-gray-900 flex flex-col w-full">
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Confirm external ingredients
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Review the ingredients parsed from the external source and confirm
        </p>
      </div>
      <div className="flex flex-col sm:max-h-[70vh] max-h-[50vh] w-full">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {parsedIngredients.map((ingredient, index) => (
            <div
              key={`${ingredient.raw}-${index}`}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Ingredient name
                  </label>
                  <input
                    value={ingredient.name}
                    onChange={(e) => {
                      const next = [...parsedIngredients];
                      next[index] = {
                        ...next[index],
                        name: e.target.value,
                      };
                      setParsedIngredients(next);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Quantity
                  </label>
                  <input
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const next = [...parsedIngredients];
                      next[index] = {
                        ...next[index],
                        quantity: e.target.value,
                      };
                      setParsedIngredients(next);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600">
                <div className="font-semibold text-gray-700">Raw text</div>
                <div>{ingredient.raw}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 bg-white pt-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-500"
          >
            Confirm ingredients
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
