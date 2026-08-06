import { RecipeType } from "@/app/generated/prisma/enums";
import { filterArguments } from "@/types/recipe";
import { useState, useEffect, useRef } from "react";
import MultiAutocomplete from "../templates/multi-autocomplete";

interface MainFilterBarProps {
  refreshTable: (filter: filterArguments) => void;
}

export const MainFilterBar = ({ refreshTable }: MainFilterBarProps) => {
  const [name, setName] = useState<string>("");
  const [types, setTypes] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const refreshTableRef = useRef(refreshTable);
  useEffect(() => {
    refreshTableRef.current = refreshTable;
  }, [refreshTable]);

  useEffect(() => {
    const recipeTypes = types
      .map((type) => type.toUpperCase())
      .filter((type): type is RecipeType =>
        Object.values(RecipeType).includes(type as RecipeType),
      );

    refreshTableRef.current({
      name,
      types: recipeTypes,
      ingredients,
    });
  }, [types, ingredients, name]);

  return (
    <div className="bg-white p-2 rounded my-4 flex flex-col flex-center items-center">
      <h2 className="text-gray-900 text-2xl font-bold">Filter</h2>
      <form className="w-full grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2">
        <div className="bg-gray-100 rounded text-gray-900 space-x-2 p-1 shadow-md flex flex-row justify-between">
          <label htmlFor="nameFilter">Name</label>
          <input
            type="text"
            id="nameFilter"
            name="nameFilter"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a recipe name..."
            className="border-1 rounded p-2"
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
          Clear
        </button>
      </form>
    </div>
  );
};
