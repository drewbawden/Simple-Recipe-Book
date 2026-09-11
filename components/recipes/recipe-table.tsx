import { useState, useEffect } from "react";
import Link from "next/link";

import { deleteRecipe, getRecipes } from "@/actions/recipes";
import { Modal } from "@/components/templates/modal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/templates/context-menu";

import { AddToShoppingListPopup } from "@/components/recipes/popups/add-to-list";
import { RecipeInputPopup } from "@/components/recipes/popups/recipe-input";
import { filterArguments, Recipe } from "@/types/recipe";
import {
  NotesPopup,
  IngredientPopup,
  InstructionPopup,
} from "@/components/recipes/popups/metadata";
import { MainFilterBar } from "@/components/recipes/filter-bar";

import {
  InfoIcon,
  NotepadTextIcon,
  SaladIcon,
  SettingsIcon,
  ShoppingBasketIcon,
} from "lucide-react";
import { useModalQuery } from "@/hooks/useModalQuery";
import { RecipeOverview } from "./popups/overview";
import Image from "next/image";

export const RecipeTable = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { modal, openModal, closeModal, getModalParam } = useModalQuery();

  const selectedRecipeId = Number(getModalParam("recipeId"));
  const selectedRecipe = recipes.find(
    (recipe) => recipe.id === selectedRecipeId,
  );
  const isAddRecipeOpen = modal === "addRecipe";
  const selectedIngredients = modal === "ingredients" ? selectedRecipe : null;
  const selectedNotes = modal === "notes" ? selectedRecipe : null;
  const selectedShoppingList =
    modal === "addToShoppingList" ? selectedRecipe : null;
  const selectedEdit = modal === "editRecipe" ? selectedRecipe : null;
  const recipeOverview = modal === "recipeOverview" ? selectedRecipe : null;
  const selectedInstructions = modal === "instructions" ? selectedRecipe : null;

  const normaliseRecipes = (recipesData: any[]): Recipe[] =>
    recipesData.map((recipe) => ({
      ...recipe,
      ingredients: (recipe.ingredients ?? []).map((ingredient: any) => ({
        ...ingredient,
        item: {
          ...ingredient.item,
          type: ingredient.item?.type ?? "ingredient",
        },
      })),
    })) as Recipe[];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipes = await getRecipes();
        setRecipes(normaliseRecipes(recipes));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const refreshRecipes = async (filters?: filterArguments) => {
    const data = await getRecipes(filters);
    setRecipes(normaliseRecipes(data));
  };

  const handleEdit = (recipe: Recipe) => {
    openModal("editRecipe", { recipeId: recipe.id });
  };

  const handleDelete = async (recipeId: number) => {
    await deleteRecipe(recipeId);
    refreshRecipes();
  };

  const handleAddRecipeCancel = () => {
    const confirmation = confirm("Are you sure you want to close?");
    if (confirmation) {
      closeModal();
    }
  };
  const handleEditRecipeCancel = () => {
    const confirmation = confirm("Are you sure you want to close?");
    if (confirmation) {
      closeModal();
    }
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
          onClick={() => openModal("addRecipe")}
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

      <MainFilterBar refreshTable={refreshRecipes} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {recipes.map((recipe) => (
          <div
            role="button"
            key={recipe.id}
            className="overflow-visible flex flex-row text-gray-900 p-4 border rounded-lg shadow-sm bg-white space-x-4"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) {
                return;
              }

              openModal("recipeOverview", { recipeId: recipe.id });
            }}
          >
            {recipe.imagePath ? (
              <div className="w-1/3 relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
                <Image
                  src={recipe.imagePath}
                  alt={recipe.name}
                  fill
                  className="z-5 object-cover"
                  sizes="(max-width: 768px) 100vw,
                         (max-width: 1200px) 50vw,
                         33vw"
                />
              </div>
            ) : null}
            <div className="relative w-full space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <ContextMenu>
                  <ContextMenuTrigger className="text-left bg-gray-100 rounded px-2 py-1 block overflow-hidden">
                    <span
                      className="line-clamp-3 font-bold"
                      title={recipe.name}
                    >
                      {recipe.name}
                    </span>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="z-50 w-72">
                    <div className="p-3">
                      <p className="font-bold mb-2 text-gray-900">
                        {recipe.name}
                      </p>

                      {recipe.url ? (
                        <Link
                          href={recipe.url}
                          target="_blank"
                          className="text-sm text-blue-600 underline break-all"
                        >
                          {recipe.url}
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-500">No URL</p>
                      )}
                    </div>
                  </ContextMenuContent>
                </ContextMenu>
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
                <ContextMenu>
                  <ContextMenuTrigger>
                    <SettingsIcon />
                  </ContextMenuTrigger>
                  <ContextMenuContent align="right" className="text-gray-900">
                    <ContextMenuItem onSelect={() => handleEdit(recipe)}>
                      Edit
                    </ContextMenuItem>
                    <hr />
                    <ContextMenuItem
                      onSelect={() => handleDelete(recipe.id)}
                      className="text-red-600"
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                {recipe.ingredients.length > 0 ? (
                  <button
                    onClick={() =>
                      openModal("ingredients", { recipeId: recipe.id })
                    }
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

                {recipe.instructions.length > 0 ? (
                  <button
                    onClick={() =>
                      openModal("instructions", { recipeId: recipe.id })
                    }
                    className="text-blue-500 underline font-bold truncate max-w-32"
                  >
                    <NotepadTextIcon />
                  </button>
                ) : (
                  <div className="p-1 relative inline-block">
                    <NotepadTextIcon />
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
                    onClick={() => openModal("notes", { recipeId: recipe.id })}
                    className="text-blue-500 underline font-bold truncate max-w-32"
                  >
                    <InfoIcon />
                  </button>
                ) : (
                  <div className="p-1 relative inline-block">
                    <InfoIcon />
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
                  onClick={() =>
                    openModal("addToShoppingList", { recipeId: recipe.id })
                  }
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
        onClose={closeModal}
        modalTitle="Ingredients"
      >
        {selectedIngredients && (
          <IngredientPopup ingredients={selectedIngredients.ingredients} />
        )}
      </Modal>
      <Modal
        isOpen={selectedInstructions !== null}
        onClose={closeModal}
        modalTitle="Instructions"
      >
        {selectedInstructions && (
          <InstructionPopup instructions={selectedInstructions.instructions} />
        )}
      </Modal>
      <Modal
        isOpen={selectedNotes !== null}
        onClose={closeModal}
        modalTitle="Notes"
      >
        {selectedNotes && (
          <NotesPopup notes={selectedNotes.notes ?? "No notes"} />
        )}
      </Modal>
      <Modal
        isOpen={isAddRecipeOpen}
        onClose={() => handleAddRecipeCancel()}
        hideCross
        modalTitle="Add Recipe"
      >
        <RecipeInputPopup
          handleClose={() => handleAddRecipeCancel()}
          closePopup={closeModal}
          refreshRecipes={refreshRecipes}
        />
      </Modal>
      <Modal
        isOpen={selectedShoppingList !== null}
        onClose={closeModal}
        hideCross
        modalTitle="Add to Shopping List"
        confirmClose
      >
        {selectedShoppingList && (
          <AddToShoppingListPopup
            closePopup={closeModal}
            recipe={selectedShoppingList}
          />
        )}
      </Modal>
      <Modal
        isOpen={selectedEdit !== null}
        onClose={() => handleEditRecipeCancel()}
        modalTitle="Edit Recipe"
        hideCross
      >
        {selectedEdit && (
          <RecipeInputPopup
            handleClose={() => handleEditRecipeCancel()}
            closePopup={closeModal}
            refreshRecipes={refreshRecipes}
            initialData={selectedEdit}
          />
        )}
      </Modal>
      <Modal
        isOpen={recipeOverview !== null}
        onClose={closeModal}
        modalTitle="Recipe Overview"
        size="pfull"
      >
        {recipeOverview && <RecipeOverview recipe={recipeOverview} />}
      </Modal>
    </div>
  );
};
