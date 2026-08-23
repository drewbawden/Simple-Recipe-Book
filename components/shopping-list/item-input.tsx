"use client";

import { addItemToList } from "@/actions/shopping-lists";
import { computeCategory } from "@/lib/category";
import { useState } from "react";
import AutocompleteInput from "../templates/autocomplete";

interface ShoppingListItemInputProps {
  refreshData: () => void;
  onEnter?: () => void;
  categoryName?: string | null;
  autoFocus?: boolean;
}
export const ShoppingListItemInput = ({
  refreshData,
  onEnter,
  categoryName = null,
  autoFocus = false,
}: ShoppingListItemInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputSubmit = async (productName: string) => {
    if (!productName) return;

    setInputValue("");

    setTimeout(async () => {
      try {
        if (categoryName === null) {
          categoryName = await computeCategory(productName);
          await addItemToList(productName, categoryName);
        } else {
          await addItemToList(productName, categoryName, true);
        }

        await refreshData();
        if (onEnter) {
          onEnter();
        }
      } catch (err) {
        console.error("Error adding item:", err);
      }
    }, 0);
  };

  return (
    <div className="w-full flex flex-row justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInputSubmit(inputValue);
        }}
        className="bg-gray-400 p-2 w-min items-center rounded"
      >
        <label
          htmlFor="productInput"
          className="text-lg font-bold text-gray-900"
        >
          Add an item
        </label>
        <AutocompleteInput
          modelType="items"
          name="productInput"
          id="productInput"
          className="bg-gray-500 p-1 text-white rounded"
          placeholder="Enter an item"
          value={inputValue}
          onChange={setInputValue}
          onEnter={handleInputSubmit}
          onBlur={handleInputSubmit}
          selectOnEnter={false}
          blurOnSelect={true}
          autoFocus={autoFocus}
        />
        <input type="submit" hidden />
      </form>
    </div>
  );
};
