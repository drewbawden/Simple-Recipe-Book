"use client";

import { addItemToList } from "@/actions/shopping-lists";
import { Category } from "@/app/generated/prisma/enums";
import { computeCategory } from "@/lib/category";
import { useState } from "react";
import AutocompleteInput from "../templates/autocomplete";

interface ShoppingListItemInputProps {
  refreshData: () => void;
  onEnter?: () => void;
  categoryName?: Category | null;
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
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInputSubmit(inputValue);
        }}
      >
        <AutocompleteInput
          modelType="items"
          name="productName"
          id="productName"
          className="bg-gray-500 my-5 p-1 text-white"
          placeholder="enter item"
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
