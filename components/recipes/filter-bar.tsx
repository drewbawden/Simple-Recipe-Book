import { RecipeType } from "@/app/generated/prisma/enums";
import { filterArguments } from "@/types/recipe";
import { useState } from "react";
import MultiAutocomplete from "../templates/multi-autocomplete";

interface MainFilterBarProps {
  refreshTable: (filter: filterArguments) => void;
}
export const MainFilterBar = ({ refreshTable }: MainFilterBarProps) => {
  const [types, setTypes] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    formData.append("typeFilter", JSON.stringify(types));
    formData.append("ingredientFilter", JSON.stringify(ingredients));

    const formValues = {
      name: formData?.get("nameFilter") as string,
      types: formData?.getAll("typeFilter") as RecipeType[],
      ingredients: formData.getAll("ingredientFilter") as string[],
    };
    refreshTable(formValues);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-2 rounded m-2 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2"
    >
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="nameFilter">Name</label>
        <input
          type="text"
          id="nameFilter"
          name="nameFilter"
          placeholder="Enter a recipe name..."
          className="border-1 rounded p-1"
        />
      </div>
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="typeFilter">Type</label>
        <MultiAutocomplete
          modelType="recipeTypes"
          placeholder="Enter a recipe type..."
          setSelectedRef={setTypes}
        />
      </div>
      <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
        <label htmlFor="ingredientFilter">Ingredient(s)</label>
        <MultiAutocomplete
          modelType="items"
          placeholder="Enter an ingredient type..."
          setSelectedRef={setIngredients}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white text-base font-bold py-2 px-2 rounded hover:bg-blue-600 active:bg-blue-700"
      >
        Filter
      </button>
    </form>
  );
};
