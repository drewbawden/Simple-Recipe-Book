"use client";

import { useState, useEffect } from "react";

import { getEnums, enumType } from "@/actions/enums";
import { getCategories } from "@/actions/items";

type EnumOptionsProps = {
  enumType: enumType;
  selected?: string[];
  onChange?: (selected: string[]) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

type enumItem = {
  id: string;
  name: string;
};

export const EnumOptions = ({
  enumType,
  selected,
  onChange,
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
  }, []);

  if (loading) {
    return <p>Loading options...</p>;
  }

  return (
    <div>
      {enums.map((option) => (
        <label key={option.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            value={option.id}
            checked={selected?.includes(option.id) ?? false}
            onChange={(e) => {
              if (!onChange) return;

              if (e.target.checked) {
                onChange([...selected!, option.id]);
              } else {
                onChange(selected!.filter((id) => id !== option.id));
              }
            }}
            {...inputProps}
          />
          {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
        </label>
      ))}
    </div>
  );
};

type dynamicListType = "categories";

type DynamicOptionsProps = {
  listType: dynamicListType;
  selected?: string;
  onChange?: (selected: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export const DynamicOptions = ({
  listType,
  selected,
  onChange,
  ...inputProps
}: DynamicOptionsProps) => {
  const [items, setItems] = useState<enumItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async (listType: dynamicListType) => {
      try {
        if (listType === "categories") {
          const data = await getCategories();

          if (!data) {
            setItems([]);
            setLoading(false);
            return;
          }

          const mapped = data.map((c: any) => ({
            id: c.slug,
            name: (c.displayName ?? c.slug).toString().toLowerCase(),
          }));

          setItems(mapped);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching dynamic options:", error);
        setLoading(false);
      }
    };

    fetchList(listType);
  }, [listType]);

  if (loading) return <p>Loading options...</p>;

  return (
    <div className="grid grid-cols-1">
      {items.map((option) => (
        <div className="p-2 pb-0 bg-gray-200" key={option.id}>
          <label className="flex items-center justify-between bg-gray-200 p-1 w-full border-b-1">
            {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
            <input
              {...inputProps}
              type="checkbox"
              value={option.id}
              checked={selected === option.id}
              onChange={(e) => {
                if (!onChange) return;

                if (e.target.checked) {
                  onChange(option.id);
                }
              }}
            />
          </label>
        </div>
      ))}
    </div>
  );
};
