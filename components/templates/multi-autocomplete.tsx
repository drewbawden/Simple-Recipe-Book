"use client";

import { useState } from "react";
import AutocompleteInput from "@/components/templates/autocomplete";
import { AutocompleteType } from "@/actions/autocomplete";

interface Suggestion {
  id: string | number;
  name: string;
}

interface MultiAutocompleteProps {
  modelType: AutocompleteType;
  placeholder?: string;
  onSelect?: (item: Suggestion) => void;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
  name?: string;
}
export default function MultiAutocomplete({
  modelType,
  placeholder,
  onSelect,
  onChange,
  className,
  id,
  name,
}: MultiAutocompleteProps) {
  const [selected, setSelected] = useState<Suggestion[]>([]);
  const [value, setValue] = useState("");

  function handleSelect(item: Suggestion) {
    if (selected.some((x) => x.id === item.id)) {
      setValue("");
      return;
    }

    setSelected([...selected, item]);
    setValue("");
  }

  function removeItem(id: string | number) {
    setSelected(selected.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded border p-2">
        {selected.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm"
          >
            {item.name}

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="font-bold"
            >
              ×
            </button>
          </span>
        ))}

        <AutocompleteInput
          modelType={modelType}
          value={value}
          onChange={setValue}
          onSelect={handleSelect}
          className={`flex-1 min-w-32 outline-none ${className}`}
          placeholder={placeholder}
          id={id}
          name={name}
        />
      </div>

      {selected.map((item) => (
        <input
          key={item.id}
          type="hidden"
          name="recipeType"
          value={item.name}
        />
      ))}
    </div>
  );
}
