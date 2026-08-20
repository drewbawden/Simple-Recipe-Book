"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  AutocompleteType,
  getAutocompleteSuggestions,
} from "@/actions/autocomplete";

interface Suggestion {
  id: string | number;
  name: string;
}

interface AutocompleteInputProps {
  modelType: AutocompleteType;
  placeholder?: string;

  onSelect?: (item: Suggestion) => void;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onEnter?: (value: string) => void;

  className?: string;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;

  selectOnEnter?: boolean;
  blurOnSelect?: boolean;
  autoFocus?: boolean;
}

export default function AutocompleteInput({
  modelType,
  placeholder,
  onSelect,
  onChange,
  onBlur,
  onEnter,
  className,
  id,
  name,
  value = "",
  required = false,
  selectOnEnter = true,
  blurOnSelect = true,
  autoFocus = false,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 1) {
        try {
          const data = await getAutocompleteSuggestions(modelType, query);

          setSuggestions(data);
          setIsOpen(data.length > 0);
        } catch (err) {
          console.error("Error fetching autocomplete data:", err);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, modelType]);

  const handleChange = (newValue: string) => {
    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleSelect = (item: Suggestion) => {
    selectedRef.current = true;

    setQuery(item.name);
    setIsOpen(false);

    onChange?.(item.name);
    onSelect?.(item);

    if (blurOnSelect) {
      inputRef.current?.blur();
    }
  };

  const handleEnter = () => {
    const value = query.trim();

    if (!value) return;

    if (selectOnEnter && isOpen && suggestions.length > 0) {
      handleSelect(suggestions[0]);
      return;
    }

    onEnter?.(value);
  };

  const handleBlur = () => {
    setIsOpen(false);
    onBlur?.(query.trim());
  };

  return (
    <div className="relative text-gray-800">
      <input
        autoFocus={autoFocus}
        ref={inputRef}
        required={required}
        type="text"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleEnter();
          }

          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        onBlur={handleBlur}
        placeholder={placeholder || ""}
        className={className || ""}
        id={id || ""}
        name={name || ""}
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto divide-y divide-gray-100">
          {suggestions.map((item) => (
            <li
              key={item.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
