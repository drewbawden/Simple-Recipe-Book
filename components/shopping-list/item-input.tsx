"use client";

import { addItemToList } from "@/actions/shopping-lists";
import { computeCategory } from "@/lib/category";
import { useEffect, useRef, useState } from "react";
import AutocompleteInput from "../templates/autocomplete";
import { TagSelect } from "./tag-select";
import { Tag } from "@/types/list-item";
import { getItemTags } from "@/actions/items";

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
  const [tag, setTag] = useState<Tag | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[] | null>(null);

  const handleInputSubmit = async () => {
    if (!inputValue) return;

    setInputValue("");

    setTimeout(async () => {
      try {
        if (categoryName === null) {
          categoryName = await computeCategory(inputValue);
          await addItemToList({
            itemName: inputValue,
            categorySlug: categoryName,
            tagId: tag?.id,
          });
        } else {
          await addItemToList({
            itemName: inputValue,
            categorySlug: categoryName,
            manuallyAdded: true,
            tagId: tag?.id,
          });
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

  useEffect(() => {
    const fetchList = async () => {
      try {
        const tags = await getItemTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error fetching available tags:", error);
      }
    };

    fetchList();
  }, []);

  return (
    <div className="flex flex-row justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInputSubmit();
        }}
        className="bg-gray-400 p-2 items-center rounded w-full space-y-2"
      >
        <h2 className="text-lg font-bold text-gray-900">Add an item</h2>
        <input
          type="hidden"
          name="tagValue"
          id="tagValue"
          value={tag?.id || ""}
        />
        <AutocompleteInput
          modelType="items"
          name="productInput"
          id="productInput"
          className="bg-gray-500 p-1 text-white rounded h-10 w-full"
          placeholder="Enter an item"
          value={inputValue}
          onChange={setInputValue}
          onEnter={handleInputSubmit}
          selectOnEnter={false}
          blurOnSelect={true}
          autoFocus={autoFocus}
        />
        <input type="submit" hidden />
        <div className="flex flex-row text-gray-900 gap-2">
          <TagSelect
            tag={tag}
            setTag={setTag}
            availableTags={availableTags}
            placeholder="Tag (optional)"
            containerClass="w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-1 px-3 rounded text-2xl"
          >
            +
          </button>
        </div>
      </form>
    </div>
  );
};
