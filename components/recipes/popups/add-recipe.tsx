import { useState, useEffect } from "react";
import { insertNewRecipe } from "@/actions/recipes";
import { EnumOptions } from "@/components/templates/enums";
import imageCompression from "browser-image-compression";
import Form from "next/form";
import { Modal } from "@/components/templates/modal";
import Image from "next/image";
import { AddIngredientsPopup } from "@/components/recipes/popups/add-ingredients";

export const AddRecipePopup = ({ closePopup, refreshRecipes }) => {
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    "/recipe-pictures/placeholder.png",
  );

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
    setImagePreview(URL.createObjectURL(compressed));
  };
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = (e) => {
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
          }
          await insertNewRecipe(formData);
          await refreshRecipes();
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
            {imageFile ? "Change Image" : "+ Add Image"}
          </label>
          <input
            id="recipeImage"
            name="recipeImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <hr className="h-0.5 bg-black" />

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
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="url" className="text-sm font-semibold text-gray-700">
            Recipe URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="https://example.com/recipe"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base"
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

        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3 mt-6 pb-1">
          <button
            type="submit"
            className="w-full sm:w-auto sm:px-6 py-3 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 active:bg-blue-700 shadow-md hover:shadow-lg transition text-center"
          >
            Add Recipe
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
    </div>
  );
};
