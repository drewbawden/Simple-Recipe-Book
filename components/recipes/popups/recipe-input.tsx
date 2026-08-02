"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { insertNewRecipe, updateRecipe } from "@/actions/recipes";
import { EnumOptions } from "@/components/templates/enums";
import imageCompression from "browser-image-compression";
import Form from "next/form";
import { Modal } from "@/components/templates/modal";
import Image from "next/image";
import { AddIngredientsPopup } from "@/components/recipes/popups/add-ingredients";
import {
  ParsedExternalIngredient,
  Recipe,
  RecipeIngredientInput,
  RecipeInstructionInput,
} from "@/types/recipe";
import { AddInstructionsPopup } from "./add-instructions";
import { fetchExternalSite } from "@/actions/parse-external";
import { IngredientsReviewPopup } from "./ingredient-review";

interface RecipeInputPopupProps {
  closePopup: () => void;
  refreshRecipes: () => void;
  initialData?: Recipe;
}

const placeholderImagePath = "/recipe-pictures/placeholder.png";

type RecipeFormState = {
  name: string;
  types: string[];
  notes: string | null;
  url: string | null;
  totalTime: number | null;
  servings: number | null;
  ingredientsList: RecipeIngredientInput[];
  instructionList: RecipeInstructionInput[];
  imagePreview: string;
};

const getRecipeFormState = (recipe?: Recipe): RecipeFormState => ({
  name: recipe?.name ?? "",
  types: recipe?.types ?? [],
  notes: recipe?.notes ?? null,
  url: recipe?.url ?? null,
  totalTime: recipe?.totalTimeMins ?? null,
  servings: recipe?.servingSize ?? null,
  ingredientsList: (recipe?.ingredients ?? []).map((ingredient) => ({
    name: ingredient.item.name,
    quantity: `${ingredient.quantity} ${ingredient.unit ?? ""}`,
  })),
  instructionList: (recipe?.instructions ?? []).map((instruction) => ({
    stepNumber: instruction.stepNumber,
    method: instruction.method,
    category: instruction.category ?? null,
  })),
  imagePreview: recipe?.imagePath ?? placeholderImagePath,
});

const parseExternalNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const parsed =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
        ? value
        : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeExternalIngredients = (
  raw: unknown,
): ParsedExternalIngredient[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return { name: item, quantity: "", raw: item };
    }

    const external = item as any;
    const rawValue =
      external.raw ??
      external.text ??
      (typeof external === "string" ? external : "");

    return {
      name: external.name ?? external.text ?? "",
      quantity: external.quantity
        ? `${external.quantity} ${external.unit ?? ""}`
        : (external.text ?? ""),
      raw: rawValue,
    };
  });
};

const normalizeExternalInstructions = (
  raw: unknown,
): RecipeInstructionInput[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (typeof item === "string") {
      return {
        stepNumber: idx + 1,
        method: item,
        category: null,
      } as RecipeInstructionInput;
    }

    const external = item as any;
    return {
      stepNumber: external.stepNumber ?? idx + 1,
      method: external.method ?? external.text ?? "",
      category: external.category ?? null,
    } as RecipeInstructionInput;
  });
};

const getExternalImageUrl = (image: unknown): string | null => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return image[0] ?? null;
  if (typeof image === "object" && image !== null) {
    return (image as any).url ?? null;
  }
  return null;
};

export const RecipeInputPopup = ({
  closePopup,
  refreshRecipes,
  initialData,
}: RecipeInputPopupProps) => {
  const formState = getRecipeFormState(initialData);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [ingredientsList, setIngredientsList] = useState<
    RecipeIngredientInput[]
  >(formState.ingredientsList);
  const [parsedExternalIngredients, setParsedExternalIngredients] = useState<
    ParsedExternalIngredient[]
  >([]);
  const [isExternalIngredientsReviewOpen, setIsExternalIngredientsReviewOpen] =
    useState(false);
  const [instructionList, setInstructionList] = useState<
    RecipeInstructionInput[]
  >(formState.instructionList);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(formState.imagePreview);
  const [externalImageUrl, setExternalImageUrl] = useState<string | null>(null);

  const [name, setName] = useState(formState.name);
  const [types, setTypes] = useState<string[]>(formState.types);
  const [notes, setNotes] = useState(formState.notes);
  const [url, setUrl] = useState(formState.url);
  const [totalTime, setTotalTime] = useState(formState.totalTime);
  const [servings, setServings] = useState(formState.servings);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    setImageFile(compressed);
    setExternalImageUrl(null);
    setImagePreview(URL.createObjectURL(compressed));
  };
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const nextState = getRecipeFormState(initialData);

    setName(nextState.name);
    setTypes(nextState.types);
    setNotes(nextState.notes);
    setUrl(nextState.url);
    setTotalTime(nextState.totalTime);
    setServings(nextState.servings);
    setIngredientsList(nextState.ingredientsList);
    setInstructionList(nextState.instructionList);
    setImageFile(null);
    setExternalImageUrl(null);
    setImagePreview(nextState.imagePreview);
  }, [initialData]);

  const [isFetchingExternal, setIsFetchingExternal] = useState(false);
  const handleFetchExternal = async () => {
    if (!url) {
      alert("Please enter a recipe URL first");
      return;
    }
    setIsFetchingExternal(true);
    try {
      const data = await fetchExternalSite(url);
      if (!data) {
        alert("This recipe is not supported");
        return;
      }

      if (data.name) setName(data.name);

      if (data.totalTime != null) {
        setTotalTime(parseExternalNumber(data.totalTime));
      }

      if (data.servings != null) {
        setServings(parseExternalNumber(data.servings));
      }

      if (data.ingredients) {
        const parsedIngredients = normalizeExternalIngredients(
          data.ingredients,
        );
        if (parsedIngredients.length > 0) {
          setParsedExternalIngredients(parsedIngredients);
          setIsExternalIngredientsReviewOpen(true);
        }
      }

      if (data.instructions) {
        setInstructionList(normalizeExternalInstructions(data.instructions));
      }

      const imageUrl = getExternalImageUrl(data.image);
      if (imageUrl) {
        try {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const ext = (blob.type?.split("/")[1] ?? "jpg").split("+")[0];
            const file = new File([blob], `external-image.${ext}`, {
              type: blob.type || "image/jpeg",
            });
            setImageFile(file);
            setExternalImageUrl(null);
            if (imagePreview.startsWith("blob:"))
              URL.revokeObjectURL(imagePreview);
            setImagePreview(URL.createObjectURL(blob));
          } else {
            setImageFile(null);
            setExternalImageUrl(imageUrl);
            setImagePreview(imageUrl);
          }
        } catch (err) {
          setImageFile(null);
          setExternalImageUrl(imageUrl);
          setImagePreview(imageUrl);
        }
      }
    } finally {
      setIsFetchingExternal(false);
    }
  };

  const handleConfirmExternalIngredients = () => {
    setIngredientsList(parsedExternalIngredients);
    setParsedExternalIngredients([]);
    setIsExternalIngredientsReviewOpen(false);
  };

  const handleCancelExternalIngredients = () => {
    setParsedExternalIngredients([]);
    setIsExternalIngredientsReviewOpen(false);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    const checked = e.currentTarget.querySelectorAll(
      'input[name="recipeType"]:checked',
    );

    if (checked.length === 0) {
      e.preventDefault();
      alert("Please select at least one recipe type.");
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh] w-full text-gray-900">
      <Form
        action={async (formData) => {
          if (imageFile) {
            formData.set("recipeImage", imageFile);
          } else if (externalImageUrl) {
            formData.set("externalImageUrl", externalImageUrl);
          } else if (initialData?.imagePath) {
            formData.set("existingImagePath", initialData.imagePath);
          }

          if (initialData) {
            await updateRecipe(initialData.id, formData);
          } else {
            await insertNewRecipe(formData);
          }

          refreshRecipes();
          closePopup();
        }}
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto pr-1 space-y-5 text-gray-900"
      >
        <div className="relative h-64 w-full mt-6 mb-2 group overflow-hidden rounded-lg">
          <Image
            src={imagePreview}
            alt="Recipe"
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55" />
          <label
            htmlFor="recipeImage"
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center text-3xl font-semibold text-white"
          >
            {imagePreview ? "Change Image" : "+ Add Image"}
          </label>
          <input
            id="recipeImage"
            name="recipeImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <input
            type="hidden"
            name="externalImageUrl"
            value={externalImageUrl ?? ""}
          />
        </div>
        <hr className="h-0.5 bg-black" />

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="url" className="text-sm font-semibold text-gray-700">
            Recipe URL
          </label>
          <div className="flex flex-row space-x-1 justify-center items-center">
            <input
              type="url"
              id="url"
              name="url"
              placeholder="https://example.com/recipe"
              className="w-4/5 px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
              value={url ?? ""}
              onChange={(e) =>
                setUrl(e.target.value === "" ? null : e.target.value)
              }
            />
            <button
              type="button"
              onClick={handleFetchExternal}
              disabled={isFetchingExternal}
              className="w-1/5 justify-center mt-2 inline-flex items-center px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {isFetchingExternal ? "Fetching…" : "Preload?"}
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 pt-2">
          <label
            htmlFor="name"
            className="text-sm font-semibold text-gray-700 flex items-center"
          >
            Recipe name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition text-base"
            required
            value={name || ""}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="recipeType"
            className="text-sm font-semibold text-gray-700 flex items-center"
          >
            Recipe type <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full">
            <EnumOptions
              id="recipeType"
              name="recipeType"
              enumType="recipeType"
              selected={types}
              onChange={setTypes}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="servingSize"
            className="text-sm font-semibold text-gray-700"
          >
            Serving Size
          </label>
          <input
            type="number"
            id="servingSize"
            name="servingSize"
            placeholder="e.g. 4"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
            value={servings || ""}
            onChange={(e) => {
              setServings(
                e.target.value === "" ? null : Number(e.target.value),
              );
            }}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="totalTime"
            className="text-sm font-semibold text-gray-700"
          >
            Time to make (minutes)
          </label>
          <input
            type="number"
            id="totalTime"
            name="totalTime"
            placeholder="e.g. 45"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
            value={totalTime ?? ""}
            onChange={(e) =>
              setTotalTime(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="notes"
            className="text-sm font-semibold text-gray-700"
          >
            Additional notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
            value={notes ?? ""}
            onChange={(e) =>
              setNotes(e.target.value === "" ? null : e.target.value)
            }
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsIngredientsOpen(true)}
            className="w-full flex items-center justify-between border border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition shadow-sm"
          >
            <span className="text-sm font-semibold">Ingredients</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {ingredientsList.length}{" "}
              {ingredientsList.length === 1 ? "item" : "items"}
            </span>
          </button>
          <input
            type="hidden"
            name="ingredients"
            value={JSON.stringify(ingredientsList)}
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsInstructionsOpen(true)}
            className="w-full flex items-center justify-between border border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition shadow-sm"
          >
            <span className="text-sm font-semibold">Instructions</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {instructionList.length}{" "}
              {instructionList.length === 1 ? "instruction" : "instructions"}
            </span>
          </button>
          <input
            type="hidden"
            name="instructions"
            value={JSON.stringify(instructionList)}
          />
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3 mt-6 pb-1">
          <button
            type="submit"
            className="w-full sm:w-auto sm:px-6 py-3 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 active:bg-blue-700 shadow-md hover:shadow-lg transition text-center"
          >
            {initialData ? "Save Changes" : "Add Recipe"}
          </button>
          <button
            type="button"
            onClick={closePopup}
            className="w-full sm:w-auto sm:px-6 py-3 rounded-lg bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition text-center"
          >
            Cancel
          </button>
        </div>
      </Form>
      <Modal
        isOpen={isIngredientsOpen}
        onClose={() => setIsIngredientsOpen(false)}
        size="sm"
      >
        <AddIngredientsPopup
          ingredientsList={ingredientsList}
          setIngredientsList={setIngredientsList}
        />
      </Modal>
      <Modal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        size="lg"
      >
        <AddInstructionsPopup
          instructionList={instructionList}
          setInstructionList={setInstructionList}
        />
      </Modal>
      <Modal
        isOpen={isExternalIngredientsReviewOpen}
        onClose={handleCancelExternalIngredients}
        size="lg"
      >
        <IngredientsReviewPopup
          parsedIngredients={parsedExternalIngredients}
          setParsedIngredients={setParsedExternalIngredients}
          onCancel={handleCancelExternalIngredients}
          onConfirm={handleConfirmExternalIngredients}
        />
      </Modal>
    </div>
  );
};
