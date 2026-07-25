import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { deleteRecipe, getRecipes } from "@/actions/recipes";
import { ImageModal, Modal } from "@/components/templates/modal";

import { AddToShoppingListPopup } from "@/components/recipes/popups/add-to-list";
import { RecipeInputPopup } from "@/components/recipes/popups/recipe-input";
import { Recipe } from "@/types/recipe";
import {
  NotesPopup,
  IngredientPopup,
} from "@/components/recipes/popups/metadata";

import {
  NotepadText,
  SaladIcon,
  SettingsIcon,
  ShoppingBasketIcon,
} from "lucide-react";
import { refresh } from "next/cache";

export const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [selectedShoppingList, setSelectedShoppingList] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState<string | null>(null);
  const [selectedEdit, setSelectedEdit] = useState(null);

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

  const handleEdit = (recipe: Recipe) => {
    setSelectedEdit(recipe);
  };

  const handleDelete = async (recipeId: number) => {
    await deleteRecipe(recipeId);
    refreshRecipes();
  };

  if (loading) {
    return <p>Loading Recipes...</p>;
  }

  return (
    <div>
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-bold">Recipes</h1>
      </div>
      <div className="flex flex-row justify-between m-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded "
          type="button"
          onClick={() => setIsAddRecipeOpen(true)}
        >
          Add Recipe
        </button>
        <Link
          href="/list"
          className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded "
        >
          Shopping List
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex flex-row text-gray-900 p-4 border rounded-lg shadow-sm bg-white space-x-4"
          >
            {recipe.imagePath ? (
              <div className="w-1/3 relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
                <ImageModal
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
            <div className="w-full space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                {recipe.url ? (
                  <Link
                    href={recipe.url}
                    className="text- line-clamp-3 underline font-bold"
                    title={recipe.name}
                  >
                    {recipe.name}
                  </Link>
                ) : (
                  <p className="text- line-clamp-3" title={recipe.name}>
                    {recipe.name}
                  </p>
                )}
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
              <hr />
              <div className="flex flex-row justify-between items-center">
                <div className="relative">
                  <button
                    className="bg-gray-400 text-white text-sm font-bold p-1 rounded active:bg-gray-500"
                    onClick={() =>
                      setIsContextOpen(
                        isContextOpen === recipe.id ? null : recipe.id,
                      )
                    }
                  >
                    <SettingsIcon />
                  </button>
                  {isContextOpen === recipe.id && (
                    <div className="absolute top-6 left-0 mt-2 w-40 rounded-md border bg-white shadow-lg">
                      <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 active:bg-gray-200"
                        onClick={() => {
                          handleEdit(recipe);
                        }}
                      >
                        Edit
                      </button>
                      <hr />
                      <button
                        className="text-red-600 block w-full px-4 py-2 text-left hover:bg-red-100 active:bg-red-200"
                        onClick={() => {
                          handleDelete(recipe.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {recipe.ingredients.length > 0 ? (
                  <button
                    onClick={() => setSelectedIngredients(recipe)}
                    className="text-blue-500 underline font-bold"
                  >
                    <SaladIcon />
                  </button>
                ) : (
                  <div className="p-1 relative inline-block">
                    <SaladIcon />
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <line
                        x1="4"
                        y1="20"
                        x2="20"
                        y2="4"
                        stroke="red"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {recipe.notes ? (
                  <button
                    onClick={() => setSelectedNotes(recipe)}
                    className="text-blue-500 underline font-bold truncate max-w-32"
                  >
                    <NotepadText />
                  </button>
                ) : (
                  <div className="p-1 relative inline-block">
                    <NotepadText />
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <line
                        x1="4"
                        y1="20"
                        x2="20"
                        y2="4"
                        stroke="red"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
                <button
                  title="Add to shopping list"
                  className="bg-blue-500 text-white text-base font-bold py-2 px-2 rounded"
                  onClick={() => setSelectedShoppingList(recipe)}
                  type="button"
                >
                  <ShoppingBasketIcon />
                </button>
              </div>{" "}
            </div>
          </div>
        ))}
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
        <RecipeInputPopup
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
      <Modal isOpen={selectedEdit} onClose={() => setSelectedEdit(null)}>
        {selectedEdit && (
          <RecipeInputPopup
            closePopup={() => setSelectedEdit(null)}
            refreshRecipes={refreshRecipes}
            initialData={selectedEdit}
          />
        )}
      </Modal>
    </div>
  );
};
