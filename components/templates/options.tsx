"use client";

import { useState, useEffect } from "react";

import { getEnums, enumType } from "@/actions/enums";
import { getCategories } from "@/actions/items";
import { Trash2Icon, XIcon } from "lucide-react";

type EnumOptionsProps = {
  enumType: enumType;
  selected?: string[];
  onChange?: (selected: string[]) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

type enumItem = {
  id: string;
  name: string;
  deletable?: boolean;
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
  deletable?: string;
  onDelete?: (id: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

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
            <span className="flex items-center gap-2">
              {option.deletable ? (
                <button
                  type="button"
                  className="text-red-600 font-bold border-1 rounded-4xl p-1 bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(option.id);
                  }}
                >
                  <Trash2Icon />
                </button>
              ) : null}
              {option.name.charAt(0).toUpperCase() + option.name.substring(1)}
            </span>
            <div className="flex items-center gap-2">
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
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};
