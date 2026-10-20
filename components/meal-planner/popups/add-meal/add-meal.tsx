import { RefObject, useEffect, useRef, useState } from "react";
import { addMeal, updateMeal } from "@/actions/meal-planner";
import { Recipe } from "@/types/recipe";
import { getRecipes } from "@/actions/recipes";
import { normaliseRecipes } from "@/lib/recipes";
import { MealRecipeTile } from "./recipe-tiles";
import { RecipeOverview } from "@/components/recipes/popups/overview";
import { Modal } from "@/components/templates/modal";
import { AddToShoppingListPopup } from "@/components/recipes/popups/add-to-list";

interface AddMealPopupProps {
  formRef: RefObject<HTMLFormElement | null>;
  onMealAdded: () => Promise<void>;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  updateHighlights: (startDate: Date, endDate: Date) => void;
  initialMeal?: {
    id: number;
    customText: string | null;
    recipeId: number | null;
  } | null;
}

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const AddMealPopup = ({
  formRef,
  onMealAdded,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  updateHighlights,
  initialMeal = null,
}: AddMealPopupProps) => {
  const [customName, setCustomName] = useState(initialMeal?.customText ?? "");
  const [inputType, setInputType] = useState<"customText" | "recipe">(
    initialMeal?.customText ? "customText" : "recipe",
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeOverview, setRecipeOverview] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(
    initialMeal?.recipeId ?? null,
  );
  const [addToShoppingList, setAddToShoppingList] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [pendingMealData, setPendingMealData] = useState<{
    startDate: string;
    endDate: string;
    customText?: string;
    recipeId?: number;
  } | null>(null);
  const recipeSearchRef = useRef<HTMLInputElement>(null);
  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null;

  useEffect(() => {
    if (inputType !== "recipe") return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const data = await getRecipes({
          name: recipeSearch.trim() || null,
          types: null,
          ingredients: null,
        });
        if (!cancelled) setRecipes(normaliseRecipes(data));
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [inputType, recipeSearch]);

  useEffect(() => {
    recipeSearchRef.current?.setCustomValidity(
      selectedRecipeId === null ? "Select a recipe before continuing" : "",
    );
  }, [selectedRecipeId]);

  if (!startDate || !endDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedEndDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );
  const endDateIsAfterToday = selectedEndDate > today;

  const isDateValid = (date: Date, dateType: "start" | "end") => {
    if (dateType === "start" && date <= endDate) return true;
    if (dateType === "end" && date >= startDate) return true;

    alert("Invalid date!");
    return false;
  };

  const saveMeal = async (mealData: {
    startDate: string;
    endDate: string;
    customText?: string;
    recipeId?: number;
  }) => {
    if (initialMeal) {
      await updateMeal({ ...mealData, mealId: initialMeal.id });
    } else {
      await addMeal(mealData);
    }
    await onMealAdded();
  };

  const handleSubmit = async (formData: FormData) => {
    const mealData = {
      startDate: formatDateInput(startDate),
      endDate: formatDateInput(endDate),
      customText:
        inputType === "customText"
          ? String(formData.get("customText") ?? "")
          : undefined,
      recipeId:
        inputType === "recipe" ? (selectedRecipeId ?? undefined) : undefined,
    };

    if (
      inputType === "recipe" &&
      endDateIsAfterToday &&
      addToShoppingList &&
      selectedRecipe
    ) {
      setPendingMealData(mealData);
      setIsShoppingListOpen(true);
      return;
    }

    await saveMeal(mealData);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="startDate"
        className="flex flex-row justify-between rounded bg-gray-100 p-1"
      >
        <span>Start date</span>
        <input
          type="date"
          id="startDate"
          name="startDate"
          max={formatDateInput(endDate)}
          value={formatDateInput(startDate)}
          onChange={(e) => {
            const date = parseDateInput(e.target.value);
            if (isDateValid(date, "start")) {
              setStartDate(date);
              updateHighlights(date, endDate);
            }
          }}
        />
      </label>

      <label
        htmlFor="endDate"
        className="flex flex-row justify-between rounded bg-gray-100 p-1"
      >
        <span>End date</span>
        <input
          type="date"
          id="endDate"
          name="endDate"
          min={formatDateInput(startDate)}
          value={formatDateInput(endDate)}
          onChange={(e) => {
            const date = parseDateInput(e.target.value);
            if (isDateValid(date, "end")) {
              setEndDate(date);
              updateHighlights(startDate, date);
            }
          }}
        />
      </label>
      <hr />
      <div className="relative flex rounded bg-gray-100 p-1">
        <div
          className={`absolute top-1 bottom-1 w-1/2 rounded bg-white shadow transition-transform duration-200 ${
            inputType === "customText" ? "translate-x-full" : "translate-x-0"
          }`}
        />

        <button
          type="button"
          onClick={() => {
            setInputType("recipe");
            setSelectedRecipeId(null);
          }}
          className="relative z-10 flex-1 px-3 py-1"
        >
          Recipe
        </button>

        <button
          type="button"
          onClick={() => {
            setInputType("customText");
            setCustomName("");
            setAddToShoppingList(false);
          }}
          className="relative z-10 flex-1 px-3 py-1"
        >
          Custom Text
        </button>
      </div>
      <form ref={formRef} id="add-meal-form" action={handleSubmit}>
        {inputType === "customText" ? (
          <textarea
            name="customText"
            placeholder="Meal label..."
            className="border border-gray-200 p-1 shadow-sm w-full rounded"
            rows={2}
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
            }}
            required
          />
        ) : (
          <div className="flex flex-col gap-4">
            {selectedRecipeId === null && (
              <input
                ref={recipeSearchRef}
                type="search"
                placeholder="Search recipes..."
                value={recipeSearch}
                onChange={(event) => setRecipeSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            )}
            {recipes.map((recipe) => (
              <MealRecipeTile
                recipe={recipe}
                key={recipe.id}
                openOverview={setRecipeOverview}
                selectedRecipe={selectedRecipeId}
                onSelect={(recipeId) => {
                  setSelectedRecipeId(recipeId);
                  if (recipeId === null) setAddToShoppingList(false);
                }}
              />
            ))}
            <input
              type="hidden"
              name="recipeId"
              value={selectedRecipeId ?? ""}
            />
            {selectedRecipeId !== null &&
              selectedRecipe &&
              endDateIsAfterToday && (
                <label className="flex items-center gap-2 rounded bg-gray-100 p-2">
                  <input
                    type="checkbox"
                    name="addToShoppingList"
                    checked={addToShoppingList}
                    onChange={(event) =>
                      setAddToShoppingList(event.target.checked)
                    }
                  />
                  <span>Add to shopping list?</span>
                </label>
              )}
          </div>
        )}
      </form>
      <Modal
        isOpen={isShoppingListOpen && selectedRecipe !== null}
        onClose={() => setIsShoppingListOpen(false)}
        modalTitle="Add to shopping list"
        size="xxl"
        isChild
      >
        {selectedRecipe && (
          <AddToShoppingListPopup
            recipe={selectedRecipe}
            closePopup={() => setIsShoppingListOpen(false)}
            onAdded={async () => {
              if (pendingMealData) {
                await saveMeal(pendingMealData);
                setPendingMealData(null);
              }
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={recipeOverview !== null}
        onClose={() => setRecipeOverview(null)}
        modalTitle="Recipe Overview"
        size="pfull"
        isChild
      >
        {recipeOverview && <RecipeOverview recipe={recipeOverview} />}
      </Modal>
    </div>
  );
};
