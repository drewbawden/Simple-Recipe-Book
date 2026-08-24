"use client";

import { useState, useEffect } from "react";

import { getEnums, enumType } from "@/actions/enums";
import { getCategories } from "@/actions/items";

interface enumItem {
  id: string;
  name: string;
  deletable?: boolean;
}

interface EnumOptionsProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  enumType: enumType;
  selected?: string[];
  onChange?: (selected: string[]) => void;
  selectMultiple?: boolean;
}

export const EnumOptions = ({
  enumType,
  selected = [],
  onChange,
  selectMultiple = false,
  ...inputProps
}: EnumOptionsProps) => {
  const [enums, setEnums] = useState<enumItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnums = async (enumType: enumType) => {
      try {
        const data = await getEnums(enumType);

        if (data === undefined) {
          throw new Error();
        }

        setEnums(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setLoading(false);
      }
    };

    fetchEnums(enumType);
  }, [enumType]);

  const handleChange = (optionId: string, checked: boolean) => {
    if (!onChange) return;

    if (!selectMultiple) {
      onChange(checked ? [optionId] : []);
      return;
    }

    if (checked) {
      onChange([...selected, optionId]);
    } else {
      onChange(selected.filter((id) => id !== optionId));
    }
  };

  if (loading) {
    return <p>Loading options...</p>;
  }

  return (
    <div>
      {enums.map((option) => (
        <div key={option.id} className="p-2 pb-0 bg-gray-200" key={option.id}>
          <label className="flex items-center justify-between bg-gray-200 p-1 w-full border-b-1">
            {option.name.charAt(0).toUpperCase() + option.name.substring(1)}

            <input
              {...inputProps}
              type={selectMultiple ? "checkbox" : "radio"}
              value={option.id}
              checked={selected.includes(option.id)}
              onChange={(e) => handleChange(option.id, e.target.checked)}
              name={
                selectMultiple ? inputProps.name : (inputProps.name ?? enumType)
              }
            />
          </label>
        </div>
      ))}
    </div>
  );
};

type dynamicListType = "categories";

interface DynamicOptionsProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  listType: dynamicListType;
  selected?: string;
  onChange?: (selected: string) => void;
  deletable?: string;
  onDelete?: (id: string) => void;
}

export const DynamicOptions = ({
  listType,
  selected,
  onChange,
  deletable,
  onDelete,
  ...inputProps
}: DynamicOptionsProps) => {
  const [items, setItems] = useState<enumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchItems = async () => {
    setLoading(true);
    try {
      if (listType === "categories") {
        const data = await getCategories();

        if (!data) {
          setItems([]);
          return;
        }

        const mapped = data.map((c: any) => ({
          id: c.slug,
          name: (c.displayName ?? c.slug).toString().toLowerCase(),
          deletable: deletable ? ((c as any)[deletable] ?? false) : false,
        }));

        setItems(mapped);
      }
    } catch (error) {
      console.error("Error fetching dynamic options:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, [listType, deletable]);

  const handleDelete = async (id: string) => {
    try {
      if (onDelete) {
        await Promise.resolve(onDelete(id));
      }
    } catch (error) {
      console.error("onDelete handler failed:", error);
    }

    try {
      await fetchItems();
    } catch (error) {
      console.error("Error refreshing list after delete:", error);
    }
  };

  if (loading) return <p>Loading options...</p>;

  return (
    <div className="grid grid-cols-1">
      {items.map((option) => (
        <div className="p-2 pb-0 bg-gray-200" key={option.id}>
          <label className="flex items-center justify-between bg-gray-200 p-1 w-full border-b-1">
            <span>
              {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
            </span>
            <div className="flex items-center gap-2">
              <input
                {...inputProps}
                type="radio"
                value={option.id}
                checked={selected === option.id}
                onChange={(e) => {
                  if (!onChange) return;

                  if (e.target.checked) {
                    onChange(option.id);
                  }
                }}
              />
              {option.deletable ? (
                <button
                  type="button"
                  className="inline text-red-600 font-bold border-1 rounded-4xl p-1 px-2 bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(option.id);
                  }}
                >
                  X
                </button>
              ) : null}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};
