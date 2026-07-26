import { useState, useEffect } from "react";
import { isValidQuantity } from "@/lib/quantity";
import AutocompleteInput from "@/components/templates/autocomplete";
import Form from "next/form";
import { Trash2 } from "lucide-react";
import { Ingredient, RecipeIngredientInput } from "@/types/recipe";
import { AutocompleteType } from "@/actions/autocomplete";

interface AddIngredientsPopupProps {
  ingredientsList: RecipeIngredientInput[];
  setIngredientsList: React.Dispatch<
    React.SetStateAction<RecipeIngredientInput[]>
  >;
}
export const AddIngredientsPopup = ({
  ingredientsList,
  setIngredientsList,
}: AddIngredientsPopupProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  function addIngredient() {
    if (!name || !quantity) return;

    setIngredientsList((prev) => [
      ...prev,
      {
        name: name.toLowerCase(),
        quantity,
      },
    ]);

    setName("");
    setQuantity("");
  }

  function removeIngredient(index: number) {
    setIngredientsList((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="text-gray-900">
      <Form
        action={addIngredient}
        className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Ingredient
            </label>
            <AutocompleteInput
              modelType="items"
              placeholder="Enter ingredient..."
              value={name}
              onChange={(value) => setName(value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="quantity"
              className="text-sm font-semibold text-gray-700"
            >
              Quantity
            </label>
            <input
              required
              type="text"
              id="quantity"
              value={quantity}
              name="quantity"
              placeholder="e.g. 200g, 2 tbsps"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              onChange={(e) => {
                const value = e.target.value;
                setQuantity(value);
                const parsed = isValidQuantity(value);

                e.target.setCustomValidity(
                  !parsed ? "Please enter a valid quantity." : "",
                );
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-sm text-center block sm:inline-block"
        >
          Add Ingredient
        </button>
      </Form>

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-1">
        Current Ingredients
      </h3>

      {ingredientsList.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">No ingredients</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {ingredientsList.map((ingredient, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 transition group"
            >
              <button
                onClick={() => {
                  removeIngredient(index);
                }}
                className="hover:bg-red-100 active:bg-red-200 rounded-sm bg-gray-100 border-gray-200 border"
              >
                <Trash2 className="h-max w-max px-3 py-1" />
              </button>
              <span className="font-medium text-gray-900">
                {ingredient.name}
              </span>
              <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-md border border-gray-200">
                {ingredient.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
