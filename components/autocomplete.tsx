'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { AutocompleteType, getAutocompleteSuggestions } from '@/actions/autocomplete';

interface Suggestion {
  id: string | number;
  name: string;
}

interface AutocompleteInputProps {
  modelType: AutocompleteType;
  placeholder?: string;
  onSelect?: (item: Suggestion) => void;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
}

export default function AutocompleteInput({ modelType, placeholder, onSelect, onChange, className, id, name, value = '' }: AutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
          setIsOpen(true);
        } catch (err) {
          console.error('Error fetching autocomplete data:', err);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, modelType]);

  const handleSelect = (item: Suggestion) => {
    setQuery(item.name);
    setIsOpen(false);
    selectedRef.current = true;
    if (onChange) {
      onChange(item.name)
    }
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <div className="relative text-gray-800">
      <input type="hidden" name={modelType} value={query} />

      <input
        required
        type="text"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);

          if (onChange) {
            onChange(e.target.value);
          }
        }}
        onBlur={() => setIsOpen(false)}
        placeholder={placeholder || ''}
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
                handleSelect(item)
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
