"use client";

import { useState } from "react";
import { ChevronDown, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { toPascalCase } from "@/lib/text";
import { GiKitchenScale } from "react-icons/gi";

interface InstructionIngredientsProps {
  ingredients: Recipe["ingredients"];
}

export const InstructionIngredients = ({
  ingredients,
}: InstructionIngredientsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-sm text-gray-500 flex items-center flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-between rounded-md p-1 font-medium hover:bg-gray-100 transition-colors active:bg-gray-200 active:scale-110 border border-gray-100 shadow-sm text-gray-400"
        aria-expanded={isOpen}
      >
        <GiKitchenScale className="h-6 w-6" />
        <ChevronUpIcon
          className={` transition-transform duration-200 ${isOpen && "rotate-180"}`}
        />
      </button>

      {isOpen && (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-1 w-full">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between gap-2 border border-gray-200 rounded p-1 w-auto text-center"
            >
              <span className="flex-1">
                {toPascalCase(ingredient.item.name)}
              </span>
              <span className="bg-gray-100 p-1 rounded border border-gray-200 shadow-sm flex">
                {ingredient.quantity} {ingredient.unit ?? ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
