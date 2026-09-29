import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { addMeal } from "@/actions/meal-planner";
import { Recipe } from "@/types/recipe";
import { getRecipes } from "@/actions/recipes";
import { normaliseRecipes } from "@/lib/recipes";
import { MealRecipeTile } from "./recipe-tiles";
import { RecipeOverview } from "@/components/recipes/popups/overview";
import { Modal } from "@/components/templates/modal";

interface AddMealPopupProps {
  formRef: RefObject<HTMLFormElement | null>;
  onMealAdded: () => Promise<void>;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  setEndDate: Dispatch<SetStateAction<Date | null>>;
  updateHighlights: (startDate: Date, endDate: Date) => void;
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
}: AddMealPopupProps) => {
  const [customName, setCustomName] = useState("");
  const [inputType, setInputType] = useState<"customText" | "recipe">("recipe");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeOverview, setRecipeOverview] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const recipeSearchRef = useRef<HTMLInputElement>(null);

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

  const isDateValid = (date: Date, dateType: "start" | "end") => {
    if (dateType === "start" && date <= endDate) return true;
    if (dateType === "end" && date >= startDate) return true;

    alert("Invalid date!");
    return false;
  };

  const handleSubmit = async (formData: FormData) => {
    await addMeal({
      startDate,
      endDate,
      customText:
        inputType === "customText"
          ? String(formData.get("customText") ?? "")
          : undefined,
      recipeId:
        inputType === "recipe" ? (selectedRecipeId ?? undefined) : undefined,
    });
    await onMealAdded();
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
                }}
              />
            ))}
            <input
              type="hidden"
              name="recipeId"
              value={selectedRecipeId ?? ""}
            />
          </div>
        )}
      </form>
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
