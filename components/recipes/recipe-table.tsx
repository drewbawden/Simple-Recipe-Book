import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { getRecipes } from "@/actions/recipes";
import { Modal } from "@/components/templates/modal";

import { AddToShoppingListPopup } from "@/components/recipes/popups/add-to-list";
import { AddRecipePopup } from "@/components/recipes/popups/add-recipe";
import {
  NotesPopup,
  IngredientPopup,
} from "@/components/recipes/popups/metadata";

export const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [selectedShoppingList, setSelectedShoppingList] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const refreshRecipes = async () => {
    const data = await getRecipes();
    setRecipes(data);
  };

  if (loading) {
    return <p>Loading Recipes...</p>;
  }

  return (
    <div>
      <div className="flex flex-row justify-between m-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded "
          type="button"
          onClick={() => setIsAddRecipeOpen(true)}
        >
          Add Recipe
        </button>
        <h1 className="text-4xl font-bold">Recipes</h1>
        <Link
          href="/list"
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded "
        >
          Shopping List
        </Link>
      </div>

      {/* mobile layout */}
      <div className="block md:hidden space-y-4 px-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="text-gray-900 p-4 border rounded-lg shadow-sm bg-white space-y-2"
          >
            {recipe.imagePath ? (
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
                <Image
                  src={recipe.imagePath}
                  alt={recipe.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
                />
              </div>
            ) : null}
            <div className="flex justify-between items-start">
              <Link
                href={recipe.url || "#"}
                className={`text-lg ${recipe.url ? "underline font-bold" : ""}`}
              >
                {recipe.name}
              </Link>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">
                {recipe.types.join(", ") || "---"}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              {recipe.servingSize ? (
                <span>{recipe.servingSize} servings</span>
              ) : null}
              {recipe.totalTimeMins ? (
                <span>{recipe.totalTimeMins} mins</span>
              ) : null}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Ingredients</p>
                {recipe.ingredients.length > 0 ? (
                  <button
                    onClick={() => setSelectedIngredients(recipe)}
                    className="text-blue-500 underline font-bold"
                  >
                    {recipe.ingredients.length} Items
                  </button>
                ) : (
                  "0"
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">Notes</p>
                {recipe.notes ? (
                  <button
                    onClick={() => setSelectedNotes(recipe)}
                    className="text-blue-500 underline font-bold truncate max-w-32"
                  >
                    View Notes
                  </button>
                ) : (
                  "---"
                )}
              </div>
              <button
                title="Add to shopping list"
                className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded"
                onClick={() => setSelectedShoppingList(recipe)}
                type="button"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* desktop layout */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-center table-fixed">
          <thead>
            <tr>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Name
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Type
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Serving Size
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Time to make (mins)
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Ingredients
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Notes
              </th>
              <th className="text-center align-middle p-4 border-b border-blue-gray-100 bg-blue-gray-50">
                Add to shopping list
              </th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id} value={recipe.id}>
                <td
                  className={`text-center align-middle p-4 border-b border-blue-gray-50 ${
                    recipe.url ? "underline font-bold" : ""
                  }`}
                >
                  {recipe.imagePath ? (
                    <div className="relative w-48 h-32 mx-auto">
                      <Image
                        src={recipe.imagePath}
                        alt="Recipe Image"
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 100vw,
                               (max-width: 1200px) 50vw,
                               33vw"
                      />
                      <p className="absolute inset-0 flex items-center justify-center z-10 text-white font-bold text-lg bg-black/30">
                        <Link href={recipe.url || "#"}>{recipe.name}</Link>
                      </p>
                    </div>
                  ) : (
                    <p title="Recipe name">
                      <Link href={recipe.url || "#"}>{recipe.name}</Link>
                    </p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <p title="Recipe Type(s)">
                    {recipe.types.join(", ") || "---"}
                  </p>
                </td>
                <td className="text-centerName align-middle p-4 border-b border-blue-gray-50">
                  <p title="Serving Size">
                    {recipe.servingSize
                      ? recipe.servingSize + " serves"
                      : "---"}
                  </p>
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <p title="Time to make (mins)">
                    {recipe.totalTimeMins
                      ? recipe.totalTimeMins + " mins"
                      : "---"}
                  </p>
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  {recipe.ingredients.length > 0 ? (
                    <button
                      onClick={() => setSelectedIngredients(recipe)}
                      className="border-1 hover:bg-gray-900 active:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                      title="View ingredients"
                    >
                      {recipe.ingredients.length} Items
                    </button>
                  ) : (
                    <p title="Ingredients">0</p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50 max-w-40 max-h-8">
                  {recipe.notes ? (
                    <button
                      onClick={() => setSelectedNotes(recipe)}
                      className="max-w-80 border-1 hover:bg-gray-900 active:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                      title="View notes"
                    >
                      View Notes
                    </button>
                  ) : (
                    <p title="Notes">---</p>
                  )}
                </td>
                <td className="text-center align-middle p-4 border-b border-blue-gray-50">
                  <button
                    title="Add to shopping list"
                    className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setSelectedShoppingList(recipe)}
                    type="button"
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={selectedIngredients !== null}
        onClose={() => setSelectedIngredients(null)}
        size="lg"
      >
        {selectedIngredients && (
          <IngredientPopup ingredients={selectedIngredients.ingredients} />
        )}
      </Modal>
      <Modal
        isOpen={selectedNotes !== null}
        onClose={() => setSelectedNotes(null)}
      >
        {selectedNotes && <NotesPopup notes={selectedNotes.notes} />}
      </Modal>
      <Modal isOpen={isAddRecipeOpen} onClose={() => setIsAddRecipeOpen(false)}>
        <AddRecipePopup
          closePopup={() => setIsAddRecipeOpen(false)}
          refreshRecipes={refreshRecipes}
        />
      </Modal>
      <Modal
        isOpen={selectedShoppingList}
        onClose={() => setSelectedShoppingList(null)}
      >
        {selectedShoppingList && (
          <AddToShoppingListPopup
            closePopup={() => setSelectedShoppingList(null)}
            recipe={selectedShoppingList}
          />
        )}
      </Modal>
    </div>
  );
};
